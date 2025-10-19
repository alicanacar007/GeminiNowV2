import { useEffect, useState } from "react"

import { TranscriptDisplay } from "~components/TranscriptDisplay"
import { AppProvider, useApp } from "~contexts/AppContext"
import { useAudioRecording } from "~hooks/useAudioRecording"
import { useWebSocket } from "~hooks/useWebSocket"

import "./style.css"

function PopupContent() {
  const { isRecording, isConnected, error, statusMessage, isPlayingAudio } = useApp()
  const { startRecording, stopRecording, cleanup } = useAudioRecording()
  const { connect, disconnect } = useWebSocket()
  const [inputValue, setInputValue] = useState("")

  // Connect to WebSocket on mount (only once!)
  useEffect(() => {
    connect()
    return () => {
      cleanup()
      disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty deps array - only run once on mount

  const handleRecordingToggle = async () => {
    if (isRecording) {
      stopRecording()
    } else {
      // Always call startRecording immediately to preserve user gesture
      // The WebSocket connection will be handled separately if needed
      if (!isConnected) {
        // Connect in background - don't wait
        connect()
      }
      // Start recording immediately (user gesture must not be broken)
      startRecording()
    }
  }

  const handleActionClick = (action: string) => {
    // Handle action button clicks
    console.log(`Action clicked: ${action}`)
  }

  const handleSend = () => {
    if (inputValue.trim()) {
      // Handle send action
      console.log(`Sending: ${inputValue}`)
      setInputValue("")
    }
  }

  return (
    <div className="plasmo-w-full plasmo-h-screen plasmo-bg-white plasmo-flex plasmo-flex-col plasmo-overflow-hidden">
      {/* Google Now Header */}
      <div className="plasmo-flex plasmo-items-center plasmo-justify-end plasmo-p-4 plasmo-border-b plasmo-border-gray-100">
        <div className="plasmo-flex plasmo-items-center plasmo-gap-2">
          {/* Google Now Logo */}
          <div className="plasmo-flex plasmo-items-center plasmo-gap-2">
            <img 
              src="/logo.png" 
              alt="Google Now" 
              className="plasmo-h-6 plasmo-w-auto"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="plasmo-flex-1 plasmo-p-6 plasmo-flex plasmo-flex-col plasmo-gap-6">
        {/* Main Instruction */}
        <div className="plasmo-text-center">
          <p className="plasmo-text-gray-700 plasmo-text-base plasmo-leading-relaxed">
            Ask me anything, or use voice commands to interact with the current page.
          </p>
        </div>

        {/* Example Commands */}
        <div className="plasmo-text-center">
          <p className="plasmo-text-gray-600 plasmo-text-sm plasmo-mb-3">Example commands:</p>
          <div className="plasmo-text-gray-600 plasmo-text-sm plasmo-space-y-1">
            <p>"Summarize this page"</p>
            <p>"Translate this to Spanish"</p>
            <p>"What's the weather like?"</p>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="plasmo-grid plasmo-grid-cols-2 plasmo-gap-3">
          <button 
            onClick={() => handleActionClick('summarize')}
            className="google-button plasmo-bg-blue-50 plasmo-border plasmo-border-blue-200 plasmo-rounded-lg plasmo-p-3 plasmo-text-gray-700 plasmo-text-sm plasmo-font-medium hover:plasmo-bg-blue-100 plasmo-transition-colors">
            Summarize
          </button>
          <button 
            onClick={() => handleActionClick('translate')}
            className="google-button plasmo-bg-white plasmo-border plasmo-border-gray-200 plasmo-rounded-lg plasmo-p-3 plasmo-text-gray-700 plasmo-text-sm plasmo-font-medium hover:plasmo-bg-gray-50 plasmo-transition-colors">
            Translate
          </button>
          <button 
            onClick={() => handleActionClick('fill-form')}
            className="google-button plasmo-bg-white plasmo-border plasmo-border-gray-200 plasmo-rounded-lg plasmo-p-3 plasmo-text-gray-700 plasmo-text-sm plasmo-font-medium hover:plasmo-bg-gray-50 plasmo-transition-colors">
            Fill Form
          </button>
          <button 
            onClick={() => handleActionClick('copy')}
            className="google-button plasmo-bg-white plasmo-border plasmo-border-gray-200 plasmo-rounded-lg plasmo-p-3 plasmo-text-gray-700 plasmo-text-sm plasmo-font-medium hover:plasmo-bg-gray-50 plasmo-transition-colors">
            Copy
          </button>
        </div>

        {/* Input Field */}
        <div className="plasmo-relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your question here..."
            className="google-input plasmo-w-full plasmo-px-4 plasmo-py-3 plasmo-bg-gray-100 plasmo-border-0 plasmo-rounded-lg plasmo-text-gray-700 plasmo-text-sm plasmo-placeholder-gray-500 plasmo-shadow-sm focus:plasmo-outline-none focus:plasmo-bg-white"
          />
          <button
            onClick={handleRecordingToggle}
            className="plasmo-absolute plasmo-right-2 plasmo-top-1/2 plasmo-transform plasmo--translate-y-1/2 plasmo-w-8 plasmo-h-8 plasmo-bg-gray-200 plasmo-rounded-full plasmo-flex plasmo-items-center plasmo-justify-center plasmo-text-gray-600 hover:plasmo-bg-gray-300 plasmo-transition-colors">
            <svg className="plasmo-w-4 plasmo-h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </button>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          className="google-button plasmo-w-full plasmo-bg-blue-500 plasmo-text-white plasmo-py-3 plasmo-px-4 plasmo-rounded-lg plasmo-font-medium hover:plasmo-bg-blue-600 plasmo-transition-colors plasmo-flex plasmo-items-center plasmo-justify-center plasmo-gap-2">
          <span>Send</span>
          <svg className="plasmo-w-4 plasmo-h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>

        {/* Error Display */}
        {error && (
          <div className="plasmo-p-3 plasmo-bg-red-50 plasmo-border plasmo-border-red-200 plasmo-rounded-lg plasmo-text-red-700 plasmo-text-sm">
            {error}
          </div>
        )}

        {/* Status Message */}
        {statusMessage && (
          <div className="plasmo-text-center plasmo-text-gray-600 plasmo-text-sm">
            {statusMessage}
          </div>
        )}

        {/* Audio Playing Indicator */}
        {isPlayingAudio && (
          <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-gap-2 plasmo-p-3 plasmo-bg-blue-50 plasmo-border plasmo-border-blue-200 plasmo-rounded-lg plasmo-text-blue-700 plasmo-text-sm plasmo-font-medium">
            <div className="plasmo-flex plasmo-gap-1">
              <div className="plasmo-w-2 plasmo-h-2 plasmo-bg-blue-500 plasmo-rounded-full plasmo-animate-pulse"></div>
              <div className="plasmo-w-2 plasmo-h-2 plasmo-bg-blue-500 plasmo-rounded-full plasmo-animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="plasmo-w-2 plasmo-h-2 plasmo-bg-blue-500 plasmo-rounded-full plasmo-animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span>AI is speaking...</span>
          </div>
        )}

        {/* Transcript Area - Hidden by default, can be toggled */}
        <div className="plasmo-mt-4">
          <TranscriptDisplay />
        </div>
      </div>
    </div>
  )
}

function IndexPopup() {
  return (
    <AppProvider>
      <PopupContent />
    </AppProvider>
  )
}

export default IndexPopup

