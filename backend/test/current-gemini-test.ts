import "dotenv/config"
import { GoogleGenerativeAI } from "@google/generative-ai"

const API_KEY = process.env.GEMINI_API_KEY

// Test with the model currently configured in the backend
const CURRENT_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest"

async function testCurrentGeminiSetup() {
  if (!API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing!")
    console.log("Please set GEMINI_API_KEY in your environment variables")
    return
  }

  console.log(`🔑 API Key found: ${API_KEY.substring(0, 10)}...`)
  console.log(`🤖 Testing model: ${CURRENT_MODEL}`)

  const genAI = new GoogleGenerativeAI(API_KEY)
  const model = genAI.getGenerativeModel({ model: CURRENT_MODEL })

  try {
    console.log("🔍 Testing basic text generation...")
    const result = await model.generateContent("Hello, this is a test message!")
    const response = result.response?.text()
    console.log(`✅ Success: ${response}`)
    
    console.log("\n🔍 Testing audio transcription simulation...")
    const audioTestResult = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: "Transcribe the caller's audio. Respond with only the words spoken." },
            {
              inlineData: {
                data: "UklGRhIAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQAAAAA=", // Base64 audio
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
    
    const audioResponse = audioTestResult.response?.text()?.trim()
    console.log(`✅ Audio transcription test: ${audioResponse}`)
    
  } catch (err) {
    console.error(`❌ Error testing ${CURRENT_MODEL}:`, err.message)
    
    // Try to list available models
    console.log("\n🔍 Attempting to list available models...")
    try {
      const models = await genAI.listModels()
      console.log("Available models:")
      models.forEach(m => console.log(`- ${m.name}`))
    } catch (listErr) {
      console.error("❌ Could not list models:", listErr.message)
    }
  }
}

testCurrentGeminiSetup()
