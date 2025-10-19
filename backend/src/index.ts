import "dotenv/config"

import { randomUUID } from "node:crypto"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { TextToSpeechClient } from "@google-cloud/text-to-speech"
import { WebSocketServer, type WebSocket, type RawData } from "ws"
import { z } from "zod"

import {
  PageContextManager,
  type PageContextInput
} from "./page-context-manager"

const PORT = Number(process.env.WS_PORT || 8080)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest"

const FLUSH_DEBOUNCE_MS = Number(process.env.GEMINI_FLUSH_INTERVAL_MS || 750)

if (!GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY is not set. Responses will use mock data.")
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null
const generativeModel = genAI ? genAI.getGenerativeModel({ model: GEMINI_MODEL }) : null

// TTS client - using API key authentication
const ttsClient = GEMINI_API_KEY ? new TextToSpeechClient({
  apiKey: GEMINI_API_KEY
}) : null

const incomingAudioSchema = z.object({
  type: z.literal("audio"),
  audio: z.string(),
  /** optional metadata from extension */
  format: z.string().optional(),
  sampleRate: z.number().optional(),
  conversationId: z.string().optional()
})

const pageContextSchema = z.object({
  type: z.literal("page_context"),
  data: z.object({
    url: z.string(),
    title: z.string().optional(),
    guidance: z.string().optional(),
    fields: z
      .array(
        z.object({
          id: z.string().optional(),
          label: z.string(),
          type: z.string().optional(),
          required: z.boolean().optional(),
          selector: z.string().optional(),
          value: z.string().optional()
        })
      )
      .optional()
  })
})

const incomingMessageSchema = z.union([incomingAudioSchema, pageContextSchema])

const statusPayload = {
  type: "status" as const,
  message: "Connected to GemiNow backend",
  role: "system"
}

type AudioMessage = z.infer<typeof incomingAudioSchema>
type PageContextMessage = z.infer<typeof pageContextSchema>

type ClientContext = {
  id: string
  socket: WebSocket
  lastHeardAt: number
}

type GeminiContent = {
  role: "user" | "model"
  parts: Array<{ text: string }>
}

type SessionState = {
  pendingChunks: Buffer[]
  flushTimeout?: NodeJS.Timeout
  isProcessing: boolean
  history: GeminiContent[]
  conversationId?: string
  pageContextPrompt?: string
}

const clients = new Map<WebSocket, ClientContext>()
const sessionState = new Map<string, SessionState>()
const pageContextManager = new PageContextManager()

const wss = new WebSocketServer({ port: PORT })

wss.on("connection", (socket: WebSocket) => {
  const context: ClientContext = {
    id: randomUUID(),
    socket,
    lastHeardAt: Date.now()
  }
  clients.set(socket, context)

  console.log(`✅ Client connected: ${context.id}`)
  socket.send(JSON.stringify(statusPayload))

  socket.on("message", async (raw: RawData) => {
    try {
      const parsed = JSON.parse(raw.toString())

      if (parsed?.type === "ping") {
        socket.send(
          JSON.stringify({
            type: "pong",
            timestamp: Date.now()
          })
        )
        return
      }

      const incomingMessage = incomingMessageSchema.safeParse(parsed)
      if (!incomingMessage.success) {
        console.warn("⚠️ Unhandled message", parsed)
        socket.send(
          JSON.stringify({
            type: "error",
            message: "Unsupported message format"
          })
        )
        return
      }

      if (incomingMessage.data.type === "audio") {
        await handleAudioMessage(context, incomingMessage.data)
        return
      }

      if (incomingMessage.data.type === "page_context") {
        handlePageContextMessage(context, incomingMessage.data)
        return
      }
    } catch (err) {
      console.error("❌ Failed to process message", err)
      socket.send(
        JSON.stringify({
          type: "error",
          message: err instanceof Error ? err.message : "Unknown error"
        })
      )
    }
  })

  socket.on("close", () => {
    clients.delete(socket)
    pageContextManager.clear(context.id)
    console.log(`🔌 Client disconnected: ${context.id}`)
  })

  socket.on("error", (err: Error) => {
    console.error(`❌ WebSocket error for client ${context.id}`, err)
  })
})

wss.on("listening", () => {
  console.log(`🟢 GemiNow backend listening on ws://localhost:${PORT}`)
})

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)

function shutdown() {
  console.log("Shutting down WebSocket server...")
  pageContextManager.clearAll()
  wss.close(() => process.exit(0))
}

async function handleAudioMessage(context: ClientContext, message: AudioMessage) {
  const { audio, conversationId } = message
  context.lastHeardAt = Date.now()

  const audioBuffer = Buffer.from(audio, "base64")

  console.log(
    `🎤 Received audio chunk from ${context.id} (${audioBuffer.length} bytes)`
  )

  if (!GEMINI_API_KEY || !generativeModel) {
    sendMockResponse(context.socket, audioBuffer)
    return
  }

  const state = ensureSessionState(context.id)
  state.conversationId = conversationId ?? state.conversationId
  state.pendingChunks.push(audioBuffer)

  scheduleFlush(context, state)
}

