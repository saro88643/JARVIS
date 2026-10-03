import { AIProvider, AIChatMessage, AICompletionOptions, AICompletionResponse } from '../types.js';

export class GeminiProvider implements AIProvider {
  public readonly id = 'gemini';
  public readonly name = 'Google Gemini';
  public readonly defaultModel = 'gemini-2.5-flash';
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '';
    this.model = model || process.env.AI_MODEL || this.defaultModel;
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
        'Gemini API key is not configured. Please set AI_API_KEY in your .env or Settings.'
      );
    }

    try {
      const contents = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

      const systemInstruction = options?.systemInstruction ||
        messages.find((m) => m.role === 'system')?.content;

      const body: any = {
        contents,
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens ?? 2048,
        },
      };

      if (systemInstruction) {
        body.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${this.apiKey}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          `Gemini API Error (${res.status}): ${JSON.stringify(errorData.error?.message || errorData)}`
        );
      }

      const data = await res.json();
      const candidate = data.candidates?.[0];
      const textResponse = candidate?.content?.parts?.[0]?.text || '';

      return {
        content: textResponse,
        role: 'assistant',
        model: targetModel,
        provider: this.name,
        finishReason: 'stop',
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount || 0,
          completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata?.totalTokenCount || 0,
        },
      };
    } catch (err: any) {
      return this.getFallbackResponse(messages, targetModel, `Gemini API Error: ${err.message}`);
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
