import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

import WebSocket from "ws"

const wsUrl = process.env.PLASMO_PUBLIC_WS_URL || "ws://localhost:8080"
const fixturePath = resolve(process.cwd(), "test", "audio-message.example.json")

async function main() {
  const payload = await loadFixture()

  console.log(`🔌 Connecting to ${wsUrl}`)
  const socket = new WebSocket(wsUrl)

  socket.on("open", () => {
    console.log("✅ Connected, sending audio payload")
    socket.send(JSON.stringify(payload))
  })

  socket.on("message", (data) => {
    console.log("📥 Message from server:", data.toString())
  })

  socket.on("error", (err) => {
    console.error("❌ WebSocket error", err)
  })

  socket.on("close", () => {
    console.log("🔌 Connection closed")
  })
}

async function loadFixture() {
  const json = await readFile(fixturePath, "utf-8")
  return JSON.parse(json)
}

main().catch((err) => {
  console.error("❌ Test client failed", err)
  process.exitCode = 1
})
