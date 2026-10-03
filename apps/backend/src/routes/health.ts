import { Router } from 'express';
import { SystemHealth } from '@jarvis/shared';
import { SecurityManager } from '@jarvis/security';

const startTime = Date.now();

export function createHealthRouter(securityManager: SecurityManager): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    const health: SystemHealth = {
      status: 'OK',
      version: '0.1.0',
      backendPort: Number(process.env.PORT) || 3001,
      approvedWorkspace: securityManager.getApprovedWorkspaces()[0] || 'C:\\JARVIS',
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      toolsCount: 15,
    };
    res.json(health);
  });

  router.get('/status', (_req, res) => {
    res.json({
      online: true,
      timestamp: new Date().toISOString(),
      workspaces: securityManager.getApprovedWorkspaces(),
    });
  });

  return router;
}
