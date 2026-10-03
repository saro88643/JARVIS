import { Router } from 'express';
import { SecurityManager } from '@jarvis/security';

export function createSecurityRouter(securityManager: SecurityManager): Router {
  const router = Router();

  router.post('/evaluate-path', (req, res) => {
    const { targetPath, isWrite } = req.body;
    if (!targetPath) {
      res.status(400).json({ error: 'targetPath is required' });
      return;
    }

    const evaluation = securityManager.evaluateFileAccess(targetPath, Boolean(isWrite));
    res.json(evaluation);
  });

  router.post('/evaluate-command', (req, res) => {
    const { command, cwd } = req.body;
    if (!command || !cwd) {
      res.status(400).json({ error: 'command and cwd are required' });
      return;
    }

    const evaluation = securityManager.evaluateCommandExecution(command, cwd);
    res.json(evaluation);
  });

  router.get('/workspaces', (_req, res) => {
    res.json({ workspaces: securityManager.getApprovedWorkspaces() });
  });

  return router;
}
