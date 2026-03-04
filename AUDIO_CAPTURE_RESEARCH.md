# Audio Capture Research - VS Code Extension

## Challenge
VS Code extensions run in Node.js environment, but microphone access requires browser APIs. Need to find the best approach.

## Possible Solutions

### Option 1: WebView with WebAudio API ✅ RECOMMENDED
**How it works:**
- Create a WebView panel
- Use browser's `navigator.mediaDevices.getUserMedia()`
- Capture audio in WebView context
- Send audio chunks back to extension via messaging

**Pros:**
- Cross-platform (works on all OS)
- Uses standard Web APIs
- No external dependencies
- Easy to implement

**Cons:**
- Requires WebView UI
- Slight overhead

**Implementation:**
```typescript
// In extension
const panel = vscode.window.createWebviewPanel(
  'audioCapture',
  'Voice Recording',
  vscode.ViewColumn.One,
  { enableScripts: true }
);

// In WebView HTML
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const mediaRecorder = new MediaRecorder(stream);
mediaRecorder.ondataavailable = (e) => {
  // Send to extension
  vscode.postMessage({ type: 'audio', data: e.data });
};
```

### Option 2: External Process (ffmpeg/sox)
**How it works:**
- Spawn child process
- Use system audio tools (ffmpeg, sox, parecord)
- Pipe audio to extension

**Pros:**
- No WebView needed
- Direct audio access

**Cons:**
- Platform-specific (Linux/macOS/Windows)
- Requires external tools
- Harder to distribute

### Option 3: Native Node Module
**How it works:**
- Use native addon (node-microphone, naudiodon)
- Direct access to system audio

**Pros:**
- No WebView
- Better performance

**Cons:**
- Native compilation issues
- Platform-specific binaries
- Hard to bundle with extension

## Decision: Option 1 - WebView ✅

**Rationale:**
- Most reliable cross-platform solution
- Standard Web APIs (getUserMedia, MediaRecorder)
- Easy to implement and test
- No external dependencies
- Works in VS Code's architecture

## Implementation Plan

1. **Create WebView Panel**
   - Hidden or minimal UI
   - Load audio capture script

2. **Audio Capture Script**
   - Request microphone permission
   - MediaRecorder setup
   - Chunk-based streaming
   - Voice Activity Detection (VAD)

3. **Message Passing**
   - Audio chunks → Extension
   - Control messages (start/stop)

4. **Integration**
   - Wire to ElevenLabsService
   - Handle errors gracefully

## Next Steps
- [ ] Create WebView HTML template
- [ ] Implement audio capture script
- [ ] Add message passing
- [ ] Test microphone access
- [ ] Add VAD (Voice Activity Detection)
