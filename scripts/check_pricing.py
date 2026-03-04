#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "requests>=2.31.0",
#     "python-dotenv>=1.0.0",
# ]
# ///
"""Check if ElevenLabs has pay-as-you-go pricing."""

import os
from pathlib import Path
from dotenv import load_dotenv
import requests

# Load credentials
env_path = Path("/home/openclaw/.openclaw/credentials/elevenlabs.env")
if env_path.exists():
    load_dotenv(env_path)

api_key = os.getenv("ELEVENLABS_API_KEY")

# Check billing/pricing API
endpoints = [
    ("User Info", "https://api.elevenlabs.io/v1/user"),
    ("Subscription", "https://api.elevenlabs.io/v1/subscription"),
    ("Usage", "https://api.elevenlabs.io/v1/usage"),
    ("Billing", "https://api.elevenlabs.io/v1/billing"),
]

headers = {"xi-api-key": api_key}

print("=" * 70)
print("Checking ElevenLabs Pricing & Billing Options")
print("=" * 70)

for name, url in endpoints:
    print(f"\n🔍 {name}: {url}")
    try:
        response = requests.get(url, headers=headers)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("   ✅ Success!")
            import json
            print(json.dumps(data, indent=2)[:500])
        elif response.status_code == 404:
            print("   ⚠️  Endpoint not found")
        else:
            print(f"   ❌ Error: {response.text[:200]}")
    except Exception as e:
        print(f"   ❌ Exception: {e}")

# Try to get pricing info from public API
print("\n" + "=" * 70)
print("Public Pricing Info")
print("=" * 70)

try:
    # No auth needed for public pricing
    response = requests.get("https://api.elevenlabs.io/v1/models")
    if response.status_code == 200:
        models = response.json()
        print(f"\nFound {len(models)} models")
        for m in models:
            if 'speech' in m.get('type', '').lower() or 'scribe' in m.get('model_id', '').lower():
                print(f"\n🎤 {m.get('model_id')}: {m.get('name')}")
                print(f"   Type: {m.get('type')}")
                if 'pricing' in m:
                    print(f"   Pricing: {m['pricing']}")
except Exception as e:
    print(f"Error: {e}")
