import React, { useRef, useEffect } from "react"
import { useApp } from "~contexts/AppContext"
import type { Message } from "~types"

export const TranscriptDisplay: React.FC = () => {
  const { messages, clearMessages } = useApp()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="plasmo-h-full plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-p-8 plasmo-text-center">
        <div className="plasmo-w-20 plasmo-h-20 plasmo-bg-gradient-to-br plasmo-from-indigo-100 plasmo-to-purple-100 plasmo-rounded-full plasmo-flex plasmo-items-center plasmo-justify-center plasmo-mb-4 plasmo-shadow-inner">
          <span className="plasmo-text-4xl">💬</span>
        </div>
        <p className="plasmo-text-gray-500 plasmo-text-sm plasmo-font-medium plasmo-mb-1">
          No conversation yet
        </p>
        <p className="plasmo-text-gray-400 plasmo-text-xs plasmo-max-w-[200px]">
          Click the button below to start recording and begin your conversation
        </p>
      </div>
    )
  }

  return (
    <div className="plasmo-relative plasmo-h-full plasmo-flex plasmo-flex-col">
      <div
        ref={scrollRef}
        className="plasmo-flex-1 plasmo-overflow-y-auto plasmo-p-4 plasmo-space-y-3 plasmo-scrollbar-thin plasmo-scrollbar-thumb-indigo-200 plasmo-scrollbar-track-transparent">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`plasmo-flex plasmo-animate-in plasmo-fade-in plasmo-slide-in-from-bottom-2 plasmo-duration-300 ${
              message.role === "user" ? "plasmo-justify-end" : "plasmo-justify-start"
            }`}
            style={{ animationDelay: `${index * 50}ms` }}>
            <div
              className={`plasmo-group plasmo-max-w-[85%] plasmo-rounded-2xl plasmo-px-4 plasmo-py-3 plasmo-shadow-sm plasmo-transition-all plasmo-duration-200 hover:plasmo-shadow-md ${
                message.role === "user"
                  ? "plasmo-bg-gradient-to-br plasmo-from-indigo-500 plasmo-to-purple-600 plasmo-text-white plasmo-rounded-br-sm"
                  : "plasmo-bg-white plasmo-text-gray-800 plasmo-border plasmo-border-gray-200 plasmo-rounded-bl-sm"
              }`}>
              <div className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-mb-1">
                <span className={`plasmo-text-xs plasmo-font-semibold plasmo-uppercase plasmo-tracking-wider ${
                  message.role === "user" 
                    ? "plasmo-text-indigo-100" 
                    : "plasmo-text-indigo-600"
                }`}>
                  {message.role === "user" ? "👤 You" : "🤖 AI"}
                </span>
              </div>
              <p className={`plasmo-text-sm plasmo-leading-relaxed plasmo-whitespace-pre-wrap ${
                message.role === "user" ? "plasmo-text-white" : "plasmo-text-gray-700"
              }`}>
                {message.content}
              </p>
              <span className={`plasmo-text-xs plasmo-mt-2 plasmo-block plasmo-transition-opacity plasmo-duration-200 ${
                message.role === "user" 
                  ? "plasmo-text-indigo-200 plasmo-opacity-60 group-hover:plasmo-opacity-100" 
                  : "plasmo-text-gray-400 plasmo-opacity-60 group-hover:plasmo-opacity-100"
              }`}>
                {new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {messages.length > 0 && (
        <div className="plasmo-flex plasmo-justify-center plasmo-p-3 plasmo-border-t plasmo-border-gray-200 plasmo-bg-white plasmo-bg-opacity-40 plasmo-backdrop-blur-sm">
          <button
            onClick={clearMessages}
            className="plasmo-group plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-px-3 plasmo-py-1.5 plasmo-text-xs plasmo-font-medium plasmo-text-gray-600 hover:plasmo-text-red-600 plasmo-bg-white plasmo-rounded-lg plasmo-shadow-sm hover:plasmo-shadow plasmo-transition-all plasmo-duration-200 hover:plasmo-scale-105 active:plasmo-scale-95">
            <span className="group-hover:plasmo-rotate-12 plasmo-transition-transform plasmo-duration-200">🗑️</span>
            <span>Clear conversation</span>
          </button>
        </div>
      )}
    </div>
  )
}

