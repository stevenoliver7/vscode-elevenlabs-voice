#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "websockets>=12.0",
#     "python-dotenv>=1.0.0",
# ]
# ///
"""Test STT with minimal config and capture all messages."""

import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv
import websockets
import json

async def test_with_logging():
    # Load credentials
    env_path = Path("/home/openclaw/.openclaw/credentials/elevenlabs.env")
    if env_path.exists():
        load_dotenv(env_path)
    
    api_key = os.getenv("ELEVENLABS_API_KEY")
    
    # Test with just API key, no config
    uri = f"wss://api.elevenlabs.io/v1/speech-to-text/realtime?xi-api-key={api_key}&model_id=scribe_v1"
    
    print("=" * 70)
    print("Testing STT with Minimal Config")
    print("=" * 70)
    
    try:
        print(f"\n🔌 Connecting to realtime endpoint...")
        async with websockets.connect(uri) as websocket:
            print("✅ Connected! Waiting for messages...")
            
            # Listen for all messages
            message_count = 0
            while message_count < 5:
                try:
                    message = await asyncio.wait_for(websocket.recv(), timeout=3.0)
                    message_count += 1
                    print(f"\n📨 Message {message_count}:")
                    print(f"   {message[:300]}")
                    
                    # Parse and display
                    try:
                        data = json.loads(message)
                        print(f"   Type: {data.get('type', 'unknown')}")
                        if 'error' in data:
                            print(f"   ❌ Error: {data['error']}")
                    except:
                        pass
                        
                except asyncio.TimeoutError:
                    print("\n⏱️  No more messages (timeout)")
                    break
                    
            print(f"\n✅ Received {message_count} messages")
            return True
            
    except websockets.exceptions.ConnectionClosedOK:
        print("⚠️  Connection closed normally (1000)")
        print("   This might mean: expecting different message format")
        return False
    except Exception as e:
        print(f"❌ Error: {type(e).__name__}")
        print(f"   {str(e)[:200]}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_with_logging())
    
    print("\n" + "=" * 70)
    if success:
        print("✅ STT endpoint responsive!")
    else:
        print("⚠️  Connection closes - may need different config")
    print("=" * 70)
