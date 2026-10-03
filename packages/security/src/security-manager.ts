import path from 'node:path';
import fs from 'node:fs';
import { PermissionLevel } from '@jarvis/shared';

export interface SecurityEvaluationResult {
  allowed: boolean;
  level: PermissionLevel;
  reason: string;
  normalizedPath?: string;
}

export class SecurityManager {
  private approvedWorkspaces: Set<string> = new Set();
  private blockedSystemPaths: string[] = [
    'c:\\windows',
    'c:\\program files',
    'c:\\program files (x86)',
    'c:\\users\\all users',
    'system32',
    'drivers\\etc\\hosts',
    'regedit',
  ];

  private safeDevCommands: RegExp[] = [
    /^npm\s+(install|ci|test|run\s+dev|run\s+build|run\s+test|--version|-v)$/i,
    /^git\s+(status|diff|log|branch)$/i,
    /^(node|python|npx)\s+(--version|-v)$/i,
  ];

  private blockedCommandPatterns: RegExp[] = [
    /\b(format|rmdir\s+\/s|del\s+\/f\s+\/s|reg\s+delete|net\s+user|powershell\s+-enc|shutdown|bcdrsv)\b/i,
    /[;&|]\s*(rmdir|del|format|powershell|cmd)\b/i,
  ];

  constructor(initialWorkspace: string = 'C:\\JARVIS') {
    this.addApprovedWorkspace(initialWorkspace);
  }

  public addApprovedWorkspace(workspacePath: string): boolean {
    try {
      const resolved = path.resolve(workspacePath);
      const normalized = this.normalizePath(resolved);
      this.approvedWorkspaces.add(normalized);
      return true;
    } catch {
      return false;
    }
  }

  public getApprovedWorkspaces(): string[] {
    return Array.from(this.approvedWorkspaces);
  }

  public normalizePath(targetPath: string): string {
    const resolved = path.resolve(targetPath);
    return resolved.toLowerCase().replace(/\//g, '\\');
  }

  public isPathWithinApprovedWorkspace(targetPath: string): { isWithin: boolean; normalizedPath: string } {
    const normalizedTarget = this.normalizePath(targetPath);

    for (const blocked of this.blockedSystemPaths) {
      if (normalizedTarget.includes(blocked)) {
        return { isWithin: false, normalizedPath: normalizedTarget };
      }
    }

    for (const workspace of this.approvedWorkspaces) {
      if (normalizedTarget === workspace || normalizedTarget.startsWith(workspace + '\\')) {
        return { isWithin: true, normalizedPath: normalizedTarget };
      }
    }

    return { isWithin: false, normalizedPath: normalizedTarget };
  }

  public evaluateFileAccess(targetPath: string, isWrite: boolean): SecurityEvaluationResult {
    const { isWithin, normalizedPath } = this.isPathWithinApprovedWorkspace(targetPath);

    if (!isWithin) {
      return {
        allowed: false,
        level: PermissionLevel.LEVEL_3_BLOCKED,
        reason: `Target path '${targetPath}' is outside approved workspace allowlist (${Array.from(this.approvedWorkspaces).join(', ')})`,
        normalizedPath,
      };
    }

    if (isWrite) {
      return {
        allowed: true,
        level: PermissionLevel.LEVEL_2_USER_CONFIRMATION,
        reason: `Modifying files requires user confirmation`,
        normalizedPath,
      };
    }

    return {
      allowed: true,
      level: PermissionLevel.LEVEL_0_SAFE_READ,
      reason: `Read access is permitted within approved workspace`,
      normalizedPath,
    };
  }

  public evaluateCommandExecution(command: string, cwd: string): SecurityEvaluationResult {
    const { isWithin } = this.isPathWithinApprovedWorkspace(cwd);

    if (!isWithin) {
      return {
        allowed: false,
        level: PermissionLevel.LEVEL_3_BLOCKED,
        reason: `Command execution working directory '${cwd}' is outside approved workspace`,
      };
    }

    const trimmedCommand = command.trim();

    for (const pattern of this.blockedCommandPatterns) {
      if (pattern.test(trimmedCommand)) {
        return {
          allowed: false,
          level: PermissionLevel.LEVEL_3_BLOCKED,
          reason: `Command contains forbidden destructive or system-level directives`,
        };
      }
    }

    for (const safePattern of this.safeDevCommands) {
      if (safePattern.test(trimmedCommand)) {
        return {
          allowed: true,
          level: PermissionLevel.LEVEL_1_SAFE_DEV,
          reason: `Command is classified as safe development command`,
        };
      }
    }

    return {
      allowed: true,
      level: PermissionLevel.LEVEL_2_USER_CONFIRMATION,
      reason: `Arbitrary command execution requires user approval`,
    };
  }
}
