# GeminiNow - AI Voice Form Assistant - Final Hackathon Spec

**Team:** Ali  
**Timeline:** 3 Days  
**Stack:** Plasmo + React + Node.js + Gemini Live + Gemini Computer Use

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Team Responsibilities](#3-team-responsibilities)
4. [Technology Stack](#4-technology-stack)
5. [Project Structure](#5-project-structure)
6. [API Specification](#6-api-specification)
7. [WebSocket Protocol](#7-websocket-protocol)
8. [Implementation Plan](#8-implementation-plan)
9. [Code Integration Points](#9-code-integration-points)
10. [Deployment Guide](#10-deployment-guide)

---

## 1. Project Overview

### Problem
Users struggle with complex forms and website navigation, especially on government sites, healthcare portals, and multi-step applications.

### Solution
An AI voice agent that:
- Understands any webpage visually using Gemini Computer Use
- Guides users conversationally using Gemini Live
- Automatically fills forms based on voice responses
- Provides context-aware help for each field

### Core Features
1. **Voice Interaction**: Natural conversation with real-time audio streaming
2. **Visual Understanding**: AI "sees" the page like a human
3. **Smart Form Filling**: Auto-fills based on conversation
4. **Context Awareness**: Provides field-specific guidance

### Success Criteria
- ✅ Voice conversation works end-to-end
- ✅ Successfully fills 3+ different form types
- ✅ Response latency < 2 seconds
- ✅ Accurate field detection via visual AI
- ✅ Smooth demo with no crashes

---

## 2. Architecture

### System Overview

```
┌─────────────────────────────────────────────────────┐
│         Chrome Extension (Plasmo + React)           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │    Popup     │  │   Content    │  │Background│ │
│  │     UI       │  │   Script     │  │  Worker  │ │
│  │  (Frontend)  │  │  (Frontend)  │  │(Frontend)│ │
│  └──────────────┘  └──────────────┘  └──────────┘ │
└─────────────────────────────────────────────────────┘
                        │
                        │ HTTP + WebSocket
                        ▼
┌─────────────────────────────────────────────────────┐
│            Node.js Backend (Express)                │
│                                                      │
│  ┌────────────────────────────────────────────┐   │
│  │         Communication Layer                 │   │
│  │  • WebSocket Handler      (Frontend)       │   │
│  │  • Session Manager        (Frontend)       │   │
│  │  • REST API              (Frontend)       │   │
│  └────────────────────────────────────────────┘   │
│                                                      │
│  ┌────────────────────────────────────────────┐   │
│  │         AI Services Layer                   │   │
│  │                                              │   │
│  │  ┌──────────────────┐  ┌─────────────────┐│   │
│  │  │  Gemini Live     │  │ Gemini Computer ││   │
│  │  │  (Voice AI)      │  │ Use (Visual AI) ││   │
│  │  │     (Ali)        │  │    (Frontend)   ││   │
│  │  └──────────────────┘  └─────────────────┘│   │
│  └────────────────────────────────────────────┘   │
│                                                      │
│  ┌────────────────────────────────────────────┐   │
│  │         Storage (In-Memory)                 │   │
│  │  • Session Store (Map)                     │   │
│  │  • Transcript Cache                        │   │
│  └────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Data Flow

```
User speaks → Extension captures audio → WebSocket to backend
                                              ↓
Backend receives audio → Ali's Gemini Live processes → Transcript + AI Response
                                              ↓
AI response sent back → Extension plays audio + shows transcript
                                              ↓
User provides info → Computer Use analyzes page → Identifies fields
                                              ↓
Actions sent to extension → Content script fills fields → Form completed ✅
```

---

## 3. Team Responsibilities

### 👨‍💻 Frontend & Infrastructure

#### Extension (100%)
- **Plasmo Setup**: Initialize and configure extension
- **React UI**: Voice controls, transcript, status indicators
- **Audio Capture**: Microphone access and streaming
- **Content Script**: Screenshot capture, field highlighting, form filling
- **Background Worker**: Message routing, WebSocket client

#### Backend (50%)
- **WebSocket Server**: Connection handling, message routing
- **Session Manager**: In-memory session storage
- **REST API**: Session CRUD endpoints
- **Gemini Computer Use**: Visual page analysis, field detection, action generation

**Files Owned:**
- `extension/` (entire folder)
- `backend/src/frontend/` (all files)
- `backend/src/server.ts` (shared, but sets up WebSocket)

---

### 👨‍💻 Ali - AI Services

#### Backend (50%)
- **Gemini Live Integration**: Real-time voice streaming, transcription, audio generation
- **AI Orchestration**: Coordinate between voice and context
- **Context Management**: Inject page context into conversations
- **Response Generation**: Smart, context-aware AI responses

**Files Owned:**
- `backend/src/ali/` (all files)
- `backend/src/server.ts` (shared, but less involved)

---

### Collaboration Points

| Component | Owner | Collaborator | Interface |
|-----------|-------|--------------|-----------|
| server.ts | Both | Both | Import each other's routers |
| WebSocket messages | Frontend | Ali | Defined message types |
| AI responses | Ali | Frontend | Return value contracts |
| Screenshot analysis | Frontend | - | Computer Use API |
| Voice processing | Ali | - | Gemini Live API |

---

## 4. Technology Stack

```json
{
  "extension": {
    "framework": "Plasmo 0.84+",
    "ui": "React 18 + TypeScript",
    "state": "React Context API",
    "styling": "Tailwind CSS",
    "websocket": "Native WebSocket API",
    "audio": "MediaRecorder API"
  },
  "backend": {
    "runtime": "Node.js 18+",
    "framework": "Express 4.18",
    "websocket": "ws 8.14",
    "ai": {
      "voice": "Gemini 2.0 Flash (Live API)",
      "vision": "Gemini 2.0 Flash (Computer Use API)"
    }
  },
  "storage": {
    "sessions": "In-Memory Map",
    "cache": "JavaScript Objects"
  },
  "deployment": {
    "backend": "Railway / Render",
    "extension": "Local development"
  }
}
```

### Required API Keys
```bash
GEMINI_API_KEY=your_google_ai_studio_key
```

Get from: https://aistudio.google.com/app/apikey

---

## 5. Project Structure

```
ai-voice-form-assistant/
│
├── extension/                           # FRONTEND DOMAIN
│   ├── src/
│   │   ├── popup/                      # React UI
│   │   │   ├── App.tsx                 # Main app component
│   │   │   ├── AppContext.tsx          # React Context (state)
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── VoiceButton.tsx     # Start/stop voice
│   │   │   │   ├── Transcript.tsx      # Show conversation
│   │   │   │   ├── StatusBar.tsx       # Connection status
│   │   │   │   └── FieldHighlight.tsx  # Current field display
│   │   │   │
│   │   │   └── hooks/
│   │   │       ├── useWebSocket.ts     # WebSocket connection
│   │   │       ├── useAudioRecorder.ts # Microphone handling
│   │   │       └── useSession.ts       # Session management
│   │   │
│   │   ├── content.ts                  # Content script (DOM interaction)
│   │   ├── background.ts               # Background service worker
│   │   │
│   │   ├── lib/
│   │   │   ├── types.ts                # TypeScript types
│   │   │   ├── constants.ts            # Config constants
│   │   │   └── utils.ts                # Helper functions
│   │   │
│   │   └── assets/
│   │       ├── icon-16.png
│   │       ├── icon-48.png
│   │       └── icon-128.png
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── .env.example
│
├── backend/                             # SHARED
│   ├── src/
│   │   ├── server.ts                   # Main entry point (BOTH)
│   │   │
│   │   ├── frontend/                   # FRONTEND FILES
│   │   │   ├── websocket-handler.ts   # WebSocket server
│   │   │   ├── session-manager.ts     # Session storage
│   │   │   ├── api-routes.ts          # REST endpoints
│   │   │   ├── gemini-computer-use.ts # Visual AI service
│   │   │   └── types.ts               # Frontend types
│   │   │
│   │   ├── ali/                        # ALI'S FILES
│   │   │   ├── gemini-live.ts         # Voice AI service
│   │   │   ├── ai-orchestrator.ts     # Coordinate AI
│   │   │   ├── context-manager.ts     # Page context injection
│   │   │   └── types.ts               # Ali's types
│   │   │
│   │   └── shared/                     # SHARED UTILITIES
│   │       ├── types.ts               # Common types
│   │       ├── logger.ts              # Console logger
│   │       └── constants.ts           # Config
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── docs/
│   ├── README.md                       # Quick start
│   ├── DEMO_SCRIPT.md                  # Hackathon demo
│   └── API.md                          # API reference
│
└── .gitignore
```

---

## 6. API Specification

### Base URL
```
Development: http://localhost:3000/api
Production:  https://your-app.railway.app/api
```

### Endpoints

#### 6.1 Health Check
```http
GET /health
```

**Response (200):**
```json
{
  "status": "ok",
  "services": {
    "geminiLive": "connected",
    "geminiComputerUse": "connected"
  },
  "timestamp": "2025-10-18T14:22:00Z"
}
```

---

#### 6.2 Create Session
```http
POST /api/session
```

**Request:**
```json
{
  "pageUrl": "https://ssa.gov/disability-application",
  "pageTitle": "Apply for Disability Benefits"
}
```

**Response (201):**
```json
{
  "sessionId": "sess_1729260120_abc123",
  "wsUrl": "ws://localhost:3000/ws/sess_1729260120_abc123",
  "createdAt": "2025-10-18T14:22:00Z"
}
```

---

#### 6.3 Get Session
```http
GET /api/session/:sessionId
```

**Response (200):**
```json
{
  "sessionId": "sess_1729260120_abc123",
  "pageUrl": "https://ssa.gov/disability-application",
  "status": "active",
  "transcript": [
    {
      "speaker": "ai",
      "text": "Hi! I'm here to help you with this form. What's your first name?",
      "timestamp": "2025-10-18T14:22:05Z"
    },
    {
      "speaker": "user",
      "text": "My name is John",
      "timestamp": "2025-10-18T14:22:10Z"
    }
  ],
  "createdAt": "2025-10-18T14:22:00Z"
}
```

---

#### 6.4 Analyze Page (Computer Use)
```http
POST /api/analyze
```

**Request:**
```json
{
  "sessionId": "sess_1729260120_abc123",
  "screenshot": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "pageUrl": "https://ssa.gov/disability-application"
}
```

**Response (200):**
```json
{
  "fields": [
    {
      "id": "fld_1",
      "label": "First Name",
      "type": "text",
      "position": { "x": 120, "y": 200 },
      "required": true
    },
    {
      "id": "fld_2",
      "label": "Social Security Number",
      "type": "text",
      "position": { "x": 120, "y": 280 },
      "required": true,
      "sensitive": true
    }
  ],
  "formType": "government_benefits",
  "guidance": "This is a Social Security disability benefits application. You'll need your SSN, medical history, and work history.",
  "estimatedTime": "30-45 minutes"
}
```

---

#### 6.5 Delete Session
```http
DELETE /api/session/:sessionId
```

**Response (200):**
```json
{
  "success": true,
  "deletedAt": "2025-10-18T15:00:00Z"
}
```

---

## 7. WebSocket Protocol

### Connection
```javascript
const ws = new WebSocket('ws://localhost:3000/ws/sess_1729260120_abc123');
```

### Message Types

#### 7.1 Client → Server

```typescript
// Audio input from user microphone
{
  type: 'audio_input',
  data: {
    audio: string;        // base64 encoded audio chunk
    format: 'webm';       // audio format
    sampleRate: 16000;    // sample rate in Hz
  }
}

// Page screenshot for analysis
{
  type: 'screenshot',
  data: {
    image: string;        // base64 encoded PNG
    url: string;          // current page URL
    title: string;        // page title
  }
}

// User commands
{
  type: 'command',
  data: {
    command: 'pause' | 'resume' | 'stop';
  }
}

// Confirmation of action executed
{
  type: 'action_complete',
  data: {
    actionId: string;
    success: boolean;
    error?: string;
  }
}
```

---

#### 7.2 Server → Client

```typescript
// AI audio response
{
  type: 'audio_output',
  data: {
    audio: string;        // base64 encoded audio
    duration: number;     // duration in seconds
  }
}

// Transcript update
{
  type: 'transcript',
  data: {
    speaker: 'user' | 'ai';
    text: string;
    timestamp: string;    // ISO 8601
  }
}

// Form filling action
{
  type: 'action',
  data: {
    actionId: string;
    type: 'fill_field' | 'click' | 'select';
    target: {
      position: { x: number; y: number };
      label?: string;
      selector?: string;
    };
    value: string;
  }
}

// Status update
{
  type: 'status',
  data: {
    status: 'connected' | 'listening' | 'processing' | 'filling';
    message?: string;
  }
}

// Error
{
  type: 'error',
  data: {
    code: string;
    message: string;
    recoverable: boolean;
  }
}
```

---

## 8. Implementation Plan

### Day 1: Core Infrastructure (8 hours)

#### Morning (Hours 1-4)

**Frontend:**
- [ ] Initialize Plasmo extension project
- [ ] Set up React + TypeScript + Tailwind
- [ ] Create basic popup UI with voice button
- [ ] Implement microphone permission request
- [ ] Test audio recording in browser

**Ali:**
- [ ] Initialize Node.js backend project
- [ ] Set up Express server with CORS
- [ ] Create Gemini API client instances
- [ ] Test Gemini Live API connection
- [ ] Test basic audio streaming

**Sync Point 1 (Hour 4):** Test audio flow: Extension → Backend → Gemini

---

#### Afternoon (Hours 5-8)

**Frontend:**
- [ ] Build WebSocket client in extension
- [ ] Implement audio streaming to backend
- [ ] Create React Context for app state
- [ ] Build transcript display component
- [ ] Test WebSocket connection

**Ali:**
- [ ] Implement WebSocket server
- [ ] Handle incoming audio streams
- [ ] Connect audio to Gemini Live API
- [ ] Send audio responses back
- [ ] Test bidirectional audio flow

**Day 1 Goal:** Voice conversation works end-to-end (no form filling yet)

**Demo:** User can talk to AI and get voice responses back

---

### Day 2: Visual AI & Form Filling (8 hours)

#### Morning (Hours 1-4)

**Frontend:**
- [ ] Build content script for page interaction
- [ ] Implement screenshot capture
- [ ] Send screenshots via WebSocket
- [ ] Integrate Gemini Computer Use API
- [ ] Parse field detection responses

**Ali:**
- [ ] Build context manager for page awareness
- [ ] Inject page context into Gemini Live
- [ ] Improve AI prompts for form guidance
- [ ] Test context-aware responses
- [ ] Handle multi-turn conversations

**Sync Point 2 (Hour 4):** Test screenshot analysis pipeline

---

#### Afternoon (Hours 5-8)

**Frontend:**
- [ ] Build action executor in content script
- [ ] Implement field highlighting
- [ ] Test form filling on 3 sites
- [ ] Handle different input types (text, select, checkbox)
- [ ] Add error handling

**Ali:**
- [ ] Optimize AI response latency
- [ ] Add conversation memory
- [ ] Improve field-specific guidance
- [ ] Test on complex forms
- [ ] Bug fixes

**Day 2 Goal:** Complete flow working - voice to form filling

**Demo:** User speaks, AI fills form fields automatically

---

### Day 3: Polish & Demo Prep (8 hours)

#### Morning (Hours 1-4)

**Frontend:**
- [ ] UI polish (animations, transitions)
- [ ] Add loading states
- [ ] Improve visual feedback
- [ ] Build settings panel
- [ ] Test on 5+ different websites

**Ali:**
- [ ] Deploy backend to Railway
- [ ] Set up environment variables
- [ ] Test production deployment
- [ ] Performance optimization
- [ ] Add comprehensive error handling

**Sync Point 3 (Hour 4):** End-to-end testing on production

---

#### Afternoon (Hours 5-8)

**Both:**
- [ ] Select 3 demo websites (simple → complex)
- [ ] Practice demo walkthrough
- [ ] Create presentation slides
- [ ] Record backup demo video
- [ ] Prepare pitch script
- [ ] Test disaster recovery

**Day 3 Goal:** Ready to demo with backup plan

**Demo Sites:**
1. Simple contact form (warm-up)
2. Government form (SSA, DMV) (main demo)
3. Multi-step form (backup)

---

## 9. Code Integration Points

### 9.1 Shared Types

**File:** `backend/src/shared/types.ts` & `extension/src/lib/types.ts`

```typescript
// Session
export interface Session {
  id: string;
  pageUrl: string;
  pageTitle?: string;
  status: 'active' | 'paused' | 'completed';
  transcript: Message[];
  createdAt: Date;
}

// Message
export interface Message {
  speaker: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

// WebSocket Messages
export type ClientMessage = 
  | AudioInputMessage
  | ScreenshotMessage
  | CommandMessage
  | ActionCompleteMessage;

export type ServerMessage =
  | AudioOutputMessage
  | TranscriptMessage
  | ActionMessage
  | StatusMessage
  | ErrorMessage;

// Audio
export interface AudioInputMessage {
  type: 'audio_input';
  data: {
    audio: string;
    format: 'webm';
    sampleRate: number;
  };
}

export interface AudioOutputMessage {
  type: 'audio_output';
  data: {
    audio: string;
    duration: number;
  };
}

// Screenshot
export interface ScreenshotMessage {
  type: 'screenshot';
  data: {
    image: string;
    url: string;
    title: string;
  };
}

// Transcript
export interface TranscriptMessage {
  type: 'transcript';
  data: {
    speaker: 'user' | 'ai';
    text: string;
    timestamp: string;
  };
}

// Actions
export interface ActionMessage {
  type: 'action';
  data: FormAction;
}

export interface FormAction {
  actionId: string;
  type: 'fill_field' | 'click' | 'select';
  target: {
    position: { x: number; y: number };
    label?: string;
    selector?: string;
  };
  value: string;
}

// Status
export interface StatusMessage {
  type: 'status';
  data: {
    status: 'connected' | 'listening' | 'processing' | 'filling';
    message?: string;
  };
}

// Command
export interface CommandMessage {
  type: 'command';
  data: {
    command: 'pause' | 'resume' | 'stop';
  };
}

// Error
export interface ErrorMessage {
  type: 'error';
  data: {
    code: string;
    message: string;
    recoverable: boolean;
  };
}

// Computer Use Response
export interface PageAnalysis {
  fields: FormField[];
  formType: string;
  guidance: string;
  estimatedTime?: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'checkbox' | 'textarea';
  position: { x: number; y: number };
  required: boolean;
  sensitive?: boolean;
}
```

---

### 9.2 Frontend → Ali Interface

**File:** `backend/src/frontend/websocket-handler.ts`

```typescript
import { AIOrchestrator } from '../ali/ai-orchestrator';

// Frontend calls Ali's methods:
const orchestrator = new AIOrchestrator(sessionId);

// Process audio
const audioResponse = await orchestrator.processAudio({
  audio: audioData,
  format: 'webm',
  sampleRate: 16000
});
// Returns: { transcript?, audioOutput?, aiText? }

// Add page context
await orchestrator.updatePageContext({
  url: pageUrl,
  fields: detectedFields,
  guidance: guidance
});

// Cleanup
orchestrator.cleanup();
```

---

### 9.3 Ali's Interface Contract

**File:** `backend/src/ali/ai-orchestrator.ts`

```typescript
export class AIOrchestrator {
  constructor(sessionId: string) { }

  // Process audio from user
  async processAudio(input: AudioInput): Promise<AudioResponse> {
    // Returns transcript + AI audio + AI text
  }

  // Update conversation context
  async updatePageContext(context: PageContext): Promise<void> {
    // Injects context into Gemini Live
  }

  // Cleanup
  cleanup(): void {
    // Release resources
  }
}

interface AudioInput {
  audio: string;      // base64
  format: string;
  sampleRate: number;
}

interface AudioResponse {
  transcript?: string;
  audioOutput?: string;
  aiText?: string;
}

interface PageContext {
  url: string;
  fields: FormField[];
  guidance: string;
}
```

---

### 9.4 Frontend Computer Use Interface

**File:** `backend/src/frontend/gemini-computer-use.ts`

```typescript
export class GeminiComputerUseService {
  constructor() { }

  // Analyze screenshot
  async analyzeScreenshot(
    image: string,
    url: string
  ): Promise<PageAnalysis> {
    // Call Gemini Computer Use API
    // Return detected fields + guidance
  }

  // Generate action for specific field
  async generateAction(
    field: FormField,
    value: string
  ): Promise<FormAction> {
    // Create action to fill field
  }
}
```

---

## 10. Deployment Guide

### Local Development

#### Prerequisites
```bash
# Install Node.js 18+
node --version

# Install pnpm (optional, faster than npm)
npm install -g pnpm
```

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
GEMINI_API_KEY=your_actual_api_key_here
PORT=3000
NODE_ENV=development
EOF

# Run in development mode (auto-reload)
npm run dev

# Server runs on http://localhost:3000
```

#### Extension Setup

```bash
cd extension

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PLASMO_PUBLIC_API_URL=http://localhost:3000
EOF

# Run in development mode
npm run dev

# Load extension in Chrome:
# 1. Go to chrome://extensions
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select: extension/build/chrome-mv3-dev
```

---

### Production Deployment (Railway)

#### 1. Backend to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Set environment variables
railway variables set GEMINI_API_KEY=your_key_here

# Deploy
railway up

# Get deployment URL
railway domain

# Example: https://your-app.up.railway.app
```

#### 2. Update Extension for Production

```bash
cd extension

# Update .env
PLASMO_PUBLIC_API_URL=https://your-app.up.railway.app

# Build for production
npm run build

# Extension built in: build/chrome-mv3-prod
```

#### 3. Load Production Extension

```
1. Go to chrome://extensions
2. Remove dev version
3. Load unpacked: extension/build/chrome-mv3-prod
4. Test with production backend
```

---

### Environment Variables

#### Backend
```bash
# Required
GEMINI_API_KEY=AIza...

# Optional
PORT=3000
NODE_ENV=development | production
```

#### Extension
```bash
# Required
PLASMO_PUBLIC_API_URL=http://localhost:3000
```

---

## 11. Package.json Files

### Backend `package.json`

```json
{
  "name": "voice-form-assistant-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "ws": "^8.14.2",
    "@google/generative-ai": "^0.21.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/ws": "^8.5.10",
    "@types/node": "^20.11.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
```

### Extension `package.json`

```json
{
  "name": "voice-form-assistant-extension",
  "version": "1.0.0",
  "scripts": {
    "dev": "plasmo dev",
    "build": "plasmo build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "plasmo": "^0.84.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@types/chrome": "^0.0.260",
    "typescript": "^5.3.3",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33"
  }
}
```

---

## 12. Critical Success Factors

### Must Have
- ✅ Voice conversation works reliably
- ✅ Fields are detected accurately
- ✅ Forms get filled correctly
- ✅ Demo runs smoothly without crashes

### Nice to Have
- 🎯 Smooth animations
- 🎯 Beautiful UI
- 🎯 Multiple site support
- 🎯 Error recovery

### Don't Need
- ❌ User accounts
- ❌ Persistence (in-memory is fine)
- ❌ Analytics
- ❌ Rate limiting
- ❌ Complex error handling

---

## 13. Demo Script

### Setup (1 minute)
1. Open extension popup
2. Navigate to SSA disability form
3. Click voice button

### Act 1: Introduction (30 seconds)
```
AI: "Hi! I'm here to help you with this disability benefits application. 
     I can see you need to fill out personal information, medical details, 
     and work history. Let's start with your basic information. 
     What's your first name?"

User: "My name is John"

[Field "First Name" highlights and fills with "John"]

AI: "Got it, John! And your last name?"
```

### Act 2: Complex Field (1 minute)
```
User: "Doe. D-O-E"

[Last name fills]

AI: "Perfect. Now I need your Social Security Number. This will be kept 
     secure and is required for your application."

User: "It's 123-45-6789"

[SSN field fills, masked]

AI: "Thank you. Now, can you tell me about your medical condition?"

User: "I have chronic back pain from a workplace injury"

[Medical condition field fills with description]
```

### Act 3: Navigation (30 seconds)
```
AI: "I've recorded that. Let's move to the next section about your work 
     history. I'll help you through each employer."

[Page navigates to next step]

AI: "What was your most recent employer?"
```

### Finale (30 seconds)
```
[Show filled form with multiple fields completed]
[Show transcript of conversation]
[Highlight time saved: "Completed in 3 minutes"]
```

---

## 14. Troubleshooting Guide

### Common Issues

#### Audio not recording
```bash
# Check microphone permissions
chrome://settings/content/microphone

# Verify MediaRecorder support
console.log(navigator.mediaDevices)
```

#### WebSocket not connecting
```bash
# Check backend is running
curl http://localhost:3000/health

# Check CORS
# Look for CORS errors in browser console
```

#### Gemini API errors
```bash
# Verify API key
curl -H "Authorization: Bearer $GEMINI_API_KEY" \
  https://generativelanguage.googleapis.com/v1/models

# Check quota
# Visit: https://aistudio.google.com/app/apikey
```

#### Fields not filling
```bash
# Check content script loaded
# Open DevTools → Sources → Content Scripts

# Verify action messages
# Check WebSocket messages in Network tab
```

---

## 15. Git Workflow

```bash
# Initial setup
git clone <repo>
cd ai-voice-form-assistant

# Create feature branches
git checkout -b frontend-extension
git checkout -b frontend-backend-comms
git checkout -b ali-ai-services

# Daily workflow
git pull origin main
git checkout frontend-extension
# ... work on code ...
git add .
git commit -m "feat: add voice button component"
git push origin frontend-extension

# Merge to main after testing
git checkout main
git merge frontend-extension
git push origin main
```

### Merge Strategy
- **Frontend branches**: Extension + Backend communication
- **Ali's branches**: AI services
- **Sync**: Merge to main every 4 hours
- **Conflicts**: Only in `server.ts` - coordinate via Slack

---

## 16. Resources

### Documentation
- Plasmo: https://docs.plasmo.com/
- Gemini Live: https://ai.google.dev/gemini-api/docs/live
- Gemini Computer Use: https://ai.google.dev/gemini-api/docs/computer-use
- WebSocket API: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

### Tools
- Chrome DevTools
- Railway Dashboard
- Postman (API testing)
- VS Code Extensions:
  - Plasmo Framework
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux snippets

---

## 17. Final Checklist

### Pre-Demo
- [ ] Backend deployed and accessible
- [ ] Extension built for production
- [ ] Test on all 3 demo sites
- [ ] Backup video recorded
- [ ] Slides prepared
- [ ] Pitch script memorized

### During Demo
- [ ] Close all other tabs
- [ ] Disable notifications
- [ ] Use incognito window
- [ ] Have backup plan ready
- [ ] Stay calm if bugs appear

### Post-Demo
- [ ] Answer questions confidently
- [ ] Show code if asked
- [ ] Explain technical choices
- [ ] Discuss future improvements

---

## Success! 🎉

You now have a complete spec for building an AI voice form assistant in 3 days. Remember:

1. **Focus on the demo** - Make it smooth and impressive
2. **Communication** - Sync frequently between Frontend & Ali
3. **MVP mindset** - Working features > Perfect code
4. **Have fun** - This is a hackathon!

**Questions? Issues? Reach out to each other on Slack!**

Good luck! 🚀