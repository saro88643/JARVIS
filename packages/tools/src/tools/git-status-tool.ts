import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { PermissionLevel } from '@jarvis/shared';
import { ToolDefinition, ToolContext, ToolExecutionResult } from '../types.js';

const execAsync = promisify(exec);

export const gitStatusTool: ToolDefinition = {
  name: 'git_status',
  description: 'Inspects Git workspace repository status and uncommitted changes',
  level: PermissionLevel.LEVEL_0_SAFE_READ,
  parameters: {
    type: 'object',
    properties: {}
  },
  async execute(_args: Record<string, any>, context: ToolContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    const evalRes = context.securityManager.evaluateCommandExecution('git status', context.workspaceRoot);

    if (!evalRes.allowed) {
      return {
        success: false,
        error: `Security Sandwich Blocked: ${evalRes.reason}`,
        level: evalRes.level,
        durationMs: Date.now() - startTime
      };
    }

    try {
      const { stdout } = await execAsync('git status', { cwd: context.workspaceRoot });
      return {
        success: true,
        output: stdout.trim(),
        level: PermissionLevel.LEVEL_0_SAFE_READ,
        durationMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Git status failed: ${err.message}`,
        level: PermissionLevel.LEVEL_0_SAFE_READ,
        durationMs: Date.now() - startTime
      };
    }
  }
};
