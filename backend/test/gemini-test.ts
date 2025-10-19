import "dotenv/config"
import { GoogleGenerativeAI } from "@google/generative-ai"

const API_KEY = process.env.GEMINI_API_KEY
const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.5-flash-vision",
  "gemini-2.5-pro-vision",
  "gemini-2.5-nano",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-1.5-flash-8b"
]

async function testGemini() {
  if (!API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing!")
    return
  }

  const genAI = new GoogleGenerativeAI(API_KEY)

  for (const MODEL of MODELS) {
    const model = genAI.getGenerativeModel({ model: MODEL })

    try {
      console.log(`🔍 Testing: ${MODEL}`)
      const result = await model.generateContent("Hello, this is a test message!")
      const response = result.response?.text()
      console.log(`✅ Success for ${MODEL}:`, response?.substring(0, 100) + "...")
    } catch (err) {
      console.error(`❌ Error for ${MODEL}:`, err.message)
    }
    console.log("---")
  }
}

testGemini()
