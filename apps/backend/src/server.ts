import express from 'express';
import cors from 'cors';
import { SecurityManager } from '@jarvis/security';
import { AgentEngine } from '@jarvis/agent';
import { createHealthRouter } from './routes/health.js';
import { createSecurityRouter } from './routes/security.js';
import { createAIRouter } from './routes/ai.js';
import { createToolsRouter } from './routes/tools.js';
import { createAgentRouter } from './routes/agent.js';
import { logger } from './logger.js';

export function createServer(securityManager: SecurityManager) {
  const app = express();
  const approvedWorkspaces = securityManager.getApprovedWorkspaces();
  const workspaceRoot = approvedWorkspaces[0] || 'C:\\JARVIS';

  const agentEngine = new AgentEngine(workspaceRoot);

  app.use(cors());
  app.use(express.json());

  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });

  app.use('/api', createHealthRouter(securityManager));
  app.use('/api/security', createSecurityRouter(securityManager));
  app.use('/api/ai', createAIRouter());
  app.use('/api/tools', createToolsRouter(agentEngine.getToolRegistry(), securityManager, workspaceRoot));
  app.use('/api/agent', createAgentRouter(agentEngine));

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error('Unhandled server error:', { error: err.message || err });
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  });

  return app;
}
