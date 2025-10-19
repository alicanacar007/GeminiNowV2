# GemiNow - AI Voice Form Assistant

> Chrome extension powered by Google Gemini to help users fill out complex forms using natural voice conversation.

## Quick Start

### Installation
```bash
npm install
npm run dev
```

### Load Extension
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `build/chrome-mv3-dev/`

## Day 1 Status ✅

**Frontend:**
- ✅ Voice recording with microphone permissions
- ✅ Real-time audio streaming (100ms chunks)
- ✅ WebSocket client implementation
- ✅ Conversation transcript display
- ✅ Modern UI with Tailwind CSS

**Ali (Backend):** ⏳ Pending
- WebSocket server needed at `ws://localhost:8080`
- See `docs/spec.md` for full backend requirements

## Documentation

- **`docs/spec.md`** - Complete technical specification
- **`docs/plan.md`** - 3-day implementation plan with progress tracking

## Tech Stack

- Plasmo 0.90.5 + React 18 + TypeScript
- Tailwind CSS
- WebSocket API + MediaRecorder API
- Google Gemini 2.0 Flash (Live + Computer Use APIs)

---

**Built for hackathon by Ali**
