import WebSocket from 'ws';
import * as vscode from 'vscode';

export class ElevenLabsService {
    private apiKey: string;
    private ws: WebSocket | null = null;
    private isTranscribing = false;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async startTranscription(onText: (text: string) => void): Promise<void> {
        if (this.isTranscribing) {
            throw new Error('Already transcribing');
        }

        return new Promise((resolve, reject) => {
            try {
                // CORRECT endpoint and model for ElevenLabs STT
                const wsUrl = `wss://api.elevenlabs.io/v1/speech-to-text/realtime?model_id=scribe_v2_realtime`;

                this.ws = new WebSocket(wsUrl, {
                    headers: {
                        'xi-api-key': this.apiKey
                    }
                });

                this.ws.on('open', async () => {
                    this.isTranscribing = true;
                    console.log('Connected to ElevenLabs');
                    
                    // Configure audio format for raw PCM
                    const configMessage = {
                        type: 'configure',
                        audio_format: {
                            sample_rate: 16000,
                            encoding: 'pcm_s16le',
                            channels: 1
                        }
                    };
                    
                    this.ws!.send(JSON.stringify(configMessage));
                    console.log('Audio format configured: PCM 16-bit LE, 16kHz, Mono');
                    
                    resolve();
                });

                this.ws.on('message', (data: WebSocket.Data) => {
                    try {
                        const message = JSON.parse(data.toString());
                        const msgType = message.type || message.message_type;

                        // Handle different message types
                        if (msgType === 'session_started') {
                            console.log('ElevenLabs session started:', message.session_id);
                        } else if (msgType === 'transcription_partial') {
                            const text = message.text || '';
                            if (text) {
                                onText(text);
                            }
                        } else if (msgType === 'transcription_committed') {
                            const text = message.text || '';
                            if (text) {
                                onText(text);
                            }
                        } else if (msgType === 'final_transcription') {
                            const text = message.text || '';
                            if (text) {
                                onText(text);
                            }
                        }
                    } catch (error) {
                        console.error('Failed to parse message:', error);
                    }
                });

                this.ws.on('error', (error: Error) => {
                    console.error('WebSocket error:', error);
                    this.isTranscribing = false;
                    reject(error);
                });

                this.ws.on('close', () => {
                    this.isTranscribing = false;
                    console.log('Disconnected from ElevenLabs');
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    async stopTranscription(): Promise<string> {
        return new Promise((resolve) => {
            if (this.ws && this.isTranscribing) {
                // Send close event for final transcription
                this.ws.send(JSON.stringify({ 
                    type: 'close_session' 
                }));

                // Wait for final transcription
                const finalHandler = (data: WebSocket.Data) => {
                    try {
                        const message = JSON.parse(data.toString());
                        const msgType = message.type || message.message_type;
                        
                        if (msgType === 'final_transcription' || msgType === 'session_ended') {
                            this.ws?.off('message', finalHandler);
                            this.ws?.close();
                            this.isTranscribing = false;
                            resolve(message.text || '');
                        }
                    } catch (error: unknown) {
                        console.error('Error parsing final message:', error);
                        resolve('');
                    }
                };

                this.ws.on('message', finalHandler);

                // Timeout after 5 seconds
                setTimeout(() => {
                    if (this.ws) {
                        this.ws.off('message', finalHandler);
                        this.ws.close();
                        this.isTranscribing = false;
                        resolve('');
                    }
                }, 5000);
            } else {
                resolve('');
            }
        });
    }

    async sendAudioChunk(audioData: Buffer): Promise<void> {
        if (this.ws && this.isTranscribing) {
            // Send raw PCM audio directly as binary
            this.ws.send(audioData, { binary: true });
        }
    }

    dispose() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isTranscribing = false;
    }
}
