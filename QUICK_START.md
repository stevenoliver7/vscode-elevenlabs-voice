# Quick Start Guide - VS Code ElevenLabs Voice Extension

## ⚠️ Prerequisites

### 1. Install ffmpeg (REQUIRED)

**macOS:**
```bash
brew install ffmpeg
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Linux (RHEL/Fedora):**
```bash
sudo dnf install ffmpeg
```

**Windows (Chocolatey):**
```bash
choco install ffmpeg
```

**Verify installation:**
```bash
ffmpeg -version
```

### 2. Get ElevenLabs API Key
1. Go to https://elevenlabs.io
2. Sign up for Creator plan ($22/month, required for STT)
3. Go to Settings → API Keys
4. Generate new API key
5. **Keep it secure!** Never share or commit it

---

## Installation

### Option 1: From Source (Development)
```bash
# Clone repository
git clone https://github.com/stevenoliver7/vscode-elevenlabs-voice.git
cd vscode-elevenlabs-voice

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Test in Extension Development Host
# Open folder in VS Code
code .

# Press F5 to launch Extension Development Host
# New window opens with extension loaded
```

### Option 2: Package & Install
```bash
# After cloning and compiling
npm install -g @vscode/vsce
vsce package

# Creates: vscode-elevenlabs-voice-0.0.1.vsix
code --install-extension vscode-elevenlabs-voice-0.0.1.vsix
```

---

## Configuration

### Step 1: Add API Key
1. Open VS Code
2. Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
3. Type: "ElevenLabs Voice: Configure API Key"
4. Enter your API key (kept encrypted in settings)
5. Press Enter

### Step 2: Test Recording
1. Open any text file
2. Press `Cmd+Alt+V` (macOS) or `Ctrl+Alt+V` (Windows/Linux)
3. **Look for:** "🎤 Recording started" notification
4. Speak: "Hello world this is a test"
5. Press `Cmd+Alt+V` again to stop
6. **Look for:** Text appearing in editor

---

## Keybindings

| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| Start/Stop Recording | `Cmd+Alt+V` | `Ctrl+Alt+V` |

**Note:** Changed from `Cmd+Shift+V` to avoid conflict with Markdown preview

---

## Troubleshooting

### "ffmpeg not found"
```bash
# Verify ffmpeg is in PATH
which ffmpeg

# If not found, install (see Prerequisites above)
```

### "Permission denied" errors
This extension uses native ffmpeg process, not WebView. No browser permissions needed.

**If still seeing permission errors:**
- Check system microphone permissions (System Preferences → Security & Privacy → Microphone)
- Ensure VS Code has microphone access
- Try recording with: `ffmpeg -f avfoundation -i ":0" -t 5 test.wav`

### "No transcription appears"
1. Check API key is correct
2. Check ElevenLabs dashboard for usage
3. Open Developer Tools (Help → Toggle Developer Tools)
4. Check Console for errors
5. Check Output → "Extension Host" for logs

### "Audio not captured"
```bash
# Test microphone separately
# macOS:
ffmpeg -f avfoundation -i ":0" -t 5 -ar 16000 -ac 1 test.wav

# Play back:
afplay test.wav  # macOS
aplay test.wav   # Linux
```

---

## Expected Behavior

### When Recording Starts:
1. ✅ Notification: "🎤 Recording started"
2. ✅ Status bar shows red "Recording..." button
3. ✅ ffmpeg process starts (check Activity Monitor/Task Manager)
4. ✅ Console shows: "Starting ffmpeg with args: ..."

### While Recording:
- Console shows audio chunks being sent (every 100ms)
- No errors in Output panel

### When Recording Stops:
1. ✅ Notification: "🎤 Recording stopped"
2. ✅ Status bar returns to normal
3. ✅ Text appears in editor
4. ✅ ffmpeg process terminates

---

## Performance

- **Latency:** ~100-500ms (real-time streaming)
- **CPU:** Low (~2-5% for ffmpeg process)
- **Memory:** ~20-30MB
- **Audio quality:** Excellent (raw PCM 16-bit)

---

## Tips for Best Results

1. **Speak clearly** - Clear articulation improves accuracy
2. **Quiet environment** - Less background noise = better transcription
3. **Pause briefly** - Short pauses help with sentence detection
4. **Technical terms** - Enunciate technical terms clearly
5. **Use enhancement** - Enable AI enhancement for cleaner text

---

## Next Steps

After basic voice input works:
- Enable AI enhancement in settings
- Add Claude or OpenAI API key for enhancement
- Test with technical content
- Integrate with Copilot workflow

---

## Support

- **Issues:** https://github.com/stevenoliver7/vscode-elevenlabs-voice/issues
- **Docs:** See README.md, INSTALLATION.md, FFMPEG_FIX.md
- **Security:** See SECURITY.md for API key handling

---

**That's it! Install ffmpeg, configure API key, press Cmd+Alt+V, and start talking!** 🎤✨
