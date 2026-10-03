import { describe, it, expect } from 'vitest';
import { AgentEngine } from '../packages/agent/src/agent-engine.js';

describe('AgentEngine Task Execution Pipeline', () => {
  const engine = new AgentEngine('C:\\JARVIS');

  it('submits and completes a safe Level 0 read task', async () => {
    const { task, output } = await engine.submitTask('list directory files', 'mock');

    expect(task.status).toBe('COMPLETED');
    expect(task.steps.length).toBe(4);
    expect(task.steps.every((s) => s.status === 'DONE')).toBe(true);
    expect(output).toBeDefined();
  });

  it('pauses and handles Level 2 permission request when user approves', async () => {
    const taskPromise = engine.submitTask('create file test-agent.txt with content Hello', 'mock');

    // Wait a tick for pending permission to register
    await new Promise((r) => setTimeout(r, 50));
    const pending = engine.getPendingPermissions();
    expect(pending.length).toBeGreaterThan(0);
    expect(pending[0].toolName).toBe('write_file');

    // User approves
    engine.respondToPermission(pending[0].id, 'ALLOW_ONCE');

    const { task, output } = await taskPromise;
    expect(task.status).toBe('COMPLETED');
    expect(output).toBeDefined();
  });

  it('pauses and handles Level 2 permission request when user denies', async () => {
    const taskPromise = engine.submitTask('write file secret.txt with content data', 'mock');

    await new Promise((r) => setTimeout(r, 50));
    const pending = engine.getPendingPermissions();
    expect(pending.length).toBeGreaterThan(0);

    // User denies
    engine.respondToPermission(pending[0].id, 'DENY');

    const { task, output } = await taskPromise;
    expect(task.status).toBe('DENIED');
    expect(output).toContain('Permission explicitly denied');
  });

  it('tracks activity log entries for agent executions', () => {
    const logs = engine.getActivityLogs();
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].toolName).toBeDefined();
    expect(logs[0].permissionLevel).toBeDefined();
  });
});
