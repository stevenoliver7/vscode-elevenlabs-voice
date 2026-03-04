# ElevenLabs API Integration Notes

## WebSocket Connection

### Endpoint
```
wss://api.elevenlabs.io/v1/speech-to-text
```

### Authentication
Include API key in WebSocket headers:
```javascript
{
  'xi-api-key': 'your_api_key_here'
}
```

### Model ID
Use `scribe_v1` for real-time transcription

## Message Protocol

### Client → Server

**Start Transcription:**
```json
{
  "type": "start",
  "model_id": "scribe_v1",
  "language": "en"
}
```

**Audio Data:**
- Send as binary WebSocket message
- Format: WebM/Opus (from MediaRecorder)
- Chunk size: 100ms recommended

**End Stream:**
```json
{
  "type": "end_of_stream"
}
```

### Server → Client

**Transcription Result:**
```json
{
  "type": "transcription",
  "text": "Hello world",
  "is_final": false,
  "confidence": 0.95
}
```

**Final Transcription:**
```json
{
  "type": "final_transcription",
  "text": "Hello world",
  "confidence": 0.98
}
```

**Error:**
```json
{
  "type": "error",
  "error": "Invalid API key",
  "code": 1001
}
```

## Implementation Status

### ✅ Implemented
- WebSocket connection structure
- Message handling framework
- Audio chunk sending
- Transcription callback

### ⏳ To Test
- Actual WebSocket connection
- Real audio streaming
- Transcription parsing
- Error handling

### 🔧 To Fix
- Verify correct WebSocket URL
- Test with real API
- Handle all message types
- Add reconnection logic

## API Limits

- **Free tier**: 10,000 characters/month
- **Starter tier**: 30,000 characters/month
- **Pro tier**: 100,000 characters/month

## Cost Estimation

- Average speaking: ~150 words/minute
- ~750 characters/minute
- ~45,000 characters/hour

For development/testing:
- Expect ~5,000 characters/session
- Free tier should be sufficient for testing

## Testing Plan

1. **Connectivity Test**
   - Establish WebSocket connection
   - Verify authentication
   - Check connection stability

2. **Audio Streaming Test**
   - Send audio chunks
   - Verify format accepted
   - Check chunk timing

3. **Transcription Test**
   - Speak test phrases
   - Verify text received
   - Check accuracy

4. **Error Handling Test**
   - Invalid API key
   - Network interruption
   - Rate limiting

## Next Steps

1. Get API key from Daniel
2. Test WebSocket connection
3. Send test audio
4. Verify transcription
5. Integrate with extension
6. Test full workflow

---

**Status:** Waiting for API key to proceed with testing
