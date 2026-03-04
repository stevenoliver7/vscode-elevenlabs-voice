# Security Guidelines - IMPORTANT

## ⚠️ CRITICAL: API Key Security

### NEVER Expose API Keys

**This applies to ALL API keys:**
- ElevenLabs
- OpenAI
- Anthropic/Claude
- Any third-party service

---

## What Went Wrong

❌ **I exposed an API key in a message**
- This is a security risk
- Keys should NEVER be visible in:
  - Chat messages
  - Code commits
  - Documentation
  - Screenshots
  - Logs

---

## Correct Practices

### 1. Storage Location
```bash
# ✅ RIGHT: Use secure credential storage
~/.openclaw/credentials/elevenlabs.env  # Owned by user, mode 600

# ✅ RIGHT: Use VS Code encrypted settings
# Settings → ElevenLabs → API Key (encrypted field)

# ❌ WRONG: In source code
src/config.ts  # Never hardcode

# ❌ WRONG: In plain text files
README.md  # Never show actual keys
```

### 2. In Code
```typescript
// ✅ RIGHT: Load from secure storage
const apiKey = vscode.workspace.getConfiguration('elevenlabsVoice')
  .get<string>('apiKey');

// ✅ RIGHT: From environment
const apiKey = process.env.ELEVENLABS_API_KEY;

// ❌ WRONG: Hardcoded
const apiKey = "sk_xxxxx";  // NEVER!
```

### 3. In Git
```bash
# ✅ RIGHT: Add to .gitignore
.env
credentials/
*.key
secrets.json

# ✅ RIGHT: Use example files
.env.example  # Template only

# ❌ WRONG: Commit credentials
git add .env  # NEVER!
```

### 4. In Messages/Docs
```markdown
<!-- ✅ RIGHT: Use placeholders -->
Configure your API key in settings
Enter: your-api-key-here

<!-- ❌ WRONG: Show actual key -->
Enter: sk_acf19e2dc619132808cda52d7ce8786d49f07f936f469c67
```

---

## If a Key is Exposed

### Immediate Actions:
1. **Revoke the key** in the service dashboard
2. **Generate new key**
3. **Update all systems** using the old key
4. **Audit logs** for unauthorized usage
5. **Review** where else it might be exposed

### For This Project:
- [ ] Daniel: Revoke old ElevenLabs key
- [ ] Daniel: Generate new key
- [ ] Daniel: Update stored credentials
- [ ] Me: Never show keys in messages again

---

## File Permissions

```bash
# ✅ RIGHT: Restrict access
chmod 600 ~/.openclaw/credentials/elevenlabs.env
chown $USER:$USER ~/.openclaw/credentials/elevenlabs.env

# Verify
ls -la ~/.openclaw/credentials/
# Should show: -rw------- 1 user user
```

---

## Checklist for This Project

- [x] Credentials stored in `~/.openclaw/credentials/`
- [x] Files have correct permissions (600)
- [x] `.gitignore` excludes credentials
- [ ] **Remove exposed keys from chat history**
- [ ] **Daniel to rotate exposed key**
- [ ] Update documentation to use placeholders

---

## Reminders for Future

**Before showing any text that might contain keys:**
1. Check for `sk_`, `api_key`, `token`, etc.
2. Replace with `your-key-here` or `***`
3. Never log keys to console
4. Never commit keys to git
5. Never show keys in screenshots

---

## Resources

- [VS Code Extension Security](https://code.visualstudio.com/api/extension-guides/vulnerabilities)
- [ElevenLabs API Security](https://elevenlabs.io/docs/security)
- [OWASP API Security](https://owasp.org/www-project-api-security/)

---

**Lesson learned:** Security first, always. No exceptions.
