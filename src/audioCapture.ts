import * as vscode from 'vscode';

export class AudioCapture {
    private panel: vscode.WebviewPanel | null = null;
    private isRecording = false;
    private onAudioChunk: ((chunk: Buffer) => void) | null = null;

    async initialize(onAudioChunk: (chunk: Buffer) => void): Promise<void> {
        this.onAudioChunk = onAudioChunk;

        // Create hidden webview for audio capture
        this.panel = vscode.window.createWebviewPanel(
            'elevenlabsAudioCapture',
            'Voice Recording',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        // Load the audio capture HTML
        this.panel.webview.html = this.getAudioCaptureHtml();

        // Handle messages from webview
        this.panel.webview.onDidReceiveMessage(
            message => this.handleMessage(message),
            undefined,
            []
        );

        // Hide the panel (we just need it for audio access)
        this.panel.reveal(vscode.ViewColumn.One, true);
    }

    private handleMessage(message: any): void {
        switch (message.type) {
            case 'audioChunk':
                if (this.onAudioChunk && message.data) {
                    // Convert base64 audio to buffer
                    const buffer = Buffer.from(message.data, 'base64');
                    this.onAudioChunk(buffer);
                }
                break;

            case 'error':
                vscode.window.showErrorMessage(`Audio capture error: ${message.error}`);
                this.isRecording = false;
                break;

            case 'recordingStarted':
                this.isRecording = true;
                vscode.window.showInformationMessage('🎤 Recording started');
                break;

            case 'recordingStopped':
                this.isRecording = false;
                vscode.window.showInformationMessage('🎤 Recording stopped');
                break;
        }
    }

    async startRecording(): Promise<void> {
        if (!this.panel) {
            throw new Error('Audio capture not initialized');
        }

        if (this.isRecording) {
            return;
        }

        // Send start command to webview
        await this.panel.webview.postMessage({ type: 'startRecording' });
    }

    async stopRecording(): Promise<void> {
        if (!this.panel || !this.isRecording) {
            return;
        }

        // Send stop command to webview
        await this.panel.webview.postMessage({ type: 'stopRecording' });
    }

    getIsRecording(): boolean {
        return this.isRecording;
    }

    dispose(): void {
        if (this.panel) {
            this.panel.dispose();
            this.panel = null;
        }
        this.isRecording = false;
    }

    private getAudioCaptureHtml(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Voice Recording</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        
        .recording-indicator {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #e94560;
            animation: pulse 1.5s ease-in-out infinite;
            margin-bottom: 20px;
        }
        
        .recording-indicator.idle {
            background: #666;
            animation: none;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }
        
        .status {
            font-size: 14px;
            color: var(--vscode-descriptionForeground);
            margin-top: 10px;
        }
        
        .error {
            color: #e94560;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="recording-indicator idle" id="indicator"></div>
    <div class="status" id="status">Ready to record</div>
    <div class="error" id="error" style="display: none;"></div>

    <script>
        const vscode = acquireVsCodeApi();
        let mediaRecorder = null;
        let audioContext = null;
        let stream = null;
        let isRecording = false;

        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'startRecording':
                    startRecording();
                    break;
                    
                case 'stopRecording':
                    stopRecording();
                    break;
            }
        });

        async function startRecording() {
            if (isRecording) {
                return;
            }

            try {
                // Request microphone access
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                });

                // Create audio context
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                // Create media recorder
                mediaRecorder = new MediaRecorder(stream, {
                    mimeType: 'audio/webm;codecs=opus'
                });

                let chunks = [];

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        chunks.push(event.data);
                        
                        // Send chunk to extension
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64 = reader.result.split(',')[1];
                            vscode.postMessage({
                                type: 'audioChunk',
                                data: base64
                            });
                        };
                        reader.readAsDataURL(event.data);
                    }
                };

                mediaRecorder.onstart = () => {
                    isRecording = true;
                    updateUI(true);
                    vscode.postMessage({ type: 'recordingStarted' });
                };

                mediaRecorder.onstop = () => {
                    isRecording = false;
                    updateUI(false);
                    vscode.postMessage({ type: 'recordingStopped' });
                    
                    // Cleanup
                    if (stream) {
                        stream.getTracks().forEach(track => track.stop());
                        stream = null;
                    }
                };

                // Start recording with 100ms chunks for real-time streaming
                mediaRecorder.start(100);

            } catch (error) {
                console.error('Failed to start recording:', error);
                showError(error.message);
                vscode.postMessage({
                    type: 'error',
                    error: error.message
                });
            }
        }

        function stopRecording() {
            if (mediaRecorder && isRecording) {
                mediaRecorder.stop();
            }
        }

        function updateUI(recording) {
            const indicator = document.getElementById('indicator');
            const status = document.getElementById('status');
            
            if (recording) {
                indicator.classList.remove('idle');
                status.textContent = '🎤 Recording...';
            } else {
                indicator.classList.add('idle');
                status.textContent = 'Ready to record';
            }
        }

        function showError(message) {
            const errorDiv = document.getElementById('error');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }

        // Request permission on load
        async function requestPermission() {
            try {
                const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                tempStream.getTracks().forEach(track => track.stop());
            } catch (error) {
                showError('Microphone access denied. Please allow microphone access to use voice input.');
            }
        }

        // Request permission when page loads
        requestPermission();
    </script>
</body>
</html>`;
    }
}
