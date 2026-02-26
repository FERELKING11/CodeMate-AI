/**
 * Communication Protocol Types
 * Type definitions for WebSocket message protocol
 */

export type MessageType = 'request' | 'response' | 'notification' | 'ack' | 'error' | 'ping' | 'pong';

export interface MessageEnvelope {
  version: '1.0';
  type: MessageType;
  id: string;
  timestamp: number;
  channel: string;
  payload: unknown;
  requiresACK?: boolean;
}

export interface PingMessage extends MessageEnvelope {
  type: 'ping';
  payload: null;
}

export interface PongMessage extends MessageEnvelope {
  type: 'pong';
  payload: null;
}

export interface ACKMessage extends MessageEnvelope {
  type: 'ack';
  payload: {
    acknowledgedId: string;
  };
}

export interface ErrorMessage extends MessageEnvelope {
  type: 'error';
  payload: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

export interface CommandRequest extends MessageEnvelope {
  type: 'request';
  payload: {
    id: string;
    timestamp: number;
    commandId: string;
    category: string;
    payload: Record<string, any>;
    selectedAI: string;
    selectedModel: string;
    workspaceRoot: string;
  };
}

export interface CommandResponse extends MessageEnvelope {
  type: 'response';
  payload: {
    id: string;
    status: 'success' | 'error' | 'pending' | 'queued' | 'executing' | 'completed' | 'failed' | string;
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
  };
}

// Union type for all messages
export type WSMessage =
  | CommandRequest
  | CommandResponse
  | PingMessage
  | PongMessage
  | ACKMessage
  | ErrorMessage
  | MessageEnvelope;

export interface ProtocolConfig {
  timeout?: number;
  retryCount?: number;
  heartbeatInterval?: number;
}
