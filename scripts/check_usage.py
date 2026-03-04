#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "requests>=2.31.0",
#     "python-dotenv>=1.0.0",
# ]
# ///
"""Check if API has STT quota on Starter tier."""

import os
from pathlib import Path
from dotenv import load_dotenv
import requests

# Load credentials
env_path = Path("/home/openclaw/.openclaw/credentials/elevenlabs.env")
if env_path.exists():
    load_dotenv(env_path)

api_key = os.getenv("ELEVENLABS_API_KEY")

# Check user info (includes usage)
url = "https://api.elevenlabs.io/v1/user/subscription"
headers = {"xi-api-key": api_key}

response = requests.get(url, headers=headers)

print("=" * 60)
print("ElevenLabs Subscription & Usage Details")
print("=" * 60)

if response.status_code == 200:
    data = response.json()
    print("\n✅ Subscription Data:")
    print(f"Tier: {data.get('tier', 'N/A')}")
    print(f"\nCharacter Usage:")
    print(f"  Used: {data.get('character_count', 0):,}")
    print(f"  Limit: {data.get('character_limit', 0):,}")
    print(f"  Remaining: {data.get('character_limit', 0) - data.get('character_count', 0):,}")
    
    print(f"\nSpeech-to-Text Usage:")
    if 'speech_to_text' in data:
        stt = data['speech_to_text']
        print(f"  Used: {stt.get('character_count', 0):,}")
        print(f"  Limit: {stt.get('character_limit', 0):,}")
    else:
        print("  ❌ No STT data (feature not available)")
    
    print(f"\nCan extend: {data.get('can_extend_character_limit', False)}")
    print(f"Allowed to extend: {data.get('allowed_to_extend_character_limit', False)}")
    
    print("\n📋 Full data:")
    import json
    print(json.dumps(data, indent=2))
else:
    print(f"❌ Failed: {response.status_code}")
    print(response.text)
