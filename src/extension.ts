import * as vscode from 'vscode';
import { ElevenLabsService } from './elevenLabsService';
import { TranscriptionEnhancer } from './transcriptionEnhancer';
import { AudioCapture } from './audioCapture';

let elevenLabsService: ElevenLabsService | null = null;
let transcriptionEnhancer: TranscriptionEnhancer | null = null;
let audioCapture: AudioCapture | null = null;
let isRecording = false;
let statusBarItem: vscode.StatusBarItem;

// ── Live-rewrite state ──────────────────────────────────────────────────────
// Tracks the "live zone" — the range of text currently being rewritten by
// incoming partial_transcript messages.  committed_transcript locks it in.

let liveStart: vscode.Position | null = null;   // anchor: where partial text begins
let liveRange: vscode.Range | null = null;       // current extent of partial text
let editQueue: Promise<void> = Promise.resolve(); // serialises editor mutations

// Decoration: subtle underline for "live / unconfirmed" text
// (user prefers minimal visual noise)
const liveDecorationType = vscode.window.createTextEditorDecorationType({
    textDecoration: 'underline dotted rgba(150,150,150,0.4)',
});

/** Enqueue an editor mutation so they never overlap. */
function enqueueEdit(fn: () => Promise<void>) {
    editQueue = editQueue.then(fn, fn);      // run even if prev rejected
}

function clearLiveDecoration(editor: vscode.TextEditor | undefined) {
    editor?.setDecorations(liveDecorationType, []);
}

function applyLiveDecoration(editor: vscode.TextEditor, range: vscode.Range) {
    editor.setDecorations(liveDecorationType, [range]);
}

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

        // Initialize audio capture (no WebView needed)
        audioCapture = new AudioCapture();
        audioCapture.initialize(async (chunk: Buffer) => {
            // Send audio chunk to ElevenLabs
            if (elevenLabsService) {
                elevenLabsService.sendAudioChunk(chunk);
            }
        }).catch((error) => {
            console.error('Failed to initialize audio capture:', error);
            // Error already shown to user in AudioCapture.initialize()
        });

        const enhancementEnabled = config.get<boolean>('enhancement.enabled');
        if (enhancementEnabled) {
            const model = config.get<string>('enhancement.model') || 'claude-3-5-sonnet-20241022';
            const provider = config.get<string>('enhancement.provider') || 'anthropic';
            transcriptionEnhancer = new TranscriptionEnhancer(model, provider);
        }
    } else {
        elevenLabsService = null;
        transcriptionEnhancer = null;
        audioCapture = null;
    }
}

async function startRecording() {
    if (isRecording) {
        vscode.window.showWarningMessage('Already recording!');
        return;
    }

    if (!elevenLabsService || !audioCapture) {
        const action = await vscode.window.showErrorMessage(
            'Extension not initialized. Please configure API key first.',
            'Configure'
        );
        if (action === 'Configure') {
            await configureApiKey();
        }
        return;
    }

    try {
        // Reset live-rewrite state
        liveStart = null;
        liveRange = null;
        editQueue = Promise.resolve();
        clearLiveDecoration(vscode.window.activeTextEditor);

        // Start ElevenLabs connection with two callbacks
        await elevenLabsService.startTranscription(
            // ── onPartial ───────────────────────────────────────────
            // Each partial_transcript is the FULL rewritten hypothesis.
            // The model rewrites earlier words as context grows.
            // We replace the entire live zone each time.
            (text: string) => {
                enqueueEdit(() => handlePartial(text));
            },
            // ── onFinal ─────────────────────────────────────────────
            // committed_transcript = locked in. Replace live zone one
            // last time, remove decoration, advance cursor.
            (text: string) => {
                enqueueEdit(() => handleCommitted(text));
            }
        );

        // Start audio capture
        await audioCapture.startRecording();

        isRecording = true;
        updateStatusBar();

        // Set context for keybinding
        await vscode.commands.executeCommand('setContext', 'elevenlabsVoice.recording', true);

    } catch (error) {
        isRecording = false;
        updateStatusBar();
        await vscode.commands.executeCommand('setContext', 'elevenlabsVoice.recording', false);
        vscode.window.showErrorMessage(`Failed to start recording: ${error}`);
    }
}

async function stopRecording() {
    if (!isRecording || !elevenLabsService || !audioCapture) {
        return;
    }

    try {
        // Stop audio capture first (stops sending chunks)
        await audioCapture.stopRecording();

        // Stop ElevenLabs — waits for last VAD commit
        await elevenLabsService.stopTranscription();
        isRecording = false;
        updateStatusBar();

        // Clear live state
        clearLiveDecoration(vscode.window.activeTextEditor);
        liveStart = null;
        liveRange = null;

        // Clear context for keybinding
        await vscode.commands.executeCommand('setContext', 'elevenlabsVoice.recording', false);

        // Note: we do NOT re-insert finalText here.
        // The onFinal callback already inserted each committed segment in real-time.
        // stopTranscription() just waits for any last VAD commit to flush through
        // the same callback pipeline.
    } catch (error) {
        isRecording = false;
        updateStatusBar();
        await vscode.commands.executeCommand('setContext', 'elevenlabsVoice.recording', false);
        vscode.window.showErrorMessage(`Failed to stop recording: ${error}`);
    }
}

// ── Live-rewrite handlers ───────────────────────────────────────────────────

/**
 * Handle a partial_transcript.
 * The API sends the FULL current hypothesis — it may have rewritten earlier
 * words ("I wanted" → "I want to book").  We replace the entire live zone.
 */
async function handlePartial(text: string) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) { return; }

    const ok = await editor.edit(editBuilder => {
        if (liveRange) {
            // Replace existing live zone with the updated hypothesis
            editBuilder.replace(liveRange, text);
        } else {
            // First partial of a new segment — insert at cursor
            liveStart = editor.selection.active;
            editBuilder.insert(liveStart, text);
        }
    });

    if (ok) {
        // Recalculate live range after edit
        const start = liveStart ?? editor.selection.active;
        const end = editor.document.positionAt(
            editor.document.offsetAt(start) + text.length
        );
        liveRange = new vscode.Range(start, end);

        // Dim italic decoration so user sees this is "live / unconfirmed"
        applyLiveDecoration(editor, liveRange);
    }
}

/**
 * Handle a committed_transcript.
 * This is the final, locked-in text for the current segment.
 * Replace live zone, clear decoration, add trailing space, reset for next segment.
 */
async function handleCommitted(text: string) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No active editor to insert text');
        return;
    }

    let processedText = text;

    // Optional AI enhancement on committed text
    if (transcriptionEnhancer) {
        try {
            processedText = await transcriptionEnhancer.enhance(text);
        } catch (error) {
            console.error('Enhancement failed, using original:', error);
        }
    }

    const finalText = processedText + ' ';

    const ok = await editor.edit(editBuilder => {
        if (liveRange) {
            editBuilder.replace(liveRange, finalText);
        } else if (editor.selection.isEmpty) {
            editBuilder.insert(editor.selection.active, finalText);
        } else {
            editBuilder.replace(editor.selection, finalText);
        }
    });

    // Clear decorations and reset for next segment
    clearLiveDecoration(editor);
    liveStart = null;
    liveRange = null;
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
    if (audioCapture) {
        audioCapture.dispose();
    }
    if (statusBarItem) {
        statusBarItem.dispose();
    }
    // Clear recording context
    vscode.commands.executeCommand('setContext', 'elevenlabsVoice.recording', false);
}
