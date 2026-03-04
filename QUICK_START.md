# Quick Start Guide - Testing the Extension

## Prerequisites
- ✅ Node.js installed
- ✅ VS Code installed
- ✅ ElevenLabs Creator plan API key

## Setup

### 1. Install & Compile
```bash
cd vscode-elevenlabs-voice
npm install
npm run compile
```

### 2. Configure API Key
Open VS Code settings and add your ElevenLabs API key:
- Command Palette: "ElevenLabs Voice: Configure API Key"
- Enter: `sk_acf19e2dc619132808cda52d7ce8786d49f07f936f469c67`

### 3. Test in Extension Development Host
1. Open folder in VS Code
2. Press F5
3. New VS Code window opens with extension loaded
4. Check Output panel for "Extension Host" messages

## Testing Steps

### Test 1: Extension Activation
- [ ] Extension loads without errors
- [ ] Status bar shows "Voice Input" button
- [ ] Commands appear in Command Palette

### Test 2: Audio Capture
- [ ] Press Cmd+Shift+V (or Ctrl+Shift+V)
- [ ] Microphone permission requested
- [ ] Recording indicator appears
- [ ] Press again to stop

### Test 3: Transcription
- [ ] Open text file
- [ ] Start recording
- [ ] Speak: "Hello world this is a test"
- [ ] Stop recording
- [ ] Text appears in editor

## Troubleshooting

### "Extension not found"
- Make sure you ran `npm run compile`
- Check Output panel for errors

### "Microphone not working"
- Check system permissions
- Try different browser/audio device

### "No transcription"
- Check API key is correct
- Check ElevenLabs dashboard for usage
- Check Output panel for WebSocket errors

## Success Criteria
- ✅ Extension loads
- ✅ Microphone works
- ✅ Transcription appears
- ✅ Quality is good
- ✅ Latency < 2 seconds

---

**Ready to test! Press F5 in VS Code to start.**
