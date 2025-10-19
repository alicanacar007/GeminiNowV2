import { useCallback, useRef, useEffect } from "react"
import { useApp } from "~contexts/AppContext"
import { useWebSocket } from "./useWebSocket"

export const useAudioRecording = () => {
  const {
    isRecording,
    setIsRecording,
    mediaRecorderRef,
    audioStreamRef,
    setError,
    setStatusMessage
  } = useApp()

  const { sendAudioChunk } = useWebSocket()
  const audioChunksRef = useRef<Blob[]>([])
  const permissionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Check if permission was granted (from the permission tab)
  const checkMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      const result = await chrome.storage.local.get('micGranted')
      return result.micGranted === true
    } catch (err) {
      console.error("[useAudioRecording] Failed to check permission:", err)
      return false
    }
  }, [])

  // Open permission page in a new tab
  const openPermissionPage = useCallback(async () => {
    try {
      console.log("[useAudioRecording] Opening permission page...")
      const url = chrome.runtime.getURL("tabs/permission.html")
      await chrome.tabs.create({ url })
      
      setStatusMessage("Opening permission page...")
      setError("Please grant microphone access in the new tab.")
      
      // Start checking if permission was granted
      if (permissionCheckIntervalRef.current) {
        clearInterval(permissionCheckIntervalRef.current)
      }
      
      permissionCheckIntervalRef.current = setInterval(async () => {
        const granted = await checkMicrophonePermission()
        if (granted) {
          console.log("[useAudioRecording] Permission granted!")
          setError(null)
          setStatusMessage("Microphone permission granted! Click 'Start Recording' to begin.")
          
          if (permissionCheckIntervalRef.current) {
            clearInterval(permissionCheckIntervalRef.current)
            permissionCheckIntervalRef.current = null
          }
        }
      }, 500)
      
    } catch (err) {
      console.error("[useAudioRecording] Failed to open permission page:", err)
      setError("Failed to open permission page")
    }
  }, [checkMicrophonePermission, setError, setStatusMessage])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (permissionCheckIntervalRef.current) {
        clearInterval(permissionCheckIntervalRef.current)
      }
    }
  }, [])

  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      // First check if permission was already granted via the permission page
      const alreadyGranted = await checkMicrophonePermission()
      
      if (!alreadyGranted) {
        console.log("[useAudioRecording] Permission not yet granted, opening permission page...")
        await openPermissionPage()
        return false
      }
      
      setStatusMessage("Requesting microphone access...")
      console.log("[useAudioRecording] Permission previously granted, requesting stream...")
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      })
      
      console.log("[useAudioRecording] ✓ Media stream acquired!")
      audioStreamRef.current = stream
      setError(null)
      setStatusMessage("Ready to record")
      return true
    } catch (err) {
      let errorMessage = "Microphone access denied"
      let helpText = ""
      
      if (err instanceof DOMException) {
        switch (err.name) {
          case "NotAllowedError":
            errorMessage = "Microphone access denied."
            helpText = "Opening permission page..."
            console.error("[useAudioRecording] NotAllowedError - Opening permission page")
            // Clear the permission flag and open permission page
            await chrome.storage.local.remove('micGranted')
            await openPermissionPage()
            break
          case "NotFoundError":
            errorMessage = "No microphone found. Please connect a microphone and try again."
            console.error("[useAudioRecording] NotFoundError - No microphone device found")
            break
          case "NotReadableError":
            errorMessage = "Microphone is already in use by another application. Close other apps using the microphone."
            console.error("[useAudioRecording] NotReadableError - Microphone in use")
            break
          case "OverconstrainedError":
            errorMessage = "Could not access microphone with the requested settings."
            console.error("[useAudioRecording] OverconstrainedError - Constraints not supported")
            break
          default:
            errorMessage = `Microphone error: ${err.message}`
            console.error("[useAudioRecording] Unknown error:", err)
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
        console.error("[useAudioRecording] Error:", err)
      }
      
      setError(helpText || errorMessage)
      setStatusMessage("Microphone access required")
      return false
    }
  }, [audioStreamRef, setError, setStatusMessage, checkMicrophonePermission, openPermissionPage])

  const startRecording = useCallback(async () => {
    try {
      // Request permission if not already granted
      if (!audioStreamRef.current) {
        const granted = await requestMicrophonePermission()
        if (!granted) return
      }

      const stream = audioStreamRef.current!

      // Create MediaRecorder with optimal settings for speech
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
        audioBitsPerSecond: 16000
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
          
          // Send audio chunk to backend in real-time
          sendAudioChunk(event.data)
          
          console.log("Audio chunk sent:", event.data.size, "bytes")
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm"
        })
        console.log("Recording stopped. Total size:", audioBlob.size, "bytes")
        setStatusMessage("Processing complete. Ready for next recording.")
        audioChunksRef.current = []
      }

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event)
        setError("Recording error occurred")
        setStatusMessage("Recording error")
      }

      // Start recording with 100ms chunks for real-time streaming
      mediaRecorder.start(100)
      setIsRecording(true)
      setStatusMessage("Listening... Speak now")
      console.log("Recording started")
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start recording"
      setError(errorMessage)
      setStatusMessage("Failed to start recording")
      console.error("Recording error:", err)
    }
  }, [
    audioStreamRef,
    mediaRecorderRef,
    requestMicrophonePermission,
    sendAudioChunk,
    setError,
    setIsRecording,
    setStatusMessage
  ])

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setStatusMessage("Processing recording...")
      console.log("Stopping recording...")
    }
  }, [mediaRecorderRef, setIsRecording, setStatusMessage])

  const cleanup = useCallback(() => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop())
      audioStreamRef.current = null
    }
  }, [audioStreamRef])

  return {
    isRecording,
    startRecording,
    stopRecording,
    requestMicrophonePermission,
    cleanup
  }
}

