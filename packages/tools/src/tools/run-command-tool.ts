import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { PermissionLevel } from '@jarvis/shared';
import { ToolDefinition, ToolContext, ToolExecutionResult } from '../types.js';

const execAsync = promisify(exec);

export const runCommandTool: ToolDefinition = {
  name: 'run_command',
  description: 'Executes developer terminal commands inside the workspace directory (Level 1 Safe / Level 2 Confirmation)',
  level: PermissionLevel.LEVEL_1_SAFE_DEV,
  parameters: {
    type: 'object',
    properties: {
      command: { type: 'string', description: 'Terminal command to execute' },
      cwd: { type: 'string', description: 'Working directory for command' }
    },
    required: ['command']
  },
  async execute(args: Record<string, any>, context: ToolContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    const command = args.command;
    const targetCwd = args.cwd
      ? (path.isAbsolute(args.cwd) ? args.cwd : path.join(context.workspaceRoot, args.cwd))
      : context.workspaceRoot;

    if (!command) {
      return {
        success: false,
        error: 'command parameter is required',
        level: PermissionLevel.LEVEL_1_SAFE_DEV,
        durationMs: Date.now() - startTime
      };
    }

    const evalRes = context.securityManager.evaluateCommandExecution(command, targetCwd);
    if (!evalRes.allowed) {
      return {
        success: false,
        error: `Security Sandwich Blocked: ${evalRes.reason}`,
        level: evalRes.level,
        durationMs: Date.now() - startTime
      };
    }

    // Intercept Level 2 arbitrary command execution if permission callback is set
    if (evalRes.level === PermissionLevel.LEVEL_2_USER_CONFIRMATION && context.onPermissionRequired) {
      const approved = await context.onPermissionRequired({
        toolName: 'run_command',
        command,
        reason: `Execute arbitrary terminal command '${command}' in ${targetCwd}`,
        level: evalRes.level
      });

      if (!approved) {
        return {
          success: false,
          error: 'User denied command execution',
          level: evalRes.level,
          durationMs: Date.now() - startTime
        };
      }
    }

    try {
      const { stdout, stderr } = await execAsync(command, { cwd: targetCwd, timeout: 30000 });
      return {
        success: true,
        output: {
          stdout: stdout.trim(),
          stderr: stderr.trim()
        },
        level: evalRes.level,
        durationMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.stdout || err.stderr || err.message,
        level: evalRes.level,
        durationMs: Date.now() - startTime
      };
    }
  }
};
