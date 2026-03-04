# Enhancement Service Testing

The enhancement service uses AI models (Claude/GPT-4) to clean up transcriptions. This can be tested independently of the ElevenLabs integration.

## Testing Enhancement Without ElevenLabs

### 1. Setup Environment Variables

Create `.env` file:
```bash
ANTHROPIC_API_KEY=your_claude_key_here
# OR
OPENAI_API_KEY=your_openai_key_here
```

### 2. Test Enhancement Directly

Create a test script:

```typescript
// test_enhancement.ts
import { TranscriptionEnhancer } from './src/transcriptionEnhancer';

async function test() {
    const enhancer = new TranscriptionEnhancer(
        'claude-3-5-sonnet-20241022',
        'anthropic'
    );

    const testCases = [
        {
            input: "um so basically i want to create a function that adds two numbers",
            context: "JavaScript file",
            expected: "Create a function that adds two numbers"
        },
        {
            input: "like you know it should validate the user input and stuff",
            context: "TypeScript file",
            expected: "It should validate user input"
        },
        {
            input: "this function like does the thing with the data",
            context: "Python file",
            expected: "This function processes the data"
        }
    ];

    for (const test of testCases) {
        console.log(`\nInput: ${test.input}`);
        console.log(`Context: ${test.context}`);
        
        const enhanced = await enhancer.enhance(test.input);
        
        console.log(`Enhanced: ${enhanced}`);
        console.log(`Expected: ${test.expected}`);
    }
}

test();
```

### 3. Run Test

```bash
npm run compile
node out/test_enhancement.js
```

## Enhancement Quality Checklist

Test with different scenarios:

- [ ] **Filler words removed** (um, uh, like, you know)
- [ ] **Grammar corrected** (subject-verb agreement, tenses)
- [ ] **Punctuation added** (periods, commas, question marks)
- [ ] **Technical terms preserved** (function names, APIs, libraries)
- [ ] **Code formatting** (appropriate for comments/documentation)
- [ ] **Intent preserved** (meaning not changed)
- [ ] **Context-aware** (different enhancement for different file types)
- [ ] **Concise** (unnecessary words removed)

## Context Extraction Testing

Test that context is properly extracted:

```typescript
// Different file types
const contexts = [
    { file: 'app.js', language: 'javascript' },
    { file: 'utils.py', language: 'python' },
    { file: 'README.md', language: 'markdown' },
    { file: 'styles.css', language: 'css' }
];

for (const ctx of contexts) {
    console.log(`File: ${ctx.file}`);
    console.log(`Language: ${ctx.language}`);
    // Test enhancement with this context
}
```

## Provider Comparison

Test both providers:

### Claude (Anthropic)
- Model: claude-3-5-sonnet-20241022
- Strengths: Nuanced understanding, maintains voice
- Best for: Natural language, documentation

### GPT-4 (OpenAI)
- Model: gpt-4-turbo
- Strengths: Technical accuracy, concise output
- Best for: Code comments, technical docs

## Mock Testing (Without API Keys)

For testing without real API keys, create a mock enhancer:

```typescript
class MockTranscriptionEnhancer {
    async enhance(text: string): Promise<string> {
        // Simple cleanup for testing
        return text
            .replace(/\b(um|uh|like|you know)\b/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
    }
}
```

## Performance Testing

Measure enhancement latency:

```typescript
const start = Date.now();
const enhanced = await enhancer.enhance(text);
const duration = Date.now() - start;

console.log(`Enhancement took ${duration}ms`);
// Target: <1000ms for good UX
```

## Integration Testing

Once ElevenLabs integration works:

1. Record voice input
2. Get raw transcription
3. Enhance with AI
4. Compare raw vs enhanced
5. Verify quality improvement

## Next Steps

- [ ] Get Claude or OpenAI API key for testing
- [ ] Run enhancement tests
- [ ] Compare provider quality
- [ ] Optimize prompts
- [ ] Test with real transcriptions
- [ ] Measure performance
- [ ] Document best practices
