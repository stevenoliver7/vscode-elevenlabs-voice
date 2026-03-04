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
                // Connect to ElevenLabs WebSocket API
                const wsUrl = `wss://api.elevenlabs.io/v1/speech-to-text?model_id=scribe_v1`;

                this.ws = new WebSocket(wsUrl, {
                    headers: {
                        'xi-api-key': this.apiKey
                    }
                });

                this.ws.on('open', () => {
                    this.isTranscribing = true;
                    console.log('Connected to ElevenLabs');
                    resolve();
                });

                this.ws.on('message', (data: WebSocket.Data) => {
                    try {
                        const message = JSON.parse(data.toString());

                        if (message.type === 'transcription') {
                            const text = message.text || '';
                            if (text) {
                                onText(text);
                            }
                        }
                    } catch (error) {
                        console.error('Failed to parse message:', error);
                    }
                });

                this.ws.on('error', (error) => {
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
                // Send end of stream signal
                this.ws.send(JSON.stringify({ type: 'end_of_stream' }));

                // Wait for final transcription
                const finalHandler = (data: WebSocket.Data) => {
                    try {
                        const message = JSON.parse(data.toString());
                        if (message.type === 'final_transcription') {
                            this.ws?.off('message', finalHandler);
                            this.ws?.close();
                            this.isTranscribing = false;
                            resolve(message.text || '');
                        }
                    } catch (error) {
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
            return new Promise((resolve, reject) => {
                this.ws!.send(audioData, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
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
