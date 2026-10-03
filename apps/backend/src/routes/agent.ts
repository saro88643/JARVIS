import { Router } from 'express';
import { AgentEngine } from '@jarvis/agent';
import { logger } from '../logger.js';

export function createAgentRouter(agentEngine: AgentEngine): Router {
  const router = Router();

  router.get('/tasks', (_req, res) => {
    res.json({
      tasks: agentEngine.getTasks(),
    });
  });

  router.get('/tasks/:id', (req, res) => {
    const task = agentEngine.getTask(req.params.id);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json(task);
  });

  router.post('/tasks', async (req, res) => {
    const { userPrompt, providerId } = req.body;

    if (!userPrompt) {
      res.status(400).json({ error: 'userPrompt is required' });
      return;
    }

    try {
      logger.info(`Submitting agent task: "${userPrompt}"`);
      const result = await agentEngine.submitTask(userPrompt, providerId || 'gemini');
      res.json(result);
    } catch (err: any) {
      logger.error('Agent task submission failed:', { error: err.message });
      res.status(500).json({ error: 'Agent task failed', message: err.message });
    }
  });

  router.get('/permissions', (_req, res) => {
    res.json({
      pending: agentEngine.getPendingPermissions(),
    });
  });

  router.post('/permission', (req, res) => {
    const { requestId, decision } = req.body;

    if (!requestId || !decision) {
      res.status(400).json({ error: 'requestId and decision are required' });
      return;
    }

    const handled = agentEngine.respondToPermission(requestId, decision);
    if (!handled) {
      res.status(404).json({ error: 'Pending permission request not found' });
      return;
    }

    logger.info(`Permission ${requestId} responded with: ${decision}`);
    res.json({ success: true, requestId, decision });
  });

  router.get('/activity', (_req, res) => {
    res.json({
      activities: agentEngine.getActivityLogs(),
    });
  });

  return router;
}
