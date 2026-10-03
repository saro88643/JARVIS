import { describe, it, expect } from 'vitest';
import { SecurityManager } from '../packages/security/src/security-manager.js';
import { createServer } from '../apps/backend/src/server.js';

describe('Application Lifecycle & Backend Security Integration', () => {
  const security = new SecurityManager('C:\\JARVIS');
  const app = createServer(security);

  it('creates backend server instance with security manager', () => {
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
  });

  it('validates workspace security boundaries on init', () => {
    const workspaces = security.getApprovedWorkspaces();
    expect(workspaces.some((w) => w.toUpperCase() === 'C:\\JARVIS')).toBe(true);
  });
});

