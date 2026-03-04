# Fix: Audio Capture Permission Denied

## The Error
```
Audio capture error: Permission denied
Source: ElevenLabs Voice for VS Code
```

## Why This Happens

The extension needs microphone access, but:
1. Browser/WebView requires explicit permission
2. System might block microphone access
3. VS Code might need permission grant

## Solutions

### Solution 1: Grant Permission in WebView

When you start recording, a permission dialog should appear:

**In the WebView panel:**
- Look for "Allow microphone access" prompt
- Click "Allow" or "Grant Permission"
- Try recording again

### Solution 2: Check System Permissions (macOS)

```bash
# Open System Preferences
open "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone"

# Or manually:
# System Preferences → Security & Privacy → Privacy → Microphone
# ✅ Enable: VS Code (or Electron, Code Helper)
```

### Solution 3: Check System Permissions (Linux)

```bash
# Check if microphone is blocked
pactl list short sources

# If needed, install pulseaudio controls
sudo apt install pavucontrol
pavucontrol
# Go to "Recording" tab
# Enable microphone for VS Code/Electron
```

### Solution 4: Check System Permissions (Windows)

```
Settings → Privacy → Microphone
✅ Allow apps to access your microphone
✅ Allow desktop apps (VS Code)
```

### Solution 5: Browser Permissions (if WebView blocked)

The WebView might have blocked the permission. Try:

1. Open Developer Tools in Extension Development Host
   - `Cmd+Shift+I` or `Help → Toggle Developer Tools`
2. Check Console for permission errors
3. Look for permission prompt in WebView
4. Refresh the WebView (close and reopen)

### Solution 6: HTTPS Requirement

Browsers require HTTPS for microphone access, but VS Code's WebView should work. If not:

```typescript
// The extension uses vscode-webview which should have permissions
// But you might need to explicitly request in the HTML:

// In audioCapture.ts, the HTML already has:
navigator.mediaDevices.getUserMedia({ audio: true })
```

## Quick Test

After granting permission:

1. Open a text file in VS Code
2. Press `Cmd+Shift+V`
3. **Watch for permission dialog**
4. Click "Allow"
5. Recording indicator should turn red
6. Speak: "Testing one two three"
7. Press `Cmd+Shift+V` to stop
8. Text should appear!

## Debug Steps

If still not working:

### Check Console
```bash
# In Extension Development Host:
# View → Output → Select "Extension Host"
# Look for errors about:
# - Permission denied
# - getUserMedia failed
# - Audio capture initialization failed
```

### Test Microphone Separately
```bash
# Test if system microphone works
# macOS:
say "test"

# Linux:
arecord -l  # List devices
arecord -d 3 test.wav  # Record 3 seconds
aplay test.wav  # Play back

# Windows:
# Use Voice Recorder app
```

### Check WebView Logs
```bash
# In the Extension Development Host:
# Open WebView panel (it should appear when recording starts)
# Right-click in WebView → Inspect
# Check Console for errors
```

## Expected Behavior

When permission is granted:

1. ✅ Press `Cmd+Shift+V`
2. ✅ WebView panel opens
3. ✅ **Permission dialog appears** (allow it!)
4. ✅ Recording indicator shows (red pulsing circle)
5. ✅ Console shows: "🎤 Recording started"
6. ✅ Audio chunks being generated (check console)
7. ✅ Press `Cmd+Shift+V` to stop
8. ✅ Text appears in editor

## Still Not Working?

Send me:
1. Screenshot of the permission dialog (if any)
2. Console output from Extension Host
3. Your OS (macOS/Linux/Windows)
4. Whether system microphone works elsewhere

I'll help debug further! 🔧
