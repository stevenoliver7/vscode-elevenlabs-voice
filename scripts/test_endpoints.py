#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "websockets>=12.0",
#     "python-dotenv>=1.0.0",
# ]
# ///
"""Test ElevenLabs Speech-to-Text WebSocket with different endpoints."""

import asyncio
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import websockets

async def test_endpoint(endpoint_name, uri, api_key):
    """Test a specific WebSocket endpoint."""
    print(f"\n🧪 Testing: {endpoint_name}")
    print(f"   URI: {uri}")
    
    headers = {"xi-api-key": api_key}
    
    try:
        async with websockets.connect(uri, additional_headers=headers) as websocket:
            print(f"   ✅ Connection established!")
            
            # Try sending a simple message
            import json
            test_msg = {"type": "test"}
            await websocket.send(json.dumps(test_msg))
            print(f"   ✓ Test message sent")
            
            # Wait briefly for response
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                print(f"   ✓ Response: {response[:100]}")
                return True
            except asyncio.TimeoutError:
                print(f"   ⚠️  No immediate response (normal for some endpoints)")
                return True
                
    except websockets.exceptions.InvalidStatus as e:
        print(f"   ❌ HTTP {e.status_code}")
        return False
    except Exception as e:
        print(f"   ❌ {type(e).__name__}: {str(e)[:100]}")
        return False

async def main():
    # Load credentials
    env_path = Path("/home/openclaw/.openclaw/credentials/elevenlabs.env")
    if env_path.exists():
        load_dotenv(env_path)
    
    api_key = os.getenv("ELEVENLABS_API_KEY")
    
    if not api_key:
        print("❌ ELEVENLABS_API_KEY not found")
        return
    
    print(f"✓ API key loaded (length: {len(api_key)})")
    print("=" * 70)
    
    # Test different possible endpoints
    endpoints = [
        ("Speech-to-text v1", f"wss://api.elevenlabs.io/v1/speech-to-text?xi-api-key={api_key}"),
        ("Speech-to-text with model", f"wss://api.elevenlabs.io/v1/speech-to-text?model_id=scribe_v1&xi-api-key={api_key}"),
        ("WebSocket v2", f"wss://api.elevenlabs.io/v2/speech-to-text?xi-api-key={api_key}"),
    ]
    
    results = []
    for name, uri in endpoints:
        success = await test_endpoint(name, uri, api_key)
        results.append((name, success))
    
    print("\n" + "=" * 70)
    print("RESULTS:")
    print("=" * 70)
    for name, success in results:
        status = "✅ WORKS" if success else "❌ FAILED"
        print(f"{status} - {name}")

if __name__ == "__main__":
    print("=" * 70)
    print("ElevenLabs WebSocket Endpoint Discovery")
    print("=" * 70)
    asyncio.run(main())
