"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// Mock test for enhancement service
async function testEnhancement() {
    const { TranscriptionEnhancer } = await Promise.resolve().then(() => __importStar(require('./out/transcriptionEnhancer')));
    const enhancer = new TranscriptionEnhancer('claude-3-5-sonnet-20241022', 'anthropic');
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
        }
        catch (error) {
            console.log(`Error: ${error}\n`);
        }
    }
}
testEnhancement();
//# sourceMappingURL=test_enhancement.js.map