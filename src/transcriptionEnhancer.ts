import * as vscode from 'vscode';

export class TranscriptionEnhancer {
    private model: string;
    private provider: string;

    constructor(model: string, provider: string) {
        this.model = model;
        this.provider = provider;
    }

    async enhance(text: string): Promise<string> {
        // Get current file context
        const editor = vscode.window.activeTextEditor;
        const fileName = editor?.document.fileName || '';
        const languageId = editor?.document.languageId || '';

        // Build prompt for enhancement
        const prompt = this.buildEnhancementPrompt(text, fileName, languageId);

        try {
            if (this.provider === 'anthropic') {
                return await this.enhanceWithAnthropic(prompt);
            } else if (this.provider === 'openai') {
                return await this.enhanceWithOpenAI(prompt);
            } else {
                return text;
            }
        } catch (error) {
            console.error('Enhancement failed:', error);
            return text;
        }
    }

    private buildEnhancementPrompt(text: string, fileName: string, languageId: string): string {
        return `You are a transcription enhancement assistant. Your job is to clean up voice transcriptions while preserving the original meaning and intent.

Context:
- File: ${fileName || 'unknown'}
- Language: ${languageId || 'unknown'}

Original transcription:
"${text}"

Instructions:
1. Fix grammar and punctuation
2. Remove filler words (um, uh, like, you know)
3. Improve clarity while keeping the original voice
4. Preserve technical terms and code references
5. Format appropriately for the context (code comments, documentation, etc.)

Enhanced version:`;
    }

    private async enhanceWithAnthropic(prompt: string): Promise<string> {
        const config = vscode.workspace.getConfiguration('voiceScribe');
        const apiKey = process.env.ANTHROPIC_API_KEY;

        if (!apiKey) {
            throw new Error('ANTHROPIC_API_KEY not set');
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: this.model,
                max_tokens: 1024,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.statusText}`);
        }

        const data = await response.json() as any;
        return data.content[0].text.trim();
    }

    private async enhanceWithOpenAI(prompt: string): Promise<string> {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            throw new Error('OPENAI_API_KEY not set');
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json() as any;
        return data.choices[0].message.content.trim();
    }
}
