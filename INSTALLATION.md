# Installation Guide - Private Machine

## Option 1: Install from Source (Recommended for Development)

### Step 1: Clone Repository
```bash
git clone https://github.com/stevenoliver7/vscode-elevenlabs-voice.git
cd vscode-elevenlabs-voice
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Compile TypeScript
```bash
npm run compile
```

### Step 4: Package Extension
```bash
# Install vsce if not already installed
npm install -g @vscode/vsce

# Create .vsix package
vsce package
```

This creates: `vscode-elevenlabs-voice-0.0.1.vsix`

### Step 5: Install in VS Code
```bash
# Method A: Command line
code --install-extension vscode-elevenlabs-voice-0.0.1.vsix

# Method B: VS Code UI
# 1. Open VS Code
# 2. Extensions panel (Cmd+Shift+X)
# 3. Click "..." menu
# 4. "Install from VSIX..."
# 5. Select the .vsix file
```

### Step 6: Configure API Key
**SECURE METHOD - Never hardcode keys!**

1. Open VS Code Settings (`Cmd+,`)
2. Search for "ElevenLabs"
3. Enter API key in secure input field
4. Key is stored encrypted in VS Code settings

**OR use environment variable:**
```bash
# Add to your shell profile (~/.bashrc, ~/.zshrc, etc.)
export ELEVENLABS_API_KEY="your-key-here"

# Restart VS Code to pick up the variable
```

---

## Option 2: Development Mode (For Testing)

### Quick Test
```bash
cd vscode-elevenlabs-voice
npm install
npm run compile
code .  # Opens in VS Code
# Press F5 to launch Extension Development Host
```

### Configure in Development
1. In Extension Development Host window
2. `Cmd+Shift+P` → "ElevenLabs Voice: Configure API Key"
3. Enter key in the secure input (not logged)

---

## Option 3: Install from VS Code Marketplace (Future)

*Coming after Phase 7 - will be published to marketplace*

```bash
# Search in VS Code Extensions
# "ElevenLabs Voice"
# Click Install
```

---

## Security Best Practices

### ❌ NEVER Do This:
```javascript
// DON'T hardcode API keys
const apiKey = "sk_xxxxx";  // ❌ WRONG

// DON'T commit keys to git
git add .env  // ❌ WRONG

// DON'T log keys
console.log(apiKey);  // ❌ WRONG

// DON'T show keys in screenshots/messages
```

### ✅ ALWAYS Do This:
```javascript
// Use environment variables
const apiKey = process.env.ELEVENLABS_API_KEY;  // ✅ RIGHT

// Use VS Code secure storage
const config = vscode.workspace.getConfiguration('elevenlabsVoice');
const apiKey = config.get<string>('apiKey');  // ✅ RIGHT

// Add to .gitignore
.env  // ✅ RIGHT

// Use encrypted settings
// VS Code handles encryption automatically  // ✅ RIGHT
```

---

## File Structure After Installation

```
vscode-elevenlabs-voice/
├── out/                    # Compiled JavaScript
│   ├── extension.js
│   ├── elevenLabsService.js
│   ├── audioCapture.js
│   └── transcriptionEnhancer.js
├── src/                    # TypeScript source
├── node_modules/           # Dependencies
├── package.json            # Extension manifest
└── README.md              # Documentation
```

---

## Verification

After installation, verify:

```bash
# Check extension is installed
code --list-extensions | grep elevenlabs

# Should output:
# stevenoliver7.vscode-elevenlabs-voice
```

In VS Code:
1. Open Command Palette (`Cmd+Shift+P`)
2. Type "ElevenLabs"
3. Should see commands listed

---

## Uninstallation

```bash
# Command line
code --uninstall-extension stevenoliver7.vscode-elevenlabs-voice

# VS Code UI
# Extensions panel → Find extension → Click uninstall
```

---

## Troubleshooting

### "Extension not found"
- Make sure you ran `vsce package`
- Check the .vsix file exists
- Verify VS Code version >= 1.85.0

### "API key not working"
- Use the secure configuration method (Cmd+Shift+P)
- Don't hardcode in settings.json
- Check key hasn't been revoked

### "Microphone not working"
- Check system permissions
- Grant access when prompted
- Try different audio device

---

## Next Steps

After installation:
1. Configure API key securely
2. Open a text file
3. Press `Cmd+Shift+V`
4. Start speaking!
