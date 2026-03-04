# VS Code ElevenLabs Voice Extension - Architecture

## Overview

This VS Code extension provides high-quality voice input using ElevenLabs' real-time v2 transcription API, with optional AI-powered enhancement using Claude or GPT-4.

## Components

### 1. Extension Host (`extension.ts`)
- Main entry point
- Command registration
- Configuration management
- Status bar UI
- Recording state management

### 2. ElevenLabs Service (`elevenLabsService.ts`)
- WebSocket connection to ElevenLabs API
- Real-time audio streaming
- Transcription handling
- Connection lifecycle management

### 3. Transcription Enhancer (`transcriptionEnhancer.ts`)
- AI-powered text enhancement
- Context-aware cleanup
- Support for Anthropic and OpenAI
- Project context integration

## Data Flow

```
User Voice Input
    ↓
Microphone Capture (Web Audio API / Node.js)
    ↓
Audio Chunks → ElevenLabs WebSocket
    ↓
Real-time Transcription
    ↓
[Optional] AI Enhancement (Claude/GPT-4)
    ↓
Insert into VS Code Editor
```

## API Integration

### ElevenLabs Real-time v2
- WebSocket endpoint: `wss://api.elevenlabs.io/v1/speech-to-text`
- Model: `scribe_v1`
- Authentication: API key in headers
- Protocol: JSON messages + binary audio chunks

### Enhancement APIs
- **Anthropic**: `/v1/messages` with Claude models
- **OpenAI**: `/v1/chat/completions` with GPT models
- Context: File name, language, project structure

## Configuration

```json
{
  "elevenlabsVoice.apiKey": "string",
  "elevenlabsVoice.enhancement.enabled": "boolean",
  "elevenlabsVoice.enhancement.model": "string",
  "elevenlabsVoice.enhancement.provider": "anthropic | openai"
}
```

## Key Bindings

- `Cmd+Shift+V` / `Ctrl+Shift+V`: Toggle recording
- Context-aware: Only active when editor has focus

## Status Bar

- Shows recording state
- Visual feedback (color change when recording)
- Quick access to start/stop

## Error Handling

- API key validation
- Connection failure recovery
- Graceful degradation (use original text if enhancement fails)
- User-friendly error messages

## Performance Considerations

- WebSocket connection pooling
- Efficient audio chunking
- Minimal latency for real-time feel
- Background processing for enhancement

## Security

- API keys stored in VS Code settings (encrypted)
- No logging of transcriptions
- Secure WebSocket connections
- No data persistence

## Future Enhancements

- [ ] Audio capture from VS Code (requires WebView)
- [ ] Voice commands (execute VS Code commands)
- [ ] Multi-language support
- [ ] Custom vocabulary
- [ ] Integration with GitHub Copilot Chat
- [ ] Direct insertion into Copilot chat
- [ ] Context from entire workspace

## Testing Strategy

- Unit tests for services
- Integration tests with mock APIs
- Manual testing in Extension Development Host
- Audio quality testing in various environments

## Deployment

1. Build: `vsce package`
2. Publish to VS Code Marketplace
3. GitHub releases for manual installation
