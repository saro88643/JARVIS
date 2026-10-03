import { Router } from 'express';
import { ToolRegistry, ToolContext } from '@jarvis/tools';
import { SecurityManager } from '@jarvis/security';
import { logger } from '../logger.js';

export function createToolsRouter(toolRegistry: ToolRegistry, securityManager: SecurityManager, workspaceRoot: string): Router {
  const router = Router();

  router.get('/', (_req, res) => {
    const tools = toolRegistry.listTools();
    res.json({
      count: tools.length,
      tools,
    });
  });

  router.post('/execute', async (req, res) => {
    const { toolName, args } = req.body;

    if (!toolName) {
      res.status(400).json({ error: 'toolName is required' });
      return;
    }

    try {
      logger.info(`Executing tool directly: ${toolName}`);
      const context: ToolContext = {
        workspaceRoot,
        securityManager,
      };

      const result = await toolRegistry.executeTool(toolName, args || {}, context);
      res.json(result);
    } catch (err: any) {
      logger.error(`Tool execution error (${toolName}):`, { error: err.message });
      res.status(500).json({ error: 'Tool execution failed', message: err.message });
    }
  });

  return router;
}
