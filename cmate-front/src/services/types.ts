/**
 * Service Types
 * Type definitions for service layer
 */

export interface ServiceOptions {
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  timeout?: number;
}

export interface FileServiceOptions extends ServiceOptions {
  workspaceRoot?: string;
  overwrite?: boolean;
}

export interface DebugServiceOptions extends ServiceOptions {
  breakpointSupport?: boolean;
}

export interface ToolsServiceOptions extends ServiceOptions {
  tools?: {
    formatter?: string;
    linter?: string;
    testRunner?: string;
  };
}

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  duration?: number;
  metadata?: Record<string, any>;
}
