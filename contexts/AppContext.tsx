import React, { createContext, useContext, useState, useRef } from "react"
import type { ReactNode } from "react"
import type { Message, AppState } from "~types"

interface AppContextType extends AppState {
  setIsRecording: (isRecording: boolean) => void
  setIsConnected: (isConnected: boolean) => void
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void
  clearMessages: () => void
  setError: (error: string | null) => void
  setStatusMessage: (message: string) => void
  setIsPlayingAudio: (isPlaying: boolean) => void
  wsRef: React.MutableRefObject<WebSocket | null>
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>
  audioStreamRef: React.MutableRefObject<MediaStream | null>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within AppProvider")
  }
  return context
}

interface AppProviderProps {
  children: ReactNode
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState("Click to start voice assistant")
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  // Refs for media handling and WebSocket
  const wsRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)

  const addMessage = (message: Omit<Message, "id" | "timestamp">) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      ...message
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const clearMessages = () => {
    setMessages([])
  }

  const value: AppContextType = {
    isRecording,
    isConnected,
    messages,
    error,
    statusMessage,
    isPlayingAudio,
    setIsRecording,
    setIsConnected,
    addMessage,
    clearMessages,
    setError,
    setStatusMessage,
    setIsPlayingAudio,
    wsRef,
    mediaRecorderRef,
    audioStreamRef
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

