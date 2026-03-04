#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "requests>=2.31.0",
#     "python-dotenv>=1.0.0",
# ]
# ///
"""Check ElevenLabs subscription and features."""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import requests

def check_subscription():
    # Load credentials
    env_path = Path("/home/openclaw/.openclaw/credentials/elevenlabs.env")
    if env_path.exists():
        load_dotenv(env_path)
    
    api_key = os.getenv("ELEVENLABS_API_KEY")
    
    # Get subscription info
    url = "https://api.elevenlabs.io/v1/subscription"
    headers = {"xi-api-key": api_key}
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Subscription Info:")
        print(f"   Tier: {data.get('tier', 'N/A')}")
        print(f"   Character count: {data.get('character_count', 0)}")
        print(f"   Character limit: {data.get('character_limit', 0)}")
        print(f"   Can extend: {data.get('can_extend_character_limit', False)}")
        print(f"   Allowed to extend: {data.get('allowed_to_extend_character_limit', False)}")
        
        # Check for speech-to-text specific info
        print("\n📋 Full subscription data:")
        import json
        print(json.dumps(data, indent=2))
    else:
        print(f"❌ Failed: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    print("=" * 60)
    print("ElevenLabs Subscription Check")
    print("=" * 60)
    check_subscription()
