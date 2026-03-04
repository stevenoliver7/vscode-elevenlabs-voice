#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "requests>=2.31.0",
#     "python-dotenv>=1.0.0",
# ]
# ///
"""Test ElevenLabs models access."""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import requests

def test_models():
    # Load credentials
    env_path = Path("/home/openclaw/.openclaw/credentials/elevenlabs.env")
    if env_path.exists():
        load_dotenv(env_path)
    
    api_key = os.getenv("ELEVENLABS_API_KEY")
    
    if not api_key:
        print("❌ ELEVENLABS_API_KEY not found")
        return False
    
    print(f"✓ API key loaded (length: {len(api_key)})")
    
    # Test models endpoint
    url = "https://api.elevenlabs.io/v1/models"
    
    headers = {
        "xi-api-key": api_key
    }
    
    try:
        print(f"\n🔌 Testing models endpoint: {url}")
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            models = response.json()
            print("✅ Models access successful!")
            print(f"\nAvailable models ({len(models)}):")
            for model in models:
                model_id = model.get('model_id', 'N/A')
                name = model.get('name', 'N/A')
                model_type = model.get('type', 'N/A')
                print(f"  - {model_id}: {name} ({model_type})")
            
            # Check for speech-to-text models
            stt_models = [m for m in models if 'speech_to_text' in m.get('type', '').lower() or 'scribe' in m.get('model_id', '').lower()]
            if stt_models:
                print(f"\n🎤 Speech-to-text models found: {len(stt_models)}")
                for m in stt_models:
                    print(f"  - {m.get('model_id')}: {m.get('name')}")
            
            return True
        else:
            print(f"❌ Models request failed: HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("ElevenLabs Models Access Test")
    print("=" * 60)
    
    success = test_models()
    
    print("\n" + "=" * 60)
    if success:
        print("✅ Test PASSED - Can access models!")
    else:
        print("❌ Test FAILED - Check API key permissions")
    print("=" * 60)
