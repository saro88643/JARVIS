import fs from 'node:fs';
import path from 'node:path';

export class Logger {
  private logFilePath: string;

  constructor(logDir: string = 'C:\\JARVIS\\logs') {
    if (!fs.existsSync(logDir)) {
      try {
        fs.mkdirSync(logDir, { recursive: true });
      } catch {
        // Fallback to local logs directory
        logDir = path.resolve('./logs');
        fs.mkdirSync(logDir, { recursive: true });
      }
    }
    this.logFilePath = path.join(logDir, 'jarvis-audit.log');
  }

  public info(message: string, meta?: Record<string, any>) {
    this.log('INFO', message, meta);
  }

  public warn(message: string, meta?: Record<string, any>) {
    this.log('WARN', message, meta);
  }

  public error(message: string, meta?: Record<string, any>) {
    this.log('ERROR', message, meta);
  }

  public audit(action: string, toolName: string, status: string, details?: Record<string, any>) {
    this.log('AUDIT', `${action} [${toolName}] -> ${status}`, details);
  }

  private log(level: string, message: string, meta?: Record<string, any>) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(meta ? { meta } : {}),
    };

    const line = JSON.stringify(entry) + '\n';
    console.log(`[JARVIS ${level}] ${message}`, meta ? JSON.stringify(meta) : '');

    try {
      fs.appendFileSync(this.logFilePath, line, 'utf-8');
    } catch (err) {
      console.error('Failed to write to audit log file:', err);
    }
  }
}

export const logger = new Logger();
