# Backend Test Utilities

This directory contains manual and automated test helpers for the WebSocket backend.

## Files

- `audio-message.example.json` – fixture payload containing a small base64-encoded audio chunk.
- `send-audio.ts` – simple WebSocket client that loads the fixture and sends it to the backend.

## Usage

1. Start the backend server (for example, `npm run dev`).
2. From `backend/`, run:

```bash
npm run test:audio
```

3. The script connects to `ws://localhost:8080` (override with `PLASMO_PUBLIC_WS_URL` env var) and prints all responses received from the backend.
