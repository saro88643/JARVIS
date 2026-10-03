import { AIProvider, AIChatMessage, AICompletionOptions, AICompletionResponse } from '../types.js';

export class MockProvider implements AIProvider {
  public readonly id = 'mock';
  public readonly name = 'Mock Provider (Test)';
  public readonly defaultModel = 'mock-v1';

  public isConfigured(): boolean {
    return true;
  }

  public async generateResponse(
    messages: AIChatMessage[],
    _options?: AICompletionOptions
  ): Promise<AICompletionResponse> {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';

    return {
      content: `[JARVIS Agent Mock]\nReceived request: "${lastUserMsg}". Understanding intent, evaluating security sandbox...`,
      role: 'assistant',
      model: this.defaultModel,
      provider: this.name,
      finishReason: 'stop',
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      },
    };
  }
}
