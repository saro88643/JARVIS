import fs from 'node:fs/promises';
import path from 'node:path';
import { PermissionLevel } from '@jarvis/shared';
import { ToolDefinition, ToolContext, ToolExecutionResult } from '../types.js';

export const listDirectoryTool: ToolDefinition = {
  name: 'list_directory',
  description: 'Lists files and folders inside an approved workspace directory',
  level: PermissionLevel.LEVEL_0_SAFE_READ,
  parameters: {
    type: 'object',
    properties: {
      directoryPath: { type: 'string', description: 'Relative or absolute directory path to list' }
    }
  },
  async execute(args: Record<string, any>, context: ToolContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    const dirPath = args.directoryPath || args.path || '.';

    const resolvedPath = path.isAbsolute(dirPath)
      ? dirPath
      : path.join(context.workspaceRoot, dirPath);

    const evalRes = context.securityManager.evaluateFileAccess(resolvedPath, false);
    if (!evalRes.allowed) {
      return {
        success: false,
        error: `Security Sandwich Blocked: ${evalRes.reason}`,
        level: evalRes.level,
        durationMs: Date.now() - startTime
      };
    }

    try {
      const entries = await fs.readdir(resolvedPath, { withFileTypes: true });
      const items = entries.map((entry) => ({
        name: entry.name,
        isDirectory: entry.isDirectory(),
        isFile: entry.isFile()
      }));

      return {
        success: true,
        output: items,
        level: evalRes.level,
        durationMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Failed to list directory: ${err.message}`,
        level: evalRes.level,
        durationMs: Date.now() - startTime
      };
    }
  }
};
