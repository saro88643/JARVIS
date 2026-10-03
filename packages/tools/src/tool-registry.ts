import { PermissionLevel } from '@jarvis/shared';
import { SecurityManager } from '@jarvis/security';
import { ToolDefinition, ToolContext, ToolExecutionResult } from './types.js';
import { readFileTool } from './tools/read-file-tool.js';
import { writeFileTool } from './tools/write-file-tool.js';
import { listDirectoryTool } from './tools/list-directory-tool.js';
import { searchFilesTool } from './tools/search-files-tool.js';
import { runCommandTool } from './tools/run-command-tool.js';
import { gitStatusTool } from './tools/git-status-tool.js';

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  constructor() {
    this.registerTool(readFileTool);
    this.registerTool(writeFileTool);
    this.registerTool(listDirectoryTool);
    this.registerTool(searchFilesTool);
    this.registerTool(runCommandTool);
    this.registerTool(gitStatusTool);
  }

  public registerTool(tool: ToolDefinition): void {
    this.tools.set(tool.name.toLowerCase(), tool);
  }

  public getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name.toLowerCase());
  }

  public listTools(): { name: string; description: string; level: PermissionLevel; parameters: any }[] {
    return Array.from(this.tools.values()).map((t) => ({
      name: t.name,
      description: t.description,
      level: t.level,
      parameters: t.parameters,
    }));
  }

  public async executeTool(
    name: string,
    args: Record<string, any>,
    context: ToolContext
  ): Promise<ToolExecutionResult> {
    const tool = this.getTool(name);
    if (!tool) {
      return {
        success: false,
        error: `Tool '${name}' is not registered in ToolRegistry`,
        level: PermissionLevel.LEVEL_3_BLOCKED,
        durationMs: 0,
      };
    }

    return await tool.execute(args, context);
  }
}
