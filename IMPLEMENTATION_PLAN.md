# ElevenLabs Realtime STT — Implementation Plan

## Verified Protocol (tested 2026-03-04)

### Connection
```
WSS wss://api.elevenlabs.io/v1/speech-to-text/realtime
```

**Required query parameters:**
| Param | Value | Notes |
|---|---|---|
| `model_id` | `scribe_v2_realtime` | **Required** — omitting returns 404-like close |
| `audio_format` | `pcm_16000` | 16 kHz, 16-bit signed LE, mono |
| `language_code` | `en` | Optional but recommended |
| `commit_strategy` | `vad` | Auto-commits on silence (manual = must send commit) |

**Authentication header:**
```
xi-api-key: sk_xxxx...
```

### Client → Server Messages

Only ONE message type matters:
```json
{
  "message_type": "input_audio_chunk",
  "audio_base_64": "<base64-encoded raw PCM bytes>"
}
```

- Field is `message_type`, NOT `type`
- Field is `audio_base_64`, NOT `audio`
- No "start session", "configure", or "end stream" messages needed
- Just connect and start sending chunks immediately after `session_started`

### Server → Client Messages

| `message_type` | Key field | Meaning |
|---|---|---|
| `session_started` | `session_id`, `config` | Session is ready |
| `partial_transcript` | `text` | Interim / in-progress transcription |
| `committed_transcript` | `text` | Final committed text (after VAD silence) |
| `input_error` | `error` | Protocol error (bad message format) |
| Various `*_error` | `error` | Auth, quota, rate-limit errors |

### Audio Capture (ffmpeg on macOS)

ffmpeg captures mic → raw PCM s16le @ 16kHz mono → stdout pipe → Node Buffer.

Chunk every 100ms = 3200 bytes (1600 samples × 2 bytes).

## What Was Wrong Before

| # | Bug | Root Cause |
|---|---|---|
| 1 | `input_error: Message must be a valid protocol message` | Sent `type` instead of `message_type` |
| 2 | Same error | Sent `audio` instead of `audio_base_64` |
| 3 | Same error | Sent bogus `input_audio_buffer_start` message |
| 4 | Same error | Sent bogus `input_audio_buffer_stop` message |
| 5 | No session_started | Missing required `model_id` query param |
| 6 | No text in editor | All above → API never got valid audio → no transcription |

## Implementation Changes

### `elevenLabsService.ts`
1. Build WebSocket URL with required query params: `model_id`, `audio_format`, `language_code`, `commit_strategy`
2. On `open`: just log, no config message needed (session_started arrives automatically)
3. `sendAudioChunk()`: base64-encode buffer, send as `{ message_type: "input_audio_chunk", audio_base_64: "..." }`
4. Message handler: listen for `partial_transcript` (field: `text`) and `committed_transcript` (field: `text`)
5. On stop: just close the WebSocket (VAD handles final commit)
6. Add output channel logging for all messages

### `extension.ts`
1. Separate callbacks: `onPartial(text)` replaces last partial inline, `onFinal(text)` commits permanently
2. Track partial range so partials don't duplicate/accumulate
3. Final text gets a trailing space for natural typing flow
