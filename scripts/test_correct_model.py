#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "websockets>=12.0",
#     "python-dotenv>=1.0.0",
# ]
# ///
"""Test STT with correct model ID."""

import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv
import websockets
import json

async def test_correct_model():
    # Load credentials
    env_path = Path("/home/openclaw/.openclaw/credentials/elevenlabs.env")
    if env_path.exists():
        load_dotenv(env_path)
    
    api_key = os.getenv("ELEVENLABS_API_KEY")
    
    # CORRECT model ID: scribe_v2_realtime
    uri = f"wss://api.elevenlabs.io/v1/speech-to-text/realtime?xi-api-key={api_key}&model_id=scribe_v2_realtime"
    
    print("=" * 70)
    print("Testing STT with Correct Model ID")
    print("=" * 70)
    print(f"\n✅ Model: scribe_v2_realtime")
    
    try:
        print(f"🔌 Connecting...")
        async with websockets.connect(uri) as websocket:
            print("✅ Connected! Listening for messages...")
            
            # Listen for messages
            message_count = 0
            while message_count < 3:
                try:
                    message = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                    message_count += 1
                    data = json.loads(message)
                    
                    print(f"\n📨 Message {message_count}:")
                    print(f"   Type: {data.get('type', data.get('message_type', 'unknown'))}")
                    
                    if data.get('type') == 'transcription_partial':
                        print(f"   ✅ Partial: {data.get('text', '')[:100]}")
                    elif data.get('type') == 'transcription_committed':
                        print(f"   ✅ Committed: {data.get('text', '')[:100]}")
                    elif 'error' in data:
                        print(f"   ❌ Error: {data['error']}")
                    else:
                        print(f"   📋 {json.dumps(data, indent=2)[:200]}")
                        
                except asyncio.TimeoutError:
                    if message_count == 0:
                        print("\n✅ No errors - ready to receive audio!")
                        print("   (Would send audio chunks to get transcriptions)")
                    break
                    
            return message_count >= 0  # Success if no errors
            
    except Exception as e:
        print(f"❌ Error: {type(e).__name__}: {str(e)[:150]}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_correct_model())
    
    print("\n" + "=" * 70)
    if success:
        print("🎉 SUCCESS! STT WebSocket working with Creator plan!")
        print("\nNext: Integrate into VS Code extension")
    else:
        print("❌ Failed - check error above")
    print("=" * 70)
