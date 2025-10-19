#!/usr/bin/env node
// Simple WebSocket test server for GemiNow
// Run: node test-server.js

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

console.log('🟢 Test WebSocket Server running on ws://localhost:8080');
console.log('📡 Waiting for connections...\n');

wss.on('connection', (ws) => {
  console.log('✅ Client connected!');

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'status',
    data: {
      status: 'connected',
      message: 'Test server connected!'
    }
  }));

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('📥 Received:', message.type);

      if (message.type === 'audio_input') {
        const audioLength = message.data.audio.length;
        console.log(`🎤 Audio chunk: ${audioLength} bytes, ${message.data.format}, ${message.data.sampleRate}Hz`);

        // Send back a mock transcript
        ws.send(JSON.stringify({
          type: 'transcript',
          data: {
            speaker: 'user',
            text: 'Test: Audio received successfully!',
            timestamp: new Date().toISOString()
          }
        }));

        // Send back a mock AI response
        setTimeout(() => {
          ws.send(JSON.stringify({
            type: 'transcript',
            data: {
              speaker: 'ai',
              text: 'I received your audio! Backend integration working! 🎉',
              timestamp: new Date().toISOString()
            }
          }));
        }, 500);
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  });

  ws.on('close', () => {
    console.log('🔌 Client disconnected\n');
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error.message);
  });
});

console.log('💡 To test:');
console.log('  1. Load the extension in Chrome');
console.log('  2. Click the extension icon');
console.log('  3. Click "Start Recording"');
console.log('  4. Speak into your microphone');
console.log('  5. Check for audio chunks appearing here\n');

