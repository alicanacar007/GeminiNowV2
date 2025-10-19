import "dotenv/config"
import { TextToSpeechClient } from "@google-cloud/text-to-speech"

const API_KEY = process.env.GEMINI_API_KEY

async function testTTS() {
  if (!API_KEY) {
    console.error("❌ GEMINI_API_KEY eksik!")
    return
  }

  const ttsClient = new TextToSpeechClient({ apiKey: API_KEY })

  try {
    console.log("🔍 TTS test ediyor...")
    const [response] = await ttsClient.synthesizeSpeech({
      input: { text: "Hello, this is a TTS test." },
      voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
      audioConfig: { audioEncoding: "MP3" }
    })

    if (response.audioContent) {
      console.log("✅ TTS başarılı! Audio uzunluğu:", response.audioContent.length)
    }
  } catch (err) {
    console.error("❌ TTS hata:", err.message)
    console.log("💡 Çözüm: API key'ini kontrol et veya Text-to-Speech API'yi etkinleştir.")
  }
}

testTTS()
