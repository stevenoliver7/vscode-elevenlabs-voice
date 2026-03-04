# Testing Guide - VS Code ElevenLabs Voice Extension

## Prerequisites

1. **ElevenLabs API Key**
   - Get from: https://elevenlabs.io
   - Required for: Real-time transcription
   - Configure in VS Code settings or `.env`

2. **Anthropic/OpenAI API Key** (Optional)
   - For AI enhancement feature
   - Configure in `.env`

## Setup

### 1. Install Dependencies
```bash
cd vscode-elevenlabs-voice
npm install
```

### 2. Configure API Keys

**Option A: VS Code Settings**
1. Open Command Palette (`Cmd+Shift+P`)
2. Run "ElevenLabs Voice: Configure API Key"
3. Enter your ElevenLabs API key

**Option B: Environment Variables**
Create `.env` file:
```bash
ELEVENLABS_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here  # Optional
OPENAI_API_KEY=your_key_here      # Optional
```

### 3. Launch Extension
```bash
# In VS Code
1. Open the extension folder
2. Press F5 to launch Extension Development Host
3. This opens a new VS Code window with the extension loaded
```

## Testing Checklist

### Phase 1: Basic Functionality
- [ ] Extension loads without errors
- [ ] Status bar shows "Voice Input" button
- [ ] Command palette shows extension commands
- [ ] API key configuration works

### Phase 2: Audio Capture
- [ ] Microphone permission request appears
- [ ] Recording starts when button pressed
- [ ] WebView shows recording indicator
- [ ] Audio chunks are generated (check console)
- [ ] Recording stops when button pressed again

### Phase 3: ElevenLabs Integration
- [ ] WebSocket connection established
- [ ] Audio streams to ElevenLabs
- [ ] Transcription received
- [ ] Text appears in editor
- [ ] Real-time transcription works
- [ ] Final transcription captured

### Phase 4: Enhancement (Optional)
- [ ] Claude/GPT-4 enhancement works
- [ ] Context is extracted from editor
- [ ] Enhanced text is cleaner than original
- [ ] Errors handled gracefully

### Phase 5: Copilot Integration
- [ ] Text inserts into Copilot chat
- [ ] Workflow is smooth
- [ ] No conflicts with Copilot

## Debugging

### Enable Debug Logging
In VS Code settings:
```json
{
  "elevenlabsVoice.debug": true
}
```

### Check Console
1. Open Developer Tools in Extension Development Host
2. View → Output → Select "Extension Host"
3. Look for extension messages

### Common Issues

**Microphone Access Denied**
- Check system permissions
- Ensure HTTPS (WebView requirement)
- Try different browser

**WebSocket Connection Failed**
- Verify API key is correct
- Check network connectivity
- Review ElevenLabs API status

**No Transcription**
- Verify audio is being captured
- Check WebSocket messages
- Ensure ElevenLabs service is running

## Manual Testing Scenarios

### Scenario 1: Simple Dictation
1. Open text file
2. Press `Cmd+Shift+V`
3. Say: "Create a function that adds two numbers"
4. Text should appear in editor

### Scenario 2: Code Comment
1. Open JavaScript file
2. Place cursor above function
3. Record: "This function validates user input"
4. Check comment formatting

### Scenario 3: Copilot Integration
1. Open Copilot chat
2. Record: "Write a function to sort an array"
3. Review Copilot response
4. Execute code

### Scenario 4: Office Environment
1. Lower your voice
2. Speak naturally (don't over-articulate)
3. Test quality compared to built-in dictation

## Performance Testing

### Latency
- Time from speech to text appearance
- Target: <500ms for real-time feel

### Accuracy
- Compare transcription quality to built-in
- Test with technical terms
- Test with different accents

### Resource Usage
- Monitor CPU usage
- Check memory consumption
- Verify no memory leaks

## Reporting Issues

When reporting issues, include:
1. VS Code version
2. Extension version
3. OS and version
4. Steps to reproduce
5. Expected vs actual behavior
6. Console logs
7. Screenshots if relevant

---

**Next Steps:**
1. Wait for ElevenLabs API key
2. Run through testing checklist
3. Report any issues found
4. Continue with Copilot integration
