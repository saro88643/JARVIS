import fs from 'node:fs/promises';
import path from 'node:path';
import { PermissionLevel } from '@jarvis/shared';
import { ToolDefinition, ToolContext, ToolExecutionResult } from '../types.js';

export const searchFilesTool: ToolDefinition = {
  name: 'search_files',
  description: 'Searches workspace text files for a keyword or pattern',
  level: PermissionLevel.LEVEL_0_SAFE_READ,
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search term or query pattern' },
      directory: { type: 'string', description: 'Target directory relative to workspace' }
    },
    required: ['query']
  },
  async execute(args: Record<string, any>, context: ToolContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    const query = args.query;
    const subDir = args.directory || '.';

    if (!query) {
      return {
        success: false,
        error: 'query parameter is required',
        level: PermissionLevel.LEVEL_0_SAFE_READ,
        durationMs: Date.now() - startTime
      };
    }

    const targetDir = path.isAbsolute(subDir)
      ? subDir
      : path.join(context.workspaceRoot, subDir);

    const evalRes = context.securityManager.evaluateFileAccess(targetDir, false);
    if (!evalRes.allowed) {
      return {
        success: false,
        error: `Security Sandwich Blocked: ${evalRes.reason}`,
        level: evalRes.level,
        durationMs: Date.now() - startTime
      };
    }

    const matches: { file: string; line: number; content: string }[] = [];

    async function searchDir(dir: string) {
      if (matches.length > 50) return;
      let entries: any[] = [];
      try {
        entries = await fs.readdir(dir, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await searchDir(fullPath);
        } else if (entry.isFile()) {
          try {
            const content = await fs.readFile(fullPath, 'utf-8');
            const lines = content.split('\n');
            lines.forEach((line, idx) => {
              if (line.toLowerCase().includes(query.toLowerCase()) && matches.length < 50) {
                matches.push({
                  file: path.relative(context.workspaceRoot, fullPath),
                  line: idx + 1,
                  content: line.trim()
                });
              }
            });
          } catch {
            // ignore binary / unreadable files
          }
        }
      }
    }

    try {
      await searchDir(targetDir);
      return {
        success: true,
        output: matches,
        level: evalRes.level,
        durationMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Search failed: ${err.message}`,
        level: evalRes.level,
        durationMs: Date.now() - startTime
      };
    }
  }
};
