import { describe, it, expect } from 'vitest';
import { SecurityManager } from '../packages/security/src/security-manager.js';
import { PermissionLevel } from '../packages/shared/src/types.js';

describe('SecurityManager', () => {
  const security = new SecurityManager('C:\\JARVIS');

  it('allows safe read access inside approved workspace (Level 0)', () => {
    const res = security.evaluateFileAccess('C:\\JARVIS\\README.md', false);
    expect(res.allowed).toBe(true);
    expect(res.level).toBe(PermissionLevel.LEVEL_0_SAFE_READ);
  });

  it('requires user confirmation for write access inside approved workspace (Level 2)', () => {
    const res = security.evaluateFileAccess('C:\\JARVIS\\src\\app.ts', true);
    expect(res.allowed).toBe(true);
    expect(res.level).toBe(PermissionLevel.LEVEL_2_USER_CONFIRMATION);
  });

  it('blocks file access outside approved workspace (Level 3)', () => {
    const res = security.evaluateFileAccess('D:\\UnapprovedProject\\secret.txt', false);
    expect(res.allowed).toBe(false);
    expect(res.level).toBe(PermissionLevel.LEVEL_3_BLOCKED);
  });

  it('prevents path traversal attempts outside workspace (Level 3)', () => {
    const res = security.evaluateFileAccess('C:\\JARVIS\\..\\Windows\\System32\\cmd.exe', false);
    expect(res.allowed).toBe(false);
    expect(res.level).toBe(PermissionLevel.LEVEL_3_BLOCKED);
  });

  it('categorizes safe development commands (Level 1)', () => {
    const res = security.evaluateCommandExecution('npm test', 'C:\\JARVIS');
    expect(res.allowed).toBe(true);
    expect(res.level).toBe(PermissionLevel.LEVEL_1_SAFE_DEV);
  });

  it('blocks dangerous system commands (Level 3)', () => {
    const res = security.evaluateCommandExecution('rmdir /s /q C:\\Windows', 'C:\\JARVIS');
    expect(res.allowed).toBe(false);
    expect(res.level).toBe(PermissionLevel.LEVEL_3_BLOCKED);
  });

  it('requires confirmation for arbitrary commands (Level 2)', () => {
    const res = security.evaluateCommandExecution('node custom-script.js', 'C:\\JARVIS');
    expect(res.allowed).toBe(true);
    expect(res.level).toBe(PermissionLevel.LEVEL_2_USER_CONFIRMATION);
  });
});
