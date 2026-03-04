import * as vscode from 'vscode';
import { ElevenLabsService } from './elevenLabsService';
import { TranscriptionEnhancer } from './transcriptionEnhancer';

let elevenLabsService: ElevenLabsService | null = null;
let transcriptionEnhancer: TranscriptionEnhancer | null = null;
let isRecording = false;
let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
    console.log('ElevenLabs Voice extension is now active');

    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'elevenlabsVoice.startRecording';
    context.subscriptions.push(statusBarItem);
    updateStatusBar();

    // Initialize services
    initializeServices();

    // Register commands
    const startRecordingCommand = vscode.commands.registerCommand(
        'elevenlabsVoice.startRecording',
        () => startRecording()
    );

    const stopRecordingCommand = vscode.commands.registerCommand(
        'elevenlabsVoice.stopRecording',
        () => stopRecording()
    );

    const configureApiKeyCommand = vscode.commands.registerCommand(
        'elevenlabsVoice.configureApiKey',
        () => configureApiKey()
    );

    context.subscriptions.push(startRecordingCommand);
    context.subscriptions.push(stopRecordingCommand);
    context.subscriptions.push(configureApiKeyCommand);

    // Listen for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('elevenlabsVoice')) {
                initializeServices();
            }
        })
    );
}

function initializeServices() {
    const config = vscode.workspace.getConfiguration('elevenlabsVoice');
    const apiKey = config.get<string>('apiKey');

    if (apiKey) {
        elevenLabsService = new ElevenLabsService(apiKey);

        const enhancementEnabled = config.get<boolean>('enhancement.enabled');
        if (enhancementEnabled) {
            const model = config.get<string>('enhancement.model') || 'claude-3-5-sonnet-20241022';
            const provider = config.get<string>('enhancement.provider') || 'anthropic';
            transcriptionEnhancer = new TranscriptionEnhancer(model, provider);
        }
    } else {
        elevenLabsService = null;
        transcriptionEnhancer = null;
    }
}

async function startRecording() {
    if (isRecording) {
        vscode.window.showWarningMessage('Already recording!');
        return;
    }

    if (!elevenLabsService) {
        const action = await vscode.window.showErrorMessage(
            'ElevenLabs API key not configured. Please configure it first.',
            'Configure'
        );
        if (action === 'Configure') {
            await configureApiKey();
        }
        return;
    }

    try {
        isRecording = true;
        updateStatusBar();

        vscode.window.showInformationMessage('🎤 Recording... Press the button again to stop.');

        await elevenLabsService.startTranscription(async (text: string) => {
            await handleTranscription(text);
        });

    } catch (error) {
        isRecording = false;
        updateStatusBar();
        vscode.window.showErrorMessage(`Failed to start recording: ${error}`);
    }
}

async function stopRecording() {
    if (!isRecording || !elevenLabsService) {
        return;
    }

    try {
        const finalText = await elevenLabsService.stopTranscription();
        isRecording = false;
        updateStatusBar();

        if (finalText) {
            await handleTranscription(finalText, true);
        }

        vscode.window.showInformationMessage('✅ Recording stopped');
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to stop recording: ${error}`);
    }
}

async function handleTranscription(text: string, isFinal: boolean = false) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
    }

    let processedText = text;

    // Enhance with AI if enabled
    if (transcriptionEnhancer && isFinal) {
        try {
            processedText = await transcriptionEnhancer.enhance(text);
        } catch (error) {
            console.error('Enhancement failed:', error);
            // Use original text if enhancement fails
        }
    }

    // Insert text into editor
    await editor.edit(editBuilder => {
        if (editor.selection.isEmpty) {
            editBuilder.insert(editor.selection.active, processedText);
        } else {
            editBuilder.replace(editor.selection, processedText);
        }
    });
}

async function configureApiKey() {
    const apiKey = await vscode.window.showInputBox({
        prompt: 'Enter your ElevenLabs API key',
        password: true,
        placeHolder: 'xi_xxxxxxxxxxxxxxxx'
    });

    if (apiKey) {
        const config = vscode.workspace.getConfiguration('elevenlabsVoice');
        await config.update('apiKey', apiKey, vscode.ConfigurationTarget.Global);
        initializeServices();
        vscode.window.showInformationMessage('✅ ElevenLabs API key saved');
    }
}

function updateStatusBar() {
    if (isRecording) {
        statusBarItem.text = '$(mic) Recording...';
        statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        statusBarItem.command = 'elevenlabsVoice.stopRecording';
    } else {
        statusBarItem.text = '$(mic) Voice Input';
        statusBarItem.backgroundColor = undefined;
        statusBarItem.command = 'elevenlabsVoice.startRecording';
    }
    statusBarItem.show();
}

export function deactivate() {
    if (elevenLabsService) {
        elevenLabsService.dispose();
    }
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}
