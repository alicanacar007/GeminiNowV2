# GemiNow Backend

Real-time WebSocket backend that receives audio chunks from the Chrome extension, optionally sends them to Gemini for transcription, and streams responses back to the client.

## Prerequisites

- Node.js 20+
- pnpm or npm

## Setup

```bash
cd backend
npm install
```

Create a `.env` file (copy from `.env.example`) and set:

```
WS_PORT=8080
GEMINI_API_KEY=your_key_here
```

## Development

```bash
npm run dev
```

This starts a WebSocket server on `ws://localhost:8080`. The extension should set `PLASMO_PUBLIC_WS_URL` to match.

## Production build

```bash
npm run build
npm start
```

## Message Flow

1. Extension calls `startRecording()` and streams microphone chunks as base64 via WebSocket messages `{ type: "audio", audio: "..." }`.
2. Backend decodes the chunk and either:
   - Sends mock transcript/response if `GEMINI_API_KEY` is missing.
   - Calls Gemini (placeholder in `transcribeWithGemini()` for now) once API integration is implemented.
3. Responses are emitted as `{ type: "transcript", role: "assistant", content: "..." }` and optional `{ type: "response", content: "..." }`.

## TODO

- Implement real Gemini transcription and streaming responses.
- Add authentication for production environments.
