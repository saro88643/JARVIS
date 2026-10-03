import { Router } from 'express';
import { AIFactory, AIChatMessage } from '@jarvis/ai';
import { logger } from '../logger.js';

export function createAIRouter(): Router {
  const router = Router();

  router.get('/providers', (_req, res) => {
    res.json({
      providers: AIFactory.listProviders(),
      activeProvider: process.env.AI_PROVIDER || 'gemini',
      activeModel: process.env.AI_MODEL || 'gemini-2.5-flash',
    });
  });

  router.post('/chat', async (req, res) => {
    const { messages, providerId, model, options } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'messages array is required' });
      return;
    }

    try {
      const provider = AIFactory.getProvider(providerId);
      logger.info(`Processing AI Chat request using provider: ${provider.name}`);

      const response = await provider.generateResponse(messages as AIChatMessage[], {
        ...options,
        model,
      });

      res.json(response);
    } catch (err: any) {
      logger.error('AI Provider Execution Failed:', { error: err.message });
      res.status(500).json({ error: 'AI Completion Failed', message: err.message });
    }
  });

  return router;
}
