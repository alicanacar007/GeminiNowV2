// ============================================================================
// TYPES ALIGNED WITH SPEC.MD
// ============================================================================

// Session
export interface Session {
  id: string
  pageUrl: string
  pageTitle?: string
  status: "active" | "paused" | "completed"
  transcript: Message[]
  createdAt: Date
}

// Message (renamed from spec to match our implementation)
export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

// WebSocket Messages - Client to Server
export type ClientMessage =
  | AudioInputMessage
  | ScreenshotMessage
  | CommandMessage
  | ActionCompleteMessage

export type ServerMessage =
  | AudioOutputMessage
  | TranscriptMessage
  | ActionMessage
  | StatusMessage
  | ErrorMessage

// Audio Input (Client → Server)
export interface AudioInputMessage {
  type: "audio_input"
  data: {
    audio: string // base64 encoded
    format: "webm"
    sampleRate: number
  }
}

// Audio Output (Server → Client)
export interface AudioOutputMessage {
  type: "audio_output"
  data: {
    audio: string // base64 encoded
    duration: number
  }
}

// Screenshot (Client → Server)
export interface ScreenshotMessage {
  type: "screenshot"
  data: {
    image: string // base64 encoded PNG
    url: string
    title: string
  }
}

// Transcript (Server → Client)
export interface TranscriptMessage {
  type: "transcript"
  data: {
    speaker: "user" | "ai"
    text: string
    timestamp: string // ISO 8601
  }
}

// Actions (Server → Client)
export interface ActionMessage {
  type: "action"
  data: FormAction
}

export interface FormAction {
  actionId: string
  type: "fill_field" | "click" | "select"
  target: {
    position: { x: number; y: number }
    label?: string
    selector?: string
  }
  value: string
}

// Status (Server → Client)
export interface StatusMessage {
  type: "status"
  data: {
    status: "connected" | "listening" | "processing" | "filling"
    message?: string
  }
}

// Command (Client → Server)
export interface CommandMessage {
  type: "command"
  data: {
    command: "pause" | "resume" | "stop"
  }
}

// Action Complete (Client → Server)
export interface ActionCompleteMessage {
  type: "action_complete"
  data: {
    actionId: string
    success: boolean
    error?: string
  }
}

// Error (Server → Client)
export interface ErrorMessage {
  type: "error"
  data: {
    code: string
    message: string
    recoverable: boolean
  }
}

// Computer Use Response (Gemini Vision API)
export interface PageAnalysis {
  fields: FormField[]
  formType: string
  guidance: string
  estimatedTime?: string
}

export interface FormField {
  id: string
  label: string
  type: "text" | "email" | "tel" | "select" | "checkbox" | "textarea"
  position: { x: number; y: number }
  required: boolean
  sensitive?: boolean
}

// App state interface
export interface AppState {
  isRecording: boolean
  isConnected: boolean
  messages: Message[]
  error: string | null
  statusMessage: string
  isPlayingAudio: boolean
}

// Legacy support (for backward compatibility during migration)
export interface WebSocketMessage {
  type: string
  content?: string
  audio?: string
  message?: string
}

