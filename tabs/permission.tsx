import { useEffect, useState } from "react"

import "./permission.css"

export default function PermissionPage() {
  const [status, setStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle")
  const [error, setError] = useState<string>("")

  useEffect(() => {
    // Auto-request on load
    handleRequestPermission()
  }, [])

  const handleRequestPermission = async () => {
    setStatus("requesting")
    setError("")
    
    try {
      console.log("[Permission] Requesting microphone access...")
      
      // Request microphone access - this will show the permission prompt
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      
      console.log("[Permission] ✓ Microphone access granted!")
      
      // Stop the stream immediately - we just needed the permission
      stream.getTracks().forEach(track => track.stop())
      
      // Store permission status
      await chrome.storage.local.set({ micGranted: true })
      console.log("[Permission] Permission status saved to storage")
      
      setStatus("granted")
      
      // Close this tab after a short delay
      setTimeout(() => {
        window.close()
      }, 1500)
      
    } catch (err) {
      console.error("[Permission] Failed to get microphone access:", err)
      
      let errorMessage = "Permission denied"
      
      if (err instanceof DOMException) {
        switch (err.name) {
          case "NotAllowedError":
            errorMessage = "You denied microphone access. Please click 'Allow' when Chrome asks for permission."
            break
          case "NotFoundError":
            errorMessage = "No microphone found. Please connect a microphone and try again."
            break
          case "NotReadableError":
            errorMessage = "Microphone is already in use by another application."
            break
          case "OverconstrainedError":
            errorMessage = "Could not access microphone with the requested settings."
            break
          default:
            errorMessage = err.message || "Unknown error occurred"
        }
      }
      
      setError(errorMessage)
      setStatus("denied")
    }
  }

  return (
    <div className="permission-container">
      <div className="permission-card">
        <div className="header">
          <div className="icon-wrapper">
            <img 
              src="/logo.png" 
              alt="Google Now" 
              className="logo"
            />
          </div>
          <h1 className="title">GemiNow</h1>
          <p className="subtitle">Voice Assistant</p>
        </div>

        <div className="content">
          {status === "idle" && (
            <div className="status-section">
              <p className="message">Preparing to request microphone access...</p>
            </div>
          )}

          {status === "requesting" && (
            <div className="status-section">
              <div className="spinner"></div>
              <p className="message">Requesting microphone access...</p>
              <p className="help-text">
                Please click <strong>"Allow"</strong> when Chrome asks for permission.
              </p>
            </div>
          )}

          {status === "granted" && (
            <div className="status-section success">
              <div className="success-icon">✓</div>
              <p className="message success-message">Permission granted!</p>
              <p className="help-text">
                You can now use voice recording in GemiNow. This tab will close automatically.
              </p>
            </div>
          )}

          {status === "denied" && (
            <div className="status-section error">
              <div className="error-icon">⚠️</div>
              <p className="message error-message">Permission Denied</p>
              <p className="error-text">{error}</p>
              <button className="retry-button" onClick={handleRequestPermission}>
                Try Again
              </button>
              <div className="help-section">
                <p className="help-title">How to fix this:</p>
                <ol className="help-list">
                  <li>Check your system microphone settings</li>
                  <li>In Chrome, go to Settings → Privacy and security → Site Settings → Microphone</li>
                  <li>Make sure Chrome has permission to access your microphone</li>
                  <li>Click "Try Again" above</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

