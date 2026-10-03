import { describe, it, expect } from 'vitest';
import { AIFactory } from '../packages/ai/src/ai-factory.js';
import { MockProvider } from '../packages/ai/src/providers/mock-provider.js';

describe('AIFactory & AI Providers', () => {
  it('registers and lists available AI providers', () => {
    const providers = AIFactory.listProviders();
    expect(providers.length).toBeGreaterThanOrEqual(4);
    
    const providerIds = providers.map((p) => p.id);
    expect(providerIds).toContain('gemini');
    expect(providerIds).toContain('openai');
    expect(providerIds).toContain('ollama');
    expect(providerIds).toContain('mock');
  });

  it('retrieves the mock provider by ID', () => {
    const provider = AIFactory.getProvider('mock');
    expect(provider).toBeInstanceOf(MockProvider);
    expect(provider.name).toContain('Mock');
  });

  it('generates a valid response using MockProvider', async () => {
    const provider = AIFactory.getProvider('mock');
    const response = await provider.generateResponse([
      { role: 'user', content: 'Explain JARVIS security architecture' }
    ]);

    expect(response.role).toBe('assistant');
    expect(response.content).toContain('JARVIS Agent Mock');
    expect(response.content).toContain('Explain JARVIS security architecture');
    expect(response.usage).toBeDefined();
  });
});
