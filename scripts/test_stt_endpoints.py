#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "websockets>=12.0",
#     "python-dotenv>=1.0.0",
# ]
# ///
"""Try different STT endpoints and auth methods."""

import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv
import websockets
import json

async def test_endpoint(name, url, headers=None, query_auth=False):
    """Test a specific endpoint configuration."""
    print(f"\n🧪 {name}")
    print(f"   URL: {url}")
    
    try:
        if query_auth:
            # Auth in URL
            async with websockets.connect(url) as websocket:
                print(f"   ✅ Connected!")
                
                # Send test message
                test_msg = {"type": "ping"}
                await websocket.send(json.dumps(test_msg))
                
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                    print(f"   ✓ Response: {response[:100]}")
                    return True
                except asyncio.TimeoutError:
                    print(f"   ⚠️  No response (normal for STT)")
                    return True
        else:
            # Auth in headers
            async with websockets.connect(url, additional_headers=headers or {}) as websocket:
                print(f"   ✅ Connected!")
                return True
                
    except Exception as e:
        print(f"   ❌ {type(e).__name__}: {str(e)[:100]}")
        return False

async def main():
    # Load credentials
    env_path = Path("/home/openclaw/.openclaw/credentials/elevenlabs.env")
    if env_path.exists():
        load_dotenv(env_path)
    
    api_key = os.getenv("ELEVENLABS_API_KEY")
    
    print("=" * 70)
    print("Testing Different STT Endpoints & Auth Methods")
    print("=" * 70)
    
    tests = [
        # Query parameter auth
        ("STT v1 (query auth)", 
         f"wss://api.elevenlabs.io/v1/speech-to-text?xi-api-key={api_key}",
         None, True),
        
        # Header auth variations
        ("STT v1 (header auth)",
         "wss://api.elevenlabs.io/v1/speech-to-text",
         {"xi-api-key": api_key}, False),
        
        ("STT v1 (bearer auth)",
         "wss://api.elevenlabs.io/v1/speech-to-text",
         {"Authorization": f"Bearer {api_key}"}, False),
        
        # Different endpoints
        ("STT WebSocket v2",
         f"wss://api.elevenlabs.io/v2/speech-to-text?xi-api-key={api_key}",
         None, True),
        
        ("STT Real-time",
         f"wss://api.elevenlabs.io/v1/realtime-transcription?xi-api-key={api_key}",
         None, True),
        
        # Try model-specific endpoints
        ("STT with model",
         f"wss://api.elevenlabs.io/v1/speech-to-text?model=scribe_v1&xi-api-key={api_key}",
         None, True),
    ]
    
    results = []
    for name, url, headers, query_auth in tests:
        success = await test_endpoint(name, url, headers, query_auth)
        results.append((name, success))
        await asyncio.sleep(0.5)  # Rate limiting
    
    print("\n" + "=" * 70)
    print("RESULTS:")
    print("=" * 70)
    for name, success in results:
        status = "✅ WORKS" if success else "❌ FAILED"
        print(f"{status} - {name}")

if __name__ == "__main__":
    asyncio.run(main())
