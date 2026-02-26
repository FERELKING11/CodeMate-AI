/**
 * Sidebar & UI State Types
 * Type definitions for sidebar panel and UI state management
 */

export type UIMode = 'compact' | 'expanded';

export interface PendingOperation {
  id: string;
  commandId: string;
  status: 'queued' | 'executing' | 'completed' | 'failed';
  progress: number;
  startTime: number;
  endTime?: number;
  error?: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  commandId: string;
  ai: string;
  model: string;
  status: 'success' | 'error';
  duration: number;
  message?: string;
}

export interface SidebarState {
  selectedAI: string | null;
  selectedModel: string | null;
  selectedFile: string | null;
  selectedOperation: string | null;
  isLoading: boolean;
  operations: PendingOperation[];
  history: HistoryEntry[];
  uiMode: UIMode;
}

export interface WebViewMessage {
  type: string;
  payload: any;
  id?: string;
}

export interface WebViewMessageRequest extends WebViewMessage {
  id: string;
  type: 'selectAI' | 'selectModel' | 'selectFile' | 'executeCommand' | 'clearHistory';
}

export interface WebViewMessageResponse extends WebViewMessage {
  type: 'stateUpdate' | 'commandResponse' | 'error' | 'ack';
  id: string;
}

export interface CommandResult {
  commandId: string;
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}
