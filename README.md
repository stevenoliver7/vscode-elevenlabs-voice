# VS Code ElevenLabs Voice Extension 🎤

High-quality voice input for VS Code using ElevenLabs real-time transcription API.

## ⚠️ Requirements

**This extension requires ffmpeg to be installed:**

```bash
# macOS
brew install ffmpeg

# Linux (Debian/Ubuntu)
sudo apt update && sudo apt install ffmpeg

# Linux (RHEL/Fedora)
sudo dnf install ffmpeg

# Windows (using Chocolatey)
choco install ffmpeg

# Windows (using Scoop)
scoop install ffmpeg
```

Verify installation: `ffmpeg -version`

---

## ✨ Status: Ready for Testing!

**Current Progress:** 70% complete
- ✅ Core features built
- ✅ Automated tests passing
- ⏳ Manual testing in VS Code needed

**Quick Start:** See [QUICK_START.md](QUICK_START.md) to test now!

---

## Why This Exists

The built-in VS Code voice dictation has quality issues, especially in quiet office environments. ElevenLabs' real-time v2 API provides significantly better transcription quality, making it perfect for professional use.

## Features

- 🎯 **High-quality transcription** using ElevenLabs real-time v2
- 🔇 **Office-friendly** - works well without loud articulation
- 🤖 **GitHub Copilot integration** - seamlessly works with your AI coding workflow
- 🧠 **Smart enhancement** - pass transcriptions to Claude/GPT-4 for context-aware cleanup
- ⚡ **Real-time** - see your words appear as you speak

## Use Case

**Your workflow:**
1. Dictate tasks/ideas while coding
2. Pass to GitHub Copilot (Claude Opus 4.6)
3. AI cleans up and implements
4. Review and execute

## Installation

### Prerequisites
- ✅ VS Code 1.85+
- ✅ ElevenLabs API key ([get one here](https://elevenlabs.io))
- ✅ **ffmpeg installed** (see Requirements above)

### Install from Source
```bash
git clone https://github.com/stevenoliver7/vscode-elevenlabs-voice.git
cd vscode-elevenlabs-voice
npm install
npm run compile
npm install -g @vscode/vsce
vsce package
code --install-extension vscode-elevenlabs-voice-0.0.1.vsix
```

For detailed installation instructions, see [INSTALLATION.md](INSTALLATION.md)

---

## Usage

### Basic Voice Input
1. Open Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. Run "ElevenLabs Voice: Configure API Key"
3. Enter your ElevenLabs API key
4. Open any text file
5. Press `Cmd+Alt+V` (macOS) or `Ctrl+Alt+V` (Windows/Linux)
6. Speak your text
7. Press `Cmd+Alt+V` again to stop
8. Text appears in active editor

### With GitHub Copilot
1. Open Copilot chat
2. Start voice recording
3. Dictate your task/idea
4. Copilot receives cleaned-up text

### Smart Enhancement
1. Record voice input
2. Extension automatically passes to configured AI model
3. Model cleans up using project context
4. Enhanced text inserted into editor

## Configuration

```json
{
  "elevenlabsVoice.apiKey": "your-api-key-here",
  "elevenlabsVoice.enhancement.enabled": true,
  "elevenlabsVoice.enhancement.model": "claude-3-5-sonnet-20241022",
  "elevenlabsVoice.enhancement.provider": "anthropic"
}
```

## Development

### Setup
```bash
git clone https://github.com/stevenoliver7/vscode-elevenlabs-voice.git
cd vscode-elevenlabs-voice
npm install
```

### Debug
1. Open in VS Code
2. Press F5 to launch Extension Development Host
3. Test the extension

### Build
```bash
npm run compile
vsce package
```

## Roadmap

- [x] Basic extension structure
- [ ] ElevenLabs WebSocket integration
- [ ] Real-time audio capture
- [ ] VS Code UI integration
- [ ] GitHub Copilot integration
- [ ] Smart enhancement with Claude/GPT-4
- [ ] Context-aware cleanup
- [ ] Custom voice commands
- [ ] Multi-language support

## Technical Details

### Architecture
- **Extension Host**: VS Code extension API
- **Audio Capture**: Web Audio API / Node.js
- **Transcription**: ElevenLabs WebSocket API
- **Enhancement**: OpenAI/Anthropic API

### API Integration
- ElevenLabs Real-time v2 (WebSocket)
- GitHub Copilot Chat API
- OpenAI/Anthropic for enhancement

## Contributing

Contributions welcome! This is an open-source project aimed at improving developer workflows.

## License

MIT

## Credits

Built with ❤️ using:
- [ElevenLabs](https://elevenlabs.io) - Real-time transcription
- [VS Code Extension API](https://code.visualstudio.com/api)
- [GitHub Copilot](https://github.com/features/copilot)

---

**Created for developers who think faster than they type.** 🚀
