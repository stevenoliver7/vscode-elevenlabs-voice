import WebSocket from 'ws';
import * as vscode from 'vscode';

// Output channel for debugging
let outputChannel: vscode.OutputChannel | null = null;

function log(msg: string) {
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel('ElevenLabs Voice');
    }
    const ts = new Date().toISOString().slice(11, 23);
    outputChannel.appendLine(`[${ts}] ${msg}`);
    console.log(`[ElevenLabs] ${msg}`);
}

export class ElevenLabsService {
    private apiKey: string;
    private ws: WebSocket | null = null;
    private isTranscribing = false;
    private fullTranscript = '';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async startTranscription(
        onPartial: (text: string) => void,
        onFinal: (text: string) => void
    ): Promise<void> {
        if (this.isTranscribing) {
            throw new Error('Already transcribing');
        }

        this.fullTranscript = '';

        return new Promise((resolve, reject) => {
            try {
                const wsUrl = `wss://api.elevenlabs.io/v1/speech-to-text/realtime`;

                log(`Connecting to ${wsUrl}`);

                this.ws = new WebSocket(wsUrl, {
                    headers: {
                        'xi-api-key': this.apiKey
                    }
                });

                this.ws.on('open', () => {
                    this.isTranscribing = true;
                    log('WebSocket connected');

                    // Start audio buffer session
                    const startMsg = {
                        type: 'input_audio_buffer_start',
                        language_code: 'en',
                        audio_format: 'pcm_16000'
                    };
                    this.ws!.send(JSON.stringify(startMsg));
                    log('Sent input_audio_buffer_start');

                    // Show output channel so user can see logs
                    if (outputChannel) {
                        outputChannel.show(true);
                    }

                    resolve();
                });

                this.ws.on('message', (data: WebSocket.Data) => {
                    try {
                        const raw = data.toString();
                        const message = JSON.parse(raw);
                        const msgType = message.type || message.message_type || '';

                        log(`← ${msgType}: ${JSON.stringify(message).slice(0, 300)}`);

                        if (msgType === 'partial_transcript' || msgType === 'partial') {
                            const text = message.transcript || message.text || '';
                            if (text) {
                                onPartial(text);
                            }
                        } else if (
                            msgType === 'final_transcript' ||
                            msgType === 'committed' ||
                            msgType === 'transcription'
                        ) {
                            const text = message.transcript || message.text || '';
                            if (text) {
                                this.fullTranscript += (this.fullTranscript ? ' ' : '') + text;
                                onFinal(text);
                            }
                        } else if (msgType === 'error') {
                            const errMsg = message.error || message.message || JSON.stringify(message);
                            log(`ERROR from API: ${errMsg}`);
                            vscode.window.showErrorMessage(`ElevenLabs: ${errMsg}`);
                        } else if (msgType === 'session_started' || msgType === 'session_begin') {
                            log(`Session started: ${message.session_id || ''}`);
                        }
                    } catch (error) {
                        log(`Failed to parse message: ${error}`);
                    }
                });

                this.ws.on('error', (error: Error) => {
                    log(`WebSocket error: ${error.message}`);
                    this.isTranscribing = false;
                    reject(error);
                });

                this.ws.on('close', (code, reason) => {
                    this.isTranscribing = false;
                    log(`WebSocket closed: code=${code} reason=${reason?.toString() || 'none'}`);
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    async stopTranscription(): Promise<string> {
        return new Promise((resolve) => {
            if (this.ws && this.isTranscribing) {
                log('Stopping transcription...');

                // Send end-of-stream / close
                try {
                    this.ws.send(JSON.stringify({ type: 'input_audio_buffer_stop' }));
                    log('Sent input_audio_buffer_stop');
                } catch (e) {
                    log(`Error sending stop: ${e}`);
                }

                // Wait briefly for any final messages, then close
                const finalHandler = (data: WebSocket.Data) => {
                    try {
                        const message = JSON.parse(data.toString());
                        const msgType = message.type || message.message_type || '';
                        log(`← (final phase) ${msgType}: ${JSON.stringify(message).slice(0, 200)}`);

                        if (
                            msgType === 'final_transcript' ||
                            msgType === 'committed' ||
                            msgType === 'session_ended'
                        ) {
                            const text = message.transcript || message.text || '';
                            if (text) {
                                this.fullTranscript += (this.fullTranscript ? ' ' : '') + text;
                            }
                        }
                    } catch (error) {
                        log(`Error in final handler: ${error}`);
                    }
                };

                this.ws.on('message', finalHandler);

                // Close after 2 seconds
                setTimeout(() => {
                    if (this.ws) {
                        this.ws.off('message', finalHandler);
                        this.ws.close();
                        this.isTranscribing = false;
                        log(`Final transcript: "${this.fullTranscript}"`);
                        resolve(this.fullTranscript);
                    } else {
                        resolve(this.fullTranscript);
                    }
                }, 2000);
            } else {
                resolve(this.fullTranscript);
            }
        });
    }

    async sendAudioChunk(audioData: Buffer): Promise<void> {
        if (this.ws && this.isTranscribing && this.ws.readyState === WebSocket.OPEN) {
            // Base64-encode PCM audio and send as JSON
            const base64Audio = audioData.toString('base64');
            const message = JSON.stringify({
                type: 'input_audio_chunk',
                audio: base64Audio
            });
            this.ws.send(message);
        }
    }

    getFullTranscript(): string {
        return this.fullTranscript;
    }

    dispose() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isTranscribing = false;
    }
}
