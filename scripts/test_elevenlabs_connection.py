#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "websockets>=12.0",
#     "python-dotenv>=1.0.0",
# ]
# ///
"""Test ElevenLabs WebSocket connection."""

import asyncio
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

try:
    import websockets
except ImportError:
    print("Installing websockets...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "websockets"])
    import websockets

async def test_connection():
    # Load credentials
    env_path = Path("/home/openclaw/.openclaw/credentials/elevenlabs.env")
    print(f"Loading from: {env_path}")
    print(f"File exists: {env_path.exists()}")
    
    if env_path.exists():
        load_dotenv(env_path)
    
    api_key = os.getenv("ELEVENLABS_API_KEY")
    
    if not api_key:
        print("❌ ELEVENLABS_API_KEY not found")
        print(f"Environment variables: {list(os.environ.keys())}")
        return False
    
    print(f"✓ API key loaded (length: {len(api_key)})")
    
    # Test WebSocket connection
    uri = "wss://api.elevenlabs.io/v1/speech-to-text"
    
    try:
        print(f"\n🔌 Connecting to: {uri}")
        
        headers = {"xi-api-key": api_key}
        
        async with websockets.connect(uri, additional_headers=headers) as websocket:
            print("✅ WebSocket connection established!")
            
            # Send start message
            start_message = {
                "type": "start",
                "model_id": "scribe_v1",
                "language": "en"
            }
            
            import json
            await websocket.send(json.dumps(start_message))
            print("✓ Start message sent")
            
            # Wait for response
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                print(f"✓ Received response: {response}")
                return True
            except asyncio.TimeoutError:
                print("⚠️  No response within 5 seconds (might be waiting for audio)")
                return True
                
    except websockets.exceptions.InvalidStatusCode as e:
        print(f"❌ Connection failed: HTTP {e.status_code}")
        if e.status_code == 401:
            print("   Invalid API key")
        elif e.status_code == 403:
            print("   Access forbidden - check API permissions")
        return False
    except Exception as e:
        print(f"❌ Connection error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("ElevenLabs WebSocket Connection Test")
    print("=" * 60)
    
    success = asyncio.run(test_connection())
    
    print("\n" + "=" * 60)
    if success:
        print("✅ Test PASSED - Connection successful!")
    else:
        print("❌ Test FAILED - Check errors above")
    print("=" * 60)
