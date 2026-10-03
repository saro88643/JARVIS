import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { PermissionLevel } from '@jarvis/shared';
import { ToolDefinition, ToolContext, ToolExecutionResult } from '../types.js';

const execAsync = promisify(exec);

export const openFolderTool: ToolDefinition = {
  name: 'open_folder',
  description: 'Opens an approved workspace folder in Windows File Explorer',
  level: PermissionLevel.LEVEL_0_SAFE_READ,
  parameters: {
    type: 'object',
    properties: {
      folderPath: { type: 'string', description: 'Folder path to open in Windows File Explorer' },
    },
  },
  async execute(args: Record<string, any>, context: ToolContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    const rawPath = args.folderPath || args.path || context.workspaceRoot;
    const resolvedPath = path.isAbsolute(rawPath) ? rawPath : path.join(context.workspaceRoot, rawPath);

    const evalRes = context.securityManager.evaluateFileAccess(resolvedPath, false);
    if (!evalRes.allowed) {
      return {
        success: false,
        error: `Security Sandwich Blocked: Unapproved folder path ${resolvedPath}`,
        level: evalRes.level,
        durationMs: Date.now() - startTime,
      };
    }

    try {
      await execAsync(`explorer.exe "${resolvedPath}"`, { windowsHide: true });
      return {
        success: true,
        output: `Opened folder: ${resolvedPath} in Windows File Explorer.`,
        level: evalRes.level,
        durationMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Failed to open folder: ${err.message}`,
        level: evalRes.level,
        durationMs: Date.now() - startTime,
      };
    }
  },
};
