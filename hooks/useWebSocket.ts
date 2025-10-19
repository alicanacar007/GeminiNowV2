import { useEffect, useCallback } from "react"
import { useApp } from "~contexts/AppContext"
import type { WebSocketMessage } from "~types"

const WS_URL = process.env.PLASMO_PUBLIC_WS_URL || "ws://localhost:8080"

export const useWebSocket = () => {
  const { wsRef, setIsConnected, addMessage, setError, setStatusMessage, setIsPlayingAudio } = useApp()

  const connect = useCallback(() => {
    // Prevent multiple connection attempts
    if (wsRef.current?.readyState === WebSocket.OPEN || 
        wsRef.current?.readyState === WebSocket.CONNECTING) {
      console.log("WebSocket already connected or connecting")
      return
    }

    try {
      setStatusMessage("Connecting to server...")
      const ws = new WebSocket(WS_URL)

      ws.onopen = () => {
        console.log("WebSocket connected")
        setIsConnected(true)
        setStatusMessage("Connected! Ready to start recording.")
        setError(null)
      }

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data)
          console.log("Received message:", data)

          switch (data.type) {
            case "transcript":
              // User's speech transcript
              if (data.content) {
                addMessage({
                  role: "user",
                  content: data.content
                })
              }
              break

            case "response":
              // AI's text response
              if (data.content) {
                addMessage({
                  role: "assistant",
                  content: data.content
                })
              }
              break

            case "audio_response":
              // AI's audio response (base64 encoded)
              if (data.audio) {
                playAudioResponse(data.audio, setIsPlayingAudio)
              }
              break

            case "error":
              setError(data.message || "Unknown error occurred")
              setStatusMessage("Error occurred")
              break

            case "status":
              setStatusMessage(data.message || "Status update")
              break

            default:
              console.warn("Unknown message type:", data.type)
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err)
        }
      }

      ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        setError("Connection error occurred")
        setStatusMessage("Connection failed")
        setIsConnected(false)
      }

      ws.onclose = () => {
        console.log("WebSocket disconnected")
        setIsConnected(false)
        setStatusMessage("Disconnected from server")
      }

      wsRef.current = ws
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect"
      setError(errorMessage)
      setStatusMessage("Failed to connect to server")
      console.error("WebSocket connection error:", err)
    }
  }, [wsRef, setIsConnected, addMessage, setError, setStatusMessage])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
      setIsConnected(false)
      setStatusMessage("Click to start voice assistant")
    }
  }, [wsRef, setIsConnected, setStatusMessage])

  const sendAudioChunk = useCallback((audioBlob: Blob) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Convert blob to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64Audio = reader.result as string
        wsRef.current?.send(
          JSON.stringify({
            type: "audio",
            audio: base64Audio.split(",")[1], // Remove data:audio/webm;base64, prefix
            format: "webm",
            sampleRate: 16000
          })
        )
      }
      reader.readAsDataURL(audioBlob)
    } else {
      console.warn("WebSocket not connected, cannot send audio")
    }
  }, [wsRef])

  const sendMessage = useCallback((type: string, data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, ...data }))
    } else {
      console.warn("WebSocket not connected, cannot send message")
    }
  }, [wsRef])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    connect,
    disconnect,
    sendAudioChunk,
    sendMessage
  }
}

// Helper function to play audio response from base64
const playAudioResponse = (base64Audio: string, setIsPlayingAudio: (playing: boolean) => void) => {
  try {
    // TTS API returns MP3 format
    const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`)
    
    audio.onplay = () => {
      setIsPlayingAudio(true)
    }
    
    audio.onended = () => {
      setIsPlayingAudio(false)
    }
    
    audio.onerror = () => {
      setIsPlayingAudio(false)
    }
    
    audio.play().catch((err) => {
      console.error("Failed to play audio:", err)
      setIsPlayingAudio(false)
    })
  } catch (err) {
    console.error("Failed to create audio:", err)
    setIsPlayingAudio(false)
  }
}

