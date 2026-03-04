/**
 * test_ws_protocol.mjs
 * 
 * Standalone test that validates the ElevenLabs realtime STT WebSocket protocol.
 * Uses the exact same libraries (ws) and logic that the extension will use.
 *
 * Usage:
 *   ELEVENLABS_API_KEY=xi_... node scripts/test_ws_protocol.mjs
 *
 * Or if the key is in VS Code settings, copy-paste it from:
 *   Settings → ElevenLabs Voice → Api Key
 *
 * What this tests:
 *   1. WebSocket connection to wss://api.elevenlabs.io/v1/speech-to-text/realtime
 *   2. Receiving session_started message
 *   3. Sending a valid input_audio_chunk message (silence, base64-encoded)
 *   4. Receiving partial_transcript / committed_transcript responses
 *   5. Proper close sequence
 */

import WebSocket from 'ws';

// ── Config ──────────────────────────────────────────────────────────────────
const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
    console.error('❌  Set ELEVENLABS_API_KEY env var first');
    console.error('    ELEVENLABS_API_KEY=xi_... node scripts/test_ws_protocol.mjs');
    process.exit(1);
}

const MODEL_ID = 'scribe_v2_realtime';
const AUDIO_FORMAT = 'pcm_16000';       // 16 kHz, 16-bit signed LE, mono
const LANGUAGE = 'en';
const COMMIT_STRATEGY = 'vad';          // auto-commit on silence

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Generate N milliseconds of 16 kHz / 16-bit / mono silence as a Buffer */
function generateSilence(ms) {
    const samples = Math.floor(16000 * ms / 1000);
    return Buffer.alloc(samples * 2); // 2 bytes per sample, all zeros
}

/** Generate N milliseconds of a 440 Hz sine tone (16 kHz / 16-bit / mono) */
function generateTone(ms, freq = 440) {
    const sampleRate = 16000;
    const samples = Math.floor(sampleRate * ms / 1000);
    const buf = Buffer.alloc(samples * 2);
    for (let i = 0; i < samples; i++) {
        const val = Math.floor(Math.sin(2 * Math.PI * freq * i / sampleRate) * 16000);
        buf.writeInt16LE(val, i * 2);
    }
    return buf;
}

function log(label, msg) {
    const ts = new Date().toISOString().slice(11, 23);
    console.log(`[${ts}] ${label}: ${msg}`);
}

// ── Test ────────────────────────────────────────────────────────────────────

const results = {
    connected: false,
    sessionStarted: false,
    audioAccepted: false,   // no input_error after sending audio
    partialReceived: false,
    committedReceived: false,
    errors: [],
    allMessages: [],
};

const params = new URLSearchParams({
    model_id: MODEL_ID,
    audio_format: AUDIO_FORMAT,
    language_code: LANGUAGE,
    commit_strategy: COMMIT_STRATEGY,
});

const wsUrl = `wss://api.elevenlabs.io/v1/speech-to-text/realtime?${params}`;
log('→', `Connecting to ${wsUrl}`);

const ws = new WebSocket(wsUrl, {
    headers: { 'xi-api-key': API_KEY },
});

let audioSent = false;

ws.on('open', () => {
    results.connected = true;
    log('✅', 'WebSocket connected');

    // Send a burst of silence + tone chunks to trigger the STT pipeline
    // (We don't have a real mic, so this tests protocol acceptance)
    const chunkMs = 100;
    const totalChunks = 20; // 2 seconds of audio
    let sent = 0;

    const interval = setInterval(() => {
        if (sent >= totalChunks || ws.readyState !== WebSocket.OPEN) {
            clearInterval(interval);
            audioSent = true;
            log('→', `Done sending ${sent} audio chunks (${sent * chunkMs}ms)`);
            
            // Wait a bit, then close
            setTimeout(() => {
                log('→', 'Closing connection');
                ws.close();
            }, 3000);
            return;
        }

        // Alternate silence and tone to create "activity"
        const pcm = sent % 2 === 0 ? generateTone(chunkMs) : generateSilence(chunkMs);
        const audioBase64 = pcm.toString('base64');

        const message = {
            message_type: 'input_audio_chunk',
            audio_base_64: audioBase64,
        };

        ws.send(JSON.stringify(message));
        sent++;

        if (sent === 1) {
            log('→', `Sending audio chunks... (${totalChunks} × ${chunkMs}ms)`);
        }
    }, chunkMs);
});

ws.on('message', (data) => {
    const raw = data.toString();
    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch {
        log('⚠️', `Non-JSON message: ${raw.slice(0, 200)}`);
        return;
    }

    const msgType = parsed.message_type || parsed.type || 'unknown';
    results.allMessages.push({ type: msgType, data: parsed });

    if (msgType === 'session_started') {
        results.sessionStarted = true;
        log('✅', `session_started — session_id=${parsed.session_id}`);
        log('  ', `config: ${JSON.stringify(parsed.config || {}, null, 2)}`);
    } else if (msgType === 'partial_transcript') {
        results.partialReceived = true;
        log('✅', `partial_transcript — text="${parsed.text}"`);
    } else if (msgType === 'committed_transcript') {
        results.committedReceived = true;
        log('✅', `committed_transcript — text="${parsed.text}"`);
    } else if (msgType === 'committed_transcript_with_timestamps') {
        results.committedReceived = true;
        log('✅', `committed_transcript_with_timestamps — text="${parsed.text}"`);
    } else if (msgType.includes('error')) {
        results.errors.push(parsed);
        log('❌', `${msgType}: ${parsed.error || parsed.message || JSON.stringify(parsed)}`);
    } else {
        log('ℹ️', `${msgType}: ${JSON.stringify(parsed).slice(0, 200)}`);
    }
});

ws.on('error', (err) => {
    log('❌', `WebSocket error: ${err.message}`);
    results.errors.push({ ws_error: err.message });
});

ws.on('close', (code, reason) => {
    log('ℹ️', `WebSocket closed: code=${code} reason=${reason?.toString() || 'none'}`);

    // If audio was sent without getting input_error, it was accepted
    if (audioSent && !results.errors.some(e => 
        (e.message_type || '').includes('input_error'))) {
        results.audioAccepted = true;
    }

    // ── Report ──────────────────────────────────────────────────────────
    console.log('\n' + '='.repeat(60));
    console.log('TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`  Connected:          ${results.connected ? '✅' : '❌'}`);
    console.log(`  Session started:    ${results.sessionStarted ? '✅' : '❌'}`);
    console.log(`  Audio accepted:     ${results.audioAccepted ? '✅' : '❌'}`);
    console.log(`  Partial received:   ${results.partialReceived ? '✅' : '⚠️  (expected, tone≠speech)'}`);
    console.log(`  Committed received: ${results.committedReceived ? '✅' : '⚠️  (expected, tone≠speech)'}`);
    console.log(`  Errors:             ${results.errors.length === 0 ? '✅ none' : '❌ ' + results.errors.length}`);

    if (results.errors.length > 0) {
        console.log('\nErrors:');
        results.errors.forEach((e, i) => {
            console.log(`  ${i + 1}. ${JSON.stringify(e)}`);
        });
    }

    console.log(`\nTotal messages received: ${results.allMessages.length}`);
    console.log('='.repeat(60));

    if (results.connected && results.sessionStarted && results.audioAccepted) {
        console.log('🎉 Protocol is WORKING — ready to integrate');
        process.exit(0);
    } else {
        console.log('🔧 Protocol issues found — see errors above');
        process.exit(1);
    }
});
