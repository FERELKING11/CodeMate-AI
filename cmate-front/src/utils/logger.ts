/**
 * Logger Utility
 * Centralized logging for the extension
 */

import type { Logger } from '../types';

export class ExtensionLogger implements Logger {
  private outputChannel?: any;
  private logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info';

  constructor(outputChannel?: any, logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info') {
    this.outputChannel = outputChannel;
    this.logLevel = logLevel;
  }

  debug(message: string, data?: any): void {
    if (this.logLevel === 'debug') {
      this.log('DEBUG', message, data);
    }
  }

  info(message: string, data?: any): void {
    if (['debug', 'info'].includes(this.logLevel)) {
      this.log('INFO', message, data);
    }
  }

  warn(message: string, data?: any): void {
    if (['debug', 'info', 'warn'].includes(this.logLevel)) {
      this.log('WARN', message, data);
    }
  }

  error(message: string, error?: Error | string | unknown, data?: any): void {
    let errorMsg = '';
    if (error instanceof Error) {
      errorMsg = error.message;
    } else if (typeof error === 'string') {
      errorMsg = error;
    } else if (error) {
      errorMsg = String(error);
    }
    this.log('ERROR', message, { error: errorMsg, ...data });
  }

  private log(level: string, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;

    if (this.outputChannel) {
      if (data) {
        this.outputChannel.appendLine(`${logMessage} ${JSON.stringify(data)}`);
      } else {
        this.outputChannel.appendLine(logMessage);
      }
    } else {
      console.log(logMessage, data);
    }
  }

  setLogLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    this.logLevel = level;
  }
}

export const createLogger = (outputChannel?: any, level?: 'debug' | 'info' | 'warn' | 'error'): Logger => {
  return new ExtensionLogger(outputChannel, level);
};
