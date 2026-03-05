# Voice Scribe

Real-time voice-to-text for VS Code with live rewriting. Speak and watch your words appear — and get corrected — as you talk.

Uses the ElevenLabs Scribe v2 realtime WebSocket API for high-quality speech-to-text, with aggressive partial-transcript rewriting so earlier words improve as more context arrives.

## Features

- **Live rewriting** — partial transcripts replace the "live zone" in your editor as the model refines its hypothesis
- **VAD auto-commit** — voice activity detection automatically commits text when you pause
- **Office-friendly** — works well in quiet environments without loud articulation
- **Optional AI enhancement** — pass committed transcripts through Claude or GPT-4 for grammar/formatting cleanup
- **Cross-platform** — macOS, Linux, and Windows (via ffmpeg)

## Requirements

- **VS Code** 1.85+
- **ffmpeg** installed and on PATH
- **ElevenLabs API key** with Scribe v2 access ([elevenlabs.io](https://elevenlabs.io))

```bash
# macOS
brew install ffmpeg

# Linux (Debian/Ubuntu)
sudo apt install ffmpeg

# Windows
choco install ffmpeg
```

## Installation

```bash
git clone https://github.com/1vecera/vscode-voice-scribe.git
cd vscode-voice-scribe
npm install
npm run compile
npx @vscode/vsce package
code --install-extension vscode-voice-scribe-0.1.0.vsix
```

Or press **F5** in VS Code to launch the Extension Development Host.

## Usage

1. **Configure API key**: `Cmd+Shift+P` → "Voice Scribe: Configure API Key"
2. **Start recording**: `Cmd+Alt+V` (macOS) / `Ctrl+Alt+V`
3. **Speak** — text appears and rewrites in real time
4. **Stop recording**: press the same shortcut again

The status bar shows a microphone icon; it turns red while recording.

## Configuration

| Setting | Default | Description |
|---|---|---|
| `voiceScribe.apiKey` | `""` | Your ElevenLabs API key |
| `voiceScribe.enhancement.enabled` | `false` | Run committed text through an AI model |
| `voiceScribe.enhancement.model` | `claude-3-5-sonnet-20241022` | Model for enhancement |
| `voiceScribe.enhancement.provider` | `anthropic` | `anthropic` or `openai` |

## How it works

1. **ffmpeg** captures microphone audio as 16 kHz 16-bit PCM mono
2. 100 ms chunks are base64-encoded and sent over a WebSocket to the ElevenLabs Scribe v2 realtime API
3. `partial_transcript` messages replace the live zone in the editor (the model rewrites earlier words as context grows)
4. `committed_transcript` messages lock the text in place, clear the live decoration, and advance the cursor
5. An edit queue serializes all editor mutations to prevent race conditions

## Development

```bash
npm install
npm run watch   # compile on save
# Press F5 to launch Extension Development Host
```

## License

MIT
work fairly well. 
