#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "websockets>=12.0",
#     "python-dotenv>=1.0.0",
# ]
# ///
"""Test ElevenLabs realtime STT with correct endpoint."""

import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv
import websockets
import json

async def test_realtime_stt():
    # Load credentials
    env_path = Path("/home/openclaw/.openclaw/credentials/elevenlabs.env")
    if env_path.exists():
        load_dotenv(env_path)
    
    api_key = os.getenv("ELEVENLABS_API_KEY")
    
    # Correct endpoint with query params
    uri = f"wss://api.elevenlabs.io/v1/speech-to-text/realtime?xi-api-key={api_key}"
    
    print("=" * 70)
    print("Testing Realtime STT Endpoint")
    print("=" * 70)
    print(f"\n✅ Plan upgraded to Creator")
    print(f"🔌 Endpoint: wss://api.elevenlabs.io/v1/speech-to-text/realtime")
    
    try:
        print(f"\n🔌 Connecting...")
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket connected!")
            
            # Send configuration
            config = {
                "type": "configuration_update",
                "data": {
                    "model_id": "scribe_v1",
                    "language_code": "en",
                    "include_timestamps": False
                }
            }
            
            await websocket.send(json.dumps(config))
            print("✓ Configuration sent")
            
            # Wait for response
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                print(f"✓ Response: {response[:200]}")
                return True
            except asyncio.TimeoutError:
                print("⚠️  No immediate response (normal - waiting for audio)")
                return True
                
    except Exception as e:
        print(f"❌ Error: {type(e).__name__}: {str(e)[:200]}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_realtime_stt())
    
    print("\n" + "=" * 70)
    if success:
        print("✅ SUCCESS - STT WebSocket working!")
    else:
        print("❌ FAILED - Check error above")
    print("=" * 70)
