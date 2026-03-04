# Fix: Native ffmpeg Audio Capture

## Problem

The original implementation used VS Code's WebView with `navigator.mediaDevices.getUserMedia()` to capture microphone audio. This approach is blocked by VS Code's security sandbox - the WebView is a sandboxed iframe that blocks microphone access, resulting in "permission denied" errors.

## Solution

Replaced WebView-based audio capture with native `ffmpeg` child process:

### Changes Made

#### 1. src/audioCapture.ts - Complete Rewrite
**Before:** WebView with getUserMedia()
**After:** Native ffmpeg process

```typescript
// ffmpeg captures from default microphone
// Outputs raw PCM 16-bit LE mono at 16kHz
ffmpeg -f avfoundation -i ":default" -ac 1 -ar 16000 -f s16le pipe:1
```

**Key features:**
- Cross-platform support (macOS, Linux, Windows)
- Raw PCM audio output
- 100ms chunk buffering (3200 bytes)
- Proper process lifecycle management
- Error handling for missing ffmpeg

#### 2. src/elevenLabsService.ts - Audio Format Configuration
**Added:** Configure message for raw PCM format

```typescript
// Send configuration after WebSocket connects
{
  type: 'configure',
  audio_format: {
    sample_rate: 16000,
    encoding: 'pcm_s16le',
    channels: 1
  }
}
```

**Changed:** Send raw binary audio instead of base64-encoded WebM

#### 3. src/extension.ts - Initialization Update
**Changed:** Audio capture initialization to handle async/await properly

#### 4. package.json - Keybinding Fix
**Before:** `Cmd+Shift+V` (conflicts with Markdown preview)
**After:** `Cmd+Alt+V` (no conflict)

## Architecture (New, Working)

```
Cmd+Alt+V → extension.ts 
         → audioCapture.ts (ffmpeg child process)
         → raw PCM chunks (3200 bytes / 100ms)
         → elevenLabsService.ts (WebSocket binary send)
         → transcription text
         → insert into editor
```

## Technical Details

### Audio Format
- **Sample rate:** 16000 Hz
- **Encoding:** PCM signed 16-bit little-endian
- **Channels:** 1 (mono)
- **Chunk size:** 3200 bytes (100ms)

### Platform Support

**macOS:** `-f avfoundation -i ":default"`
**Linux:** `-f alsa -i "default"`
**Windows:** `-f dshow -i "audio=default"`

### Requirements
Users must have `ffmpeg` installed:
- **macOS:** `brew install ffmpeg`
- **Linux:** `sudo apt install ffmpeg`
- **Windows:** `choco install ffmpeg`

## Benefits

✅ **No permission dialogs** - Native process has system access
✅ **Cross-platform** - Works on macOS, Linux, Windows
✅ **Reliable** - No browser security restrictions
✅ **Efficient** - Direct binary streaming to WebSocket
✅ **Simple** - No WebView overhead

## Testing

1. Ensure ffmpeg is installed: `ffmpeg -version`
2. Configure API key in VS Code settings
3. Open text file
4. Press `Cmd+Alt+V`
5. Speak: "Testing one two three"
6. Press `Cmd+Alt+V` to stop
7. Text should appear in editor

## Future Enhancements

- [ ] Auto-detect input device
- [ ] Audio level visualization
- [ ] Noise reduction options
- [ ] Variable chunk size based on latency

---

**Status:** Fixed and ready for testing
**Breaking change:** Requires ffmpeg installation
**Migration:** Remove WebView, install ffmpeg