async function flushAudioBuffer(context: ClientContext, state: SessionState) {
  if (!generativeModel) {
    return
  }

  if (state.isProcessing) {
    return
  }

  const chunk = Buffer.concat(state.pendingChunks)
  state.pendingChunks = []

  if (chunk.length === 0) {
    return
  }

  state.isProcessing = true

  try {
    const transcript = await transcribeWithGemini(chunk, state.conversationId)

    if (transcript) {
      sendTranscript(context.socket, transcript)
      state.history.push({ role: "user", parts: [{ text: transcript }] })

      const assistantReply = await generateAssistantReply(state)
      if (assistantReply) {
        state.history.push({ role: "model", parts: [{ text: assistantReply }] })

        const audioResponse = await textToSpeech(assistantReply)
        if (audioResponse) {
          sendAudioResponse(context.socket, audioResponse)
        } else {
          sendAssistantResponse(context.socket, assistantReply)
        }
      }
    }
  } catch (err) {
    console.error("❌ Gemini processing failed", err)
    context.socket.send(
      JSON.stringify({
        type: "error",
        message: err instanceof Error ? err.message : "Gemini processing failed"
      })
    )
  } finally {
    state.isProcessing = false

    if (state.pendingChunks.length > 0) {
      scheduleFlush(context, state)
    }
  }
}

async function transcribeWithGemini(audioBuffer: Buffer, conversationId?: string) {
  if (!generativeModel) {
    return null
  }

  const prompt = conversationId
    ? `Transcribe the caller's audio for conversation ${conversationId}. Respond with only the words spoken.`
    : "Transcribe the caller's audio. Respond with only the words spoken."

  const result = await generativeModel.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: audioBuffer.toString("base64"),
              mimeType: "audio/webm;codecs=opus"
            }
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "text/plain"
    }
  })

  const transcript = result.response?.text()?.trim()
  return transcript && transcript.length > 0 ? transcript : null
}

async function generateAssistantReply(state: SessionState) {
  if (!generativeModel) {
    return null
  }

  const contents = state.pageContextPrompt
    ? [
        {
          role: "user" as const,
          parts: [{ text: state.pageContextPrompt }]
        },
        ...state.history
      ]
    : state.history

  const result = await generativeModel.generateContent({
    contents,
    generationConfig: {
      responseMimeType: "text/plain"
    }
  })

  const responseText = result.response?.text()?.trim()
  return responseText && responseText.length > 0 ? responseText : null
}

async function textToSpeech(text: string): Promise<string | null> {
  if (!ttsClient || !GEMINI_API_KEY) {
    return null
  }

  try {
    const [response] = await ttsClient.synthesizeSpeech({
      input: { text },
      voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
      audioConfig: { audioEncoding: "MP3" }
    })

    if (response.audioContent) {
      return Buffer.from(response.audioContent).toString("base64")
    }
  } catch (err) {
    console.error("❌ TTS failed", err)
  }

  return null
}

function ensureSessionState(clientId: string): SessionState {
  if (!sessionState.has(clientId)) {
    sessionState.set(clientId, {
      pendingChunks: [],
      flushTimeout: undefined,
      isProcessing: false,
      history: [
        {
          role: "user",
          parts: [
            {
              text:
                "You are GemiNow, an expert form-filling guide. Provide step-by-step help, explain what each field needs, reference page context details, and surface any required or sensitive fields. Confirm information before submitting actions."
            }
          ]
        },
        {
          role: "model",
          parts: [{ text: "Understood. I'm ready to help." }]
        }
      ],
      conversationId: undefined,
      pageContextPrompt: undefined
    })
  }

  return sessionState.get(clientId)!
}

function handlePageContextMessage(context: ClientContext, message: PageContextMessage) {
  const payload = message.data

  try {
    const sessionId = context.id
    const contextInput: PageContextInput = {
      url: payload.url,
      title: payload.title,
      guidance: payload.guidance,
      fields: payload.fields
    }

    pageContextManager.update(sessionId, contextInput)
    const prompt = pageContextManager.getPrompt(sessionId)

    const state = ensureSessionState(sessionId)
    state.pageContextPrompt = prompt ?? undefined

    context.socket.send(
      JSON.stringify({
        type: "status",
        message: "Page context updated",
        role: "system"
      })
    )
  } catch (err) {
    console.error("❌ Failed to update page context", err)
    context.socket.send(
      JSON.stringify({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to update page context"
      })
    )
  }
}

function scheduleFlush(context: ClientContext, state: SessionState) {
  if (state.flushTimeout) {
    clearTimeout(state.flushTimeout)
  }

  state.flushTimeout = setTimeout(() => {
    state.flushTimeout = undefined
    void flushAudioBuffer(context, state)
  }, FLUSH_DEBOUNCE_MS)
}

function sendTranscript(socket: WebSocket, transcript: string) {
  socket.send(
    JSON.stringify({
      type: "transcript",
      role: "user",
      content: transcript
    })
  )
}

function sendAssistantResponse(socket: WebSocket, content: string) {
  socket.send(
    JSON.stringify({
      type: "response",
      content
    })
  )
}

function sendAudioResponse(socket: WebSocket, audioBase64: string) {
  socket.send(
    JSON.stringify({
      type: "audio_response",
      audio: audioBase64
    })
  )
}

function sendMockResponse(socket: WebSocket, audioBuffer: Buffer) {
  socket.send(
    JSON.stringify({
      type: "transcript",
      role: "assistant",
      content: `Mock transcript: received ${audioBuffer.length} bytes of audio.`
    })
  )

  socket.send(
    JSON.stringify({
      type: "response",
      content: "Mock response: Great to hear from you!"
    })
  )
}
