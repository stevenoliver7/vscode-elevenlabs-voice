#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "requests>=2.31.0",
#     "python-dotenv>=1.0.0",
# ]
# ///
"""Check current ElevenLabs subscription status."""

import os
from pathlib import Path
from dotenv import load_dotenv
import requests

# Load credentials
env_path = Path("/home/openclaw/.openclaw/credentials/elevenlabs.env")
if env_path.exists():
    load_dotenv(env_path)

api_key = os.getenv("ELEVENLABS_API_KEY")

# Check user subscription
url = "https://api.elevenlabs.io/v1/user/subscription"
headers = {"xi-api-key": api_key}

response = requests.get(url, headers=headers)

print("=" * 60)
print("ElevenLabs Subscription Status Check")
print("=" * 60)

if response.status_code == 200:
    data = response.json()
    print(f"\n✅ Current Tier: {data.get('tier', 'N/A').upper()}")
    print(f"\nCharacter Usage:")
    print(f"  Used: {data.get('character_count', 0):,}")
    print(f"  Limit: {data.get('character_limit', 0):,}")
    print(f"  Remaining: {data.get('character_limit', 0) - data.get('character_count', 0):,}")
    
    # Check for professional voice cloning
    print(f"\nFeatures:")
    print(f"  Professional Voice Cloning: {'✅' if data.get('can_use_professional_voice_cloning') else '❌'}")
    
    print(f"\n📋 Full response:")
    import json
    print(json.dumps(data, indent=2))
else:
    print(f"❌ Failed: {response.status_code}")
    print(response.text)
