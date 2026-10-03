import { AIProvider, AIChatMessage, AICompletionOptions, AICompletionResponse } from '../types.js';

export class OllamaProvider implements AIProvider {
  public readonly id = 'ollama';
  public readonly name = 'Local Ollama';
  public readonly defaultModel = 'llama3';
  private baseUrl: string;
  private model: string;

  constructor(baseUrl?: string, model?: string) {
    this.baseUrl = baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = model || process.env.AI_MODEL || this.defaultModel;
  }

  public isConfigured(): boolean {
    return true; // Local server endpoint check
  }

  public async generateResponse(
    messages: AIChatMessage[],
    options?: AICompletionOptions
  ): Promise<AICompletionResponse> {
    const targetModel = options?.model || this.model;

    try {
      const formattedMessages = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: targetModel,
          messages: formattedMessages,
          stream: false,
        }),
      });

      if (!res.ok) {
        throw new Error(`Ollama Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      return {
        content: data.message?.content || '',
        role: 'assistant',
        model: targetModel,
        provider: this.name,
        finishReason: 'stop',
      };
    } catch (err: any) {
      const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
      return {
        content: `[JARVIS Agent (${this.name})]\nLocal Ollama endpoint (${this.baseUrl}) is unreachable or not running.\nMake sure Ollama is installed and running.\n\nProcessed message: "${lastUserMsg}"`,
        role: 'assistant',
        model: targetModel,
        provider: this.name,
        finishReason: 'stop',
      };
    }
  }
}
