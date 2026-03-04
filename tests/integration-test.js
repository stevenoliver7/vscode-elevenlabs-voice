#!/usr/bin/env node
/**
 * Integration test for ElevenLabs service
 * Tests WebSocket connection without VS Code
 */

const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// Load API key from file
const envPath = '/home/openclaw/.openclaw/credentials/elevenlabs.env';
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/ELEVENLABS_API_KEY=(.+)/);
const api_key = match ? match[1].trim() : null;

if (!api_key) {
    console.error('❌ ELEVENLABS_API_KEY not found');
    process.exit(1);
}

console.log('='.repeat(70));
console.log('ElevenLabs STT Integration Test');
console.log('='.repeat(70));

const wsUrl = `wss://api.elevenlabs.io/v1/speech-to-text/realtime?model_id=scribe_v2_realtime`;
const ws = new WebSocket(wsUrl, {
    headers: { 'xi-api-key': api_key }
});

let messageCount = 0;

ws.on('open', () => {
    console.log('\n✅ WebSocket connected');
    console.log('⏳ Waiting for session to start...\n');
});

ws.on('message', (data) => {
    messageCount++;
    const message = JSON.parse(data.toString());
    const msgType = message.type || message.message_type;

    console.log(`📨 Message ${messageCount}: ${msgType}`);

    if (msgType === 'session_started') {
        console.log('   ✅ Session ID:', message.session_id);
        console.log('   📊 Sample rate:', message.config?.sample_rate);
        console.log('\n✅ SUCCESS! Ready to send audio.');
        console.log('\nNext: Would send audio chunks in actual extension');
        ws.close();
    } else if (msgType === 'transcription_partial') {
        console.log('   📝 Text:', message.text);
    } else if (msgType === 'transcription_committed') {
        console.log('   ✅ Final:', message.text);
    } else if (msgType === 'error' || message.error) {
        console.log('   ❌ Error:', message.error);
        ws.close();
    } else {
        console.log('   📋 Data:', JSON.stringify(message).substring(0, 100));
    }
});

ws.on('error', (error) => {
    console.error('\n❌ WebSocket error:', error.message);
    process.exit(1);
});

ws.on('close', (code, reason) => {
    console.log('\n🔌 Connection closed');
    console.log('   Code:', code);
    if (reason) console.log('   Reason:', reason);

    if (messageCount > 0) {
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST PASSED - Connection successful!');
        console.log('='.repeat(70));
        process.exit(0);
    } else {
        console.log('\n' + '='.repeat(70));
        console.log('❌ TEST FAILED - No messages received');
        console.log('='.repeat(70));
        process.exit(1);
    }
});

// Timeout after 10 seconds
setTimeout(() => {
    console.log('\n⏱️  Test timeout');
    ws.close();
}, 10000);
