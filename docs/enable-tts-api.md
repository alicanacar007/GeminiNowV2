# Enable Google Cloud Text-to-Speech API

## Quick Steps to Enable TTS API

Since you already have Google Cloud credentials set up, you just need to enable the Text-to-Speech API:

### Step 1: Navigate to API Library
1. In your Google Cloud Console (where you see the OAuth 2 Client ID)
2. Click on **"APIs & Services"** in the left sidebar
3. Click on **"Library"**

### Step 2: Search for Text-to-Speech API
1. In the search bar, type: `Cloud Text-to-Speech API`
2. Press Enter or click the search icon

### Step 3: Enable the API
1. Click on **"Cloud Text-to-Speech API"** from the search results
2. Click the **"Enable"** button
3. Wait for the API to be enabled (usually takes a few seconds)

### Step 4: Test the API
Once enabled, run this command to test:

```bash
cd backend
npx tsx test/tts-test.ts
```

You should see:
```
🔍 TTS test ediyor...
✅ TTS başarılı! Audio uzunluğu: [some number]
```

## Alternative: Check if API is Already Enabled

If you're not sure if the API is enabled:

1. Go to **"APIs & Services"** → **"Enabled APIs & services"**
2. Look for **"Cloud Text-to-Speech API"** in the list
3. If it's there, it's already enabled!

## What This Fixes

- ✅ **Current Error**: `PERMISSION_DENIED: Requests to this API texttospeech.googleapis.com method are blocked`
- ✅ **After Enabling**: TTS will work and you'll get voice responses back
- ✅ **Result**: Complete voice conversation (speech → text → AI response → voice)

## Expected Behavior After Fix

When you run the audio test, you should see:
1. Audio transcription: ✅ Working
2. AI response: ✅ Working  
3. **TTS audio response**: ✅ **NEW - Voice playback**

The system will then provide both text and voice responses, making it a complete voice assistant!
