import fs from 'node:fs/promises';
import path from 'node:path';
import { PermissionLevel } from '@jarvis/shared';
import { ToolDefinition, ToolContext, ToolExecutionResult } from '../types.js';

export const writeFileTool: ToolDefinition = {
  name: 'write_file',
  description: 'Creates or modifies file contents within approved workspace directories (Requires Level 2 Confirmation)',
  level: PermissionLevel.LEVEL_2_USER_CONFIRMATION,
  parameters: {
    type: 'object',
    properties: {
      filePath: { type: 'string', description: 'Relative or absolute file path to create or edit' },
      content: { type: 'string', description: 'File content to write' }
    },
    required: ['filePath', 'content']
  },
  async execute(args: Record<string, any>, context: ToolContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    const filePath = args.filePath || args.path;
    const content = args.content ?? '';

    if (!filePath) {
      return {
        success: false,
        error: 'filePath parameter is required',
        level: PermissionLevel.LEVEL_2_USER_CONFIRMATION,
        durationMs: Date.now() - startTime
      };
    }

    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(context.workspaceRoot, filePath);

    const evalRes = context.securityManager.evaluateFileAccess(resolvedPath, true);
    if (!evalRes.allowed) {
      return {
        success: false,
        error: `Security Sandwich Blocked: ${evalRes.reason}`,
        level: evalRes.level,
        durationMs: Date.now() - startTime
      };
    }

    // Level 2 Interception Check
    if (context.onPermissionRequired) {
      const approved = await context.onPermissionRequired({
        toolName: 'write_file',
        targetPath: resolvedPath,
        reason: `Modify/create file at ${resolvedPath}`,
        level: evalRes.level
      });

      if (!approved) {
        return {
          success: false,
          error: 'User denied file write operation',
          level: evalRes.level,
          durationMs: Date.now() - startTime
        };
      }
    }

    try {
      await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
      await fs.writeFile(resolvedPath, content, 'utf-8');
      return {
        success: true,
        output: `File successfully written to ${resolvedPath}`,
        level: evalRes.level,
        durationMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Failed to write file: ${err.message}`,
        level: evalRes.level,
        durationMs: Date.now() - startTime
      };
    }
  }
};
