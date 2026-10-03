import { AIProvider } from './types.js';
import { GeminiProvider } from './providers/gemini-provider.js';
import { OpenAIProvider } from './providers/openai-provider.js';
import { OllamaProvider } from './providers/ollama-provider.js';
import { MockProvider } from './providers/mock-provider.js';

export class AIFactory {
  private static providers: Map<string, AIProvider> = new Map();

  static {
    AIFactory.registerProvider(new GeminiProvider());
    AIFactory.registerProvider(new OpenAIProvider());
    AIFactory.registerProvider(new OllamaProvider());
    AIFactory.registerProvider(new MockProvider());
  }

  public static registerProvider(provider: AIProvider): void {
    AIFactory.providers.set(provider.id.toLowerCase(), provider);
  }

  public static getProvider(providerId?: string): AIProvider {
    const targetId = (providerId || process.env.AI_PROVIDER || 'gemini').toLowerCase();
    const provider = AIFactory.providers.get(targetId);

    if (provider) {
      return provider;
    }

    // Fallback to Gemini or Mock
    return AIFactory.providers.get('gemini') || new MockProvider();
  }

  public static listProviders(): { id: string; name: string; isConfigured: boolean; defaultModel: string }[] {
    return Array.from(AIFactory.providers.values()).map((p) => ({
      id: p.id,
      name: p.name,
      isConfigured: p.isConfigured(),
      defaultModel: p.defaultModel,
    }));
  }
}
