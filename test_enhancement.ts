import * as vscode from 'vscode';

// Mock test for enhancement service
async function testEnhancement() {
    const { TranscriptionEnhancer } = await import('./out/transcriptionEnhancer');
    
    const enhancer = new TranscriptionEnhancer(
        'claude-3-5-sonnet-20241022',
        'anthropic'
    );
    
    const testCases = [
        "um so basically i want to create a function",
        "like you know it should validate input",
        "this function does the thing with data"
    ];
    
    console.log('Testing Enhancement Service...\n');
    
    for (const input of testCases) {
        console.log(`Input: "${input}"`);
        try {
            const enhanced = await enhancer.enhance(input);
            console.log(`Enhanced: "${enhanced}"\n`);
        } catch (error) {
            console.log(`Error: ${error}\n`);
        }
    }
}

testEnhancement();
