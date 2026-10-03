import { PermissionLevel } from '@jarvis/shared';
import { SecurityManager } from '@jarvis/security';

export interface ToolContext {
  workspaceRoot: string;
  securityManager: SecurityManager;
  onPermissionRequired?: (req: {
    toolName: string;
    targetPath?: string;
    command?: string;
    reason: string;
    level: PermissionLevel;
  }) => Promise<boolean>;
}

export interface ToolExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  level: PermissionLevel;
  durationMs: number;
}

export interface ToolDefinition {
  name: string;
  description: string;
  level: PermissionLevel;
  parameters: {
    type: string;
    properties: Record<string, { type: string; description: string; required?: boolean }>;
    required?: string[];
  };
  execute: (args: Record<string, any>, context: ToolContext) => Promise<ToolExecutionResult>;
}
