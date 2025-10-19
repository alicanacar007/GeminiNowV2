# Google Cloud TTS Setup Guide

## Option 1: Google Cloud Service Account (Recommended)

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Note your project ID

### Step 2: Enable Text-to-Speech API
1. Go to "APIs & Services" > "Library"
2. Search for "Cloud Text-to-Speech API"
3. Click "Enable"

### Step 3: Create Service Account
1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Name: `geminow-tts`
4. Description: `Service account for GemiNow TTS`
5. Click "Create and Continue"

### Step 4: Grant Permissions
1. Role: "Cloud Text-to-Speech API User"
2. Click "Continue" > "Done"

### Step 5: Create and Download Key
1. Click on the service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Download the JSON file

### Step 6: Set Environment Variable
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"
```

### Step 7: Test
```bash
cd backend
npm run test:audio
```

## Option 2: Use API Key Authentication (Simpler)

### Step 1: Get API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Go to "APIs & Services" > "Credentials"
3. Click "Create Credentials" > "API Key"
4. Copy the API key

### Step 2: Update Backend Code
Modify the TTS client initialization in `src/index.ts`:

```typescript
// Instead of:
const ttsClient = GEMINI_API_KEY ? new TextToSpeechClient() : null

// Use:
const ttsClient = GEMINI_API_KEY ? new TextToSpeechClient({
  apiKey: GEMINI_API_KEY
}) : null
```

### Step 3: Test
```bash
cd backend
npm run test:audio
```

## Option 3: Disable TTS (Quick Fix)

If you don't need voice responses immediately, you can disable TTS:

```typescript
// In src/index.ts, comment out TTS:
// const ttsClient = GEMINI_API_KEY ? new TextToSpeechClient() : null
const ttsClient = null
```

This will make the system work with text-only responses.
