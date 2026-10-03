import fs from 'node:fs/promises';
import path from 'node:path';
import { PermissionLevel } from '@jarvis/shared';
import { ToolDefinition, ToolContext, ToolExecutionResult } from '../types.js';

export const readFileTool: ToolDefinition = {
  name: 'read_file',
  description: 'Reads content from a target file within approved workspace directories',
  level: PermissionLevel.LEVEL_0_SAFE_READ,
  parameters: {
    type: 'object',
    properties: {
      filePath: { type: 'string', description: 'Relative or absolute file path to read' }
    },
    required: ['filePath']
  },
  async execute(args: Record<string, any>, context: ToolContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    const filePath = args.filePath || args.path;

    if (!filePath) {
      return {
        success: false,
        error: 'filePath parameter is required',
        level: PermissionLevel.LEVEL_0_SAFE_READ,
        durationMs: Date.now() - startTime
      };
    }

    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(context.workspaceRoot, filePath);

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
      const content = await fs.readFile(resolvedPath, 'utf-8');
      return {
        success: true,
        output: content,
        level: evalRes.level,
        durationMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Failed to read file: ${err.message}`,
        level: evalRes.level,
        durationMs: Date.now() - startTime
      };
    }
  }
};
