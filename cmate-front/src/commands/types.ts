/**
 * Command Types
 * Type definitions for command registry and execution
 */

export enum CommandCategory {
  FileOps = 'fileOps',
  Debug = 'debug',
  Tools = 'tools',
  Execute = 'execute',
  Custom = 'custom'
}

export enum OperationStatus {
  Success = 'success',
  Error = 'error',
  Pending = 'pending',
  Queued = 'queued',
  Executing = 'executing',
  Completed = 'completed',
  Failed = 'failed'
}

export interface OperationRequest {
  id: string;
  timestamp: number;
  commandId: string;
  category: CommandCategory;
  selectedAI: string;
  selectedModel: string;
  payload: Record<string, any>;
  workspaceRoot: string;
  filePath?: string;
  metadata?: {
    duration?: number;
    cached?: boolean;
    [key: string]: any;
  };
}

export interface OperationResponse {
  id: string;
  status: OperationStatus | string;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  metadata?: {
    duration?: number;
    cached?: boolean;
    [key: string]: any;
  };
  timestamp: number;
}

export interface CommandValidation {
  valid: boolean;
  errors?: string[];
}

export interface CommandHandler {
  execute(request: OperationRequest): Promise<OperationResponse>;
  validate(payload: any): CommandValidation;
  getSchema(): Record<string, any>;
}

export interface CommandDescriptor {
  id: string;
  title: string;
  category: CommandCategory;
  description: string;
  icon?: string;
  handler: CommandHandler;
  requiresFile?: boolean;
  requiresSelection?: boolean;
  keybinding?: string;
}

// File Operation Types
export interface FileOperation {
  type: 'create' | 'delete' | 'modify' | 'copy' | 'move' | 'rename';
  targetPath: string;
  sourcePath?: string;
  content?: string;
  options?: {
    overwrite?: boolean;
    createParents?: boolean;
  };
}

// Debug Operation Types
export interface DebugOperation {
  type: 'setBreakpoint' | 'clearBreakpoint' | 'addWatch' | 'enableLogging';
  filePath: string;
  lineNumber?: number;
  expression?: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

// Tool Operation Types
export interface ToolOperation {
  type: 'format' | 'lint' | 'test' | 'generate';
  filePath?: string;
  tool?: string;
  options?: Record<string, any>;
}

// Exec Operation Types
export interface ExecOperation {
  type: 'run';
  filePath: string;
  args?: string[];
}
