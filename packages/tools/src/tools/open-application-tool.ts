import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { PermissionLevel } from '@jarvis/shared';
import { ToolDefinition, ToolContext, ToolExecutionResult } from '../types.js';

const execAsync = promisify(exec);

// Known safe Windows application mappings
const KNOWN_APPS: Record<string, string[]> = {
  'android studio': ['studio64.exe', 'studio.exe', 'C:\\Program Files\\Android\\Android Studio\\bin\\studio64.exe'],
  'vs code': ['code', 'code.cmd', 'C:\\Program Files\\Microsoft VS Code\\Code.exe'],
  'vscode': ['code', 'code.cmd', 'C:\\Program Files\\Microsoft VS Code\\Code.exe'],
  'chrome': ['chrome', 'chrome.exe', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'],
  'file explorer': ['explorer.exe'],
  'explorer': ['explorer.exe'],
  'powershell': ['powershell.exe'],
  'cmd': ['cmd.exe'],
};

export const openApplicationTool: ToolDefinition = {
  name: 'open_application',
  description: 'Opens an approved Windows desktop application (e.g. Android Studio, VS Code, Chrome, PowerShell)',
  level: PermissionLevel.LEVEL_1_SAFE_DEV,
  parameters: {
    type: 'object',
    properties: {
      appName: { type: 'string', description: 'Name of the application to open' },
    },
    required: ['appName'],
  },
  async execute(args: Record<string, any>, context: ToolContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    const rawAppName = (args.appName || args.name || '').trim().toLowerCase();

    if (!rawAppName) {
      return {
        success: false,
        error: 'appName parameter is required',
        level: PermissionLevel.LEVEL_1_SAFE_DEV,
        durationMs: Date.now() - startTime,
      };
    }

    const appCandidates = KNOWN_APPS[rawAppName] || [rawAppName];

    for (const cmd of appCandidates) {
      try {
        await execAsync(`start "" "${cmd}"`, { windowsHide: true });
        return {
          success: true,
          output: `Successfully launched ${args.appName} on Windows.`,
          level: PermissionLevel.LEVEL_1_SAFE_DEV,
          durationMs: Date.now() - startTime,
        };
      } catch {
        // Try next candidate
      }
    }

    // Try direct start command as fallback
    try {
      await execAsync(`start "" "${rawAppName}"`, { windowsHide: true });
      return {
        success: true,
        output: `Launched application: ${args.appName}`,
        level: PermissionLevel.LEVEL_1_SAFE_DEV,
        durationMs: Date.now() - startTime,
      };
    } catch {
      return {
        success: false,
        error: `I couldn't find ${args.appName} on this computer.`,
        level: PermissionLevel.LEVEL_1_SAFE_DEV,
        durationMs: Date.now() - startTime,
      };
    }
  },
};
