#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "requests>=2.31.0",
#     "python-dotenv>=1.0.0",
# ]
# ///
"""Generate ElevenLabs token for WebSocket."""

import os
from pathlib import Path
from dotenv import load_dotenv
import requests

# Load credentials
env_path = Path("/home/openclaw/.openclaw/credentials/elevenlabs.env")
if env_path.exists():
    load_dotenv(env_path)

api_key = os.getenv("ELEVENLABS_API_KEY")

# Generate token
url = "https://api.elevenlabs.io/v1/tokens"
headers = {"xi-api-key": api_key}

print("=" * 60)
print("Generating ElevenLabs Token for WebSocket")
print("=" * 60)

response = requests.post(url, headers=headers)

if response.status_code in [200, 201]:
    data = response.json()
    token = data.get('token')
    print(f"\n✅ Token generated!")
    print(f"Token: {token[:50]}...")
    print(f"\nSave this token for WebSocket connection")
    
    # Save token
    token_file = Path("/home/openclaw/.openclaw/credentials/elevenlabs_token.txt")
    token_file.write_text(token)
    print(f"\n✓ Token saved to: {token_file}")
else:
    print(f"❌ Failed: {response.status_code}")
    print(response.text)
