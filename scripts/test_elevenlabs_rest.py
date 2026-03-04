#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "requests>=2.31.0",
#     "python-dotenv>=1.0.0",
# ]
# ///
"""Test ElevenLabs REST API connection."""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

try:
    import requests
except ImportError:
    print("Installing requests...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests

def test_api():
    # Load credentials
    env_path = Path("/home/openclaw/.openclaw/credentials/elevenlabs.env")
    if env_path.exists():
        load_dotenv(env_path)
    
    api_key = os.getenv("ELEVENLABS_API_KEY")
    
    if not api_key:
        print("❌ ELEVENLABS_API_KEY not found")
        return False
    
    print(f"✓ API key loaded (length: {len(api_key)})")
    
    # Test REST API connection
    url = "https://api.elevenlabs.io/v1/user"
    
    headers = {
        "xi-api-key": api_key
    }
    
    try:
        print(f"\n🔌 Testing REST API: {url}")
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ API connection successful!")
            print(f"   User: {data.get('email', 'N/A')}")
            print(f"   Subscription: {data.get('subscription', {}).get('tier', 'N/A')}")
            return True
        else:
            print(f"❌ API request failed: HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("ElevenLabs REST API Connection Test")
    print("=" * 60)
    
    success = test_api()
    
    print("\n" + "=" * 60)
    if success:
        print("✅ Test PASSED - API key is valid!")
    else:
        print("❌ Test FAILED - Check API key")
    print("=" * 60)
