import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { PermissionLevel } from '@jarvis/shared';
import { ToolDefinition, ToolContext, ToolExecutionResult } from '../types.js';

const execAsync = promisify(exec);

export const openUrlTool: ToolDefinition = {
  name: 'open_url',
  description: 'Opens a web URL or search query in the default web browser',
  level: PermissionLevel.LEVEL_0_SAFE_READ,
  parameters: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'Web URL or site to open (e.g. https://youtube.com)' },
    },
    required: ['url'],
  },
  async execute(args: Record<string, any>, context: ToolContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    let url = (args.url || '').trim();

    if (!url) {
      return {
        success: false,
        error: 'url parameter is required',
        level: PermissionLevel.LEVEL_0_SAFE_READ,
        durationMs: Date.now() - startTime,
      };
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.')) {
        url = 'https://' + url;
      } else {
        url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      }
    }

    try {
      await execAsync(`start "" "${url}"`, { windowsHide: true });
      return {
        success: true,
        output: `Opened ${url} in default web browser.`,
        level: PermissionLevel.LEVEL_0_SAFE_READ,
        durationMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Failed to open URL: ${err.message}`,
        level: PermissionLevel.LEVEL_0_SAFE_READ,
        durationMs: Date.now() - startTime,
      };
    }
  },
};
