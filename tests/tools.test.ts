import { describe, it, expect } from 'vitest';
import { ToolRegistry } from '../packages/tools/src/tool-registry.js';
import { SecurityManager } from '../packages/security/src/security-manager.js';
import { PermissionLevel } from '../packages/shared/src/types.js';

describe('ToolRegistry & Tools Execution', () => {
  const securityManager = new SecurityManager('C:\\JARVIS');
  const toolRegistry = new ToolRegistry();

  it('registers core tools correctly', () => {
    const tools = toolRegistry.listTools();
    expect(tools.length).toBeGreaterThanOrEqual(6);

    const toolNames = tools.map((t) => t.name);
    expect(toolNames).toContain('read_file');
    expect(toolNames).toContain('write_file');
    expect(toolNames).toContain('list_directory');
    expect(toolNames).toContain('search_files');
    expect(toolNames).toContain('run_command');
    expect(toolNames).toContain('git_status');
  });

  it('executes list_directory within workspace safely (Level 0)', async () => {
    const result = await toolRegistry.executeTool(
      'list_directory',
      { directoryPath: '.' },
      { workspaceRoot: 'C:\\JARVIS', securityManager }
    );

    expect(result.success).toBe(true);
    expect(result.level).toBe(PermissionLevel.LEVEL_0_SAFE_READ);
    expect(Array.isArray(result.output)).toBe(true);
  });

  it('executes search_files within workspace safely (Level 0)', async () => {
    const result = await toolRegistry.executeTool(
      'search_files',
      { query: 'jarvis', directory: '.' },
      { workspaceRoot: 'C:\\JARVIS', securityManager }
    );

    expect(result.success).toBe(true);
    expect(result.level).toBe(PermissionLevel.LEVEL_0_SAFE_READ);
    expect(Array.isArray(result.output)).toBe(true);
  });

  it('blocks tool file access outside approved workspace', async () => {
    const result = await toolRegistry.executeTool(
      'read_file',
      { filePath: 'D:\\UnapprovedSecret\\secret.txt' },
      { workspaceRoot: 'C:\\JARVIS', securityManager }
    );

    expect(result.success).toBe(false);
    expect(result.level).toBe(PermissionLevel.LEVEL_3_BLOCKED);
    expect(result.error).toContain('Security Sandwich Blocked');
  });

  it('intercepts Level 2 write operations when permission callback denies', async () => {
    const result = await toolRegistry.executeTool(
      'write_file',
      { filePath: 'C:\\JARVIS\\test-deny.txt', content: 'test' },
      {
        workspaceRoot: 'C:\\JARVIS',
        securityManager,
        onPermissionRequired: async () => false, // Denied by user
      }
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('User denied file write operation');
  });
});
