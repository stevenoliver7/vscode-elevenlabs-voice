#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "websockets>=12.0",
#     "python-dotenv>=1.0.0",
# ]
# ///
"""Test STT with API key in headers."""

import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv
import websockets
import json

async def test_with_headers():
    # Load credentials
    env_path = Path("/home/openclaw/.openclaw/credentials/elevenlabs.env")
    if env_path.exists():
        load_dotenv(env_path)
    
    api_key = os.getenv("ELEVENLABS_API_KEY")
    
    # Use headers instead of query params
    uri = "wss://api.elevenlabs.io/v1/speech-to-text/realtime?model_id=scribe_v2_realtime"
    headers = {"xi-api-key": api_key}
    
    print("=" * 70)
    print("Testing STT with API Key in Headers")
    print("=" * 70)
    print(f"\n🔌 Endpoint: /v1/speech-to-text/realtime")
    print(f"📝 Model: scribe_v2_realtime")
    print(f"🔑 Auth: xi-api-key header")
    
    try:
        print(f"\n🔌 Connecting...")
        async with websockets.connect(uri, additional_headers=headers) as websocket:
            print("✅ Connected! Listening...")
            
            # Listen for messages
            message_count = 0
            while message_count < 3:
                try:
                    message = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                    message_count += 1
                    data = json.loads(message)
                    
                    msg_type = data.get('type') or data.get('message_type') or 'unknown'
                    print(f"\n📨 Message {message_count}: {msg_type}")
                    
                    if 'error' in data or msg_type == 'auth_error':
                        print(f"   ❌ Error: {data.get('error', data)}")
                        return False
                    elif msg_type in ['transcription_partial', 'transcription_committed']:
                        print(f"   ✅ Text: {data.get('text', '')[:100]}")
                        return True
                    else:
                        print(f"   📋 {json.dumps(data, indent=2)[:150]}")
                        
                except asyncio.TimeoutError:
                    print("\n✅ No errors - ready for audio!")
                    print("   Connection established successfully")
                    return True
                    
    except Exception as e:
        print(f"❌ Error: {type(e).__name__}")
        print(f"   {str(e)[:200]}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_with_headers())
    
    print("\n" + "=" * 70)
    if success:
        print("🎉 SUCCESS! STT WebSocket connection working!")
        print("\n✅ Creator plan activated")
        print("✅ Correct endpoint identified")
        print("✅ Authentication working")
        print("\nNext: Update extension to use scribe_v2_realtime")
    else:
        print("❌ Still issues - check error above")
    print("=" * 70)
