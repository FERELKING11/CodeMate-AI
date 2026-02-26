/**
 * Shared Type Definitions
 * Global types used across the extension
 */

export interface Logger {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, error?: Error | string | unknown, data?: any): void;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface AsyncResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  timestamp: number;
}

export type EventCallback<T = any> = (event: T) => void | Promise<void>;

export interface EventEmitter<T = any> {
  on(callback: EventCallback<T>): () => void;
  once(callback: EventCallback<T>): void;
  emit(event: T): Promise<void>;
}

export interface Disposable {
  dispose(): void | Promise<void>;
}
