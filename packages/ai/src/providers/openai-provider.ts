import { AIProvider, AIChatMessage, AICompletionOptions, AICompletionResponse } from '../types.js';

export class OpenAIProvider implements AIProvider {
  public readonly id = 'openai';
  public readonly name = 'OpenAI';
  public readonly defaultModel = 'gpt-4o';
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey?: string, model?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    this.model = model || process.env.AI_MODEL || this.defaultModel;
    this.baseUrl = baseUrl || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public async generateResponse(
    messages: AIChatMessage[],
    options?: AICompletionOptions
  ): Promise<AICompletionResponse> {
    const targetModel = options?.model || this.model;

    if (!this.isConfigured()) {
      return this.getFallbackResponse(
        messages,
        targetModel,
        'OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env or Settings.'
      );
    }

    try {
      const formattedMessages = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      if (options?.systemInstruction && !messages.some((m) => m.role === 'system')) {
        formattedMessages.unshift({
          role: 'system',
          content: options.systemInstruction,
        });
      }

      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: targetModel,
          messages: formattedMessages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 2048,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`OpenAI API Error (${res.status}): ${JSON.stringify(errorData.error?.message || errorData)}`);
      }

      const data = await res.json();
      const choice = data.choices?.[0];

      return {
        content: choice?.message?.content || '',
        role: 'assistant',
        model: targetModel,
        provider: this.name,
        finishReason: choice?.finish_reason || 'stop',
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
      };
    } catch (err: any) {
      return this.getFallbackResponse(messages, targetModel, `OpenAI API Error: ${err.message}`);
    }
  }

  private getFallbackResponse(
    messages: AIChatMessage[],
    targetModel: string,
    notice: string
  ): AICompletionResponse {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    return {
      content: `[JARVIS Agent (${this.name})]\n${notice}\n\nProcessed message: "${lastUserMsg}"`,
      role: 'assistant',
      model: targetModel,
      provider: this.name,
      finishReason: 'stop',
    };
  }
}
