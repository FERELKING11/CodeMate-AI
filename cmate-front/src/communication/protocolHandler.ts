/**
 * Protocol Handler
 * Handles message protocol versioning, creation, and parsing
 */

import { generateUUID } from '../utils/uuid';
import type {
	MessageEnvelope,
	CommandRequest,
	CommandResponse,
	WSMessage
} from './types';
import type { OperationRequest, OperationResponse } from '../commands/types';

export class ProtocolHandler {
	private static readonly PROTOCOL_VERSION = '1.0';
	private static readonly MESSAGE_TIMEOUT = 30000; // 30 seconds

	/**
	 * Create a command request envelope
	 */
	static createRequest(
		operationRequest: OperationRequest,
		requiresACK: boolean = true
	): CommandRequest {
		return {
			version: '1.0',
			type: 'request',
			id: generateUUID(),
			timestamp: Date.now(),
			channel: 'command',
			payload: operationRequest,
			requiresACK
		};
	}

	/**
	 * Create a command response envelope
	 */
	static createResponse(
		operationResponse: OperationResponse,
		requestId: string
	): CommandResponse {
		return {
			version: '1.0',
			type: 'response',
			id: requestId,
			timestamp: Date.now(),
			channel: 'command',
			payload: operationResponse
		};
	}

	/**
	 * Create an error message
	 */
	static createError(
		code: string,
		message: string,
		requestId?: string,
		details?: Record<string, any>
	): MessageEnvelope {
		return {
			version: '1.0',
			type: 'error',
			id: requestId || generateUUID(),
			timestamp: Date.now(),
			channel: 'error',
			payload: {
				code,
				message,
				details
			}
		};
	}

	/**
	 * Create a ping message
	 */
	static createPing(): MessageEnvelope {
		return {
			version: '1.0',
			type: 'ping',
			id: generateUUID(),
			timestamp: Date.now(),
			channel: 'heartbeat',
			payload: null
		};
	}

	/**
	 * Create a pong message
	 */
	static createPong(pingId: string): MessageEnvelope {
		return {
			version: '1.0',
			type: 'pong',
			id: generateUUID(),
			timestamp: Date.now(),
			channel: 'heartbeat',
			payload: null
		};
	}

	/**
	 * Create an ACK message
	 */
	static createACK(acknowledgedId: string): MessageEnvelope {
		return {
			version: '1.0',
			type: 'ack',
			id: generateUUID(),
			timestamp: Date.now(),
			channel: 'ack',
			payload: {
				acknowledgedId
			}
		};
	}

	/**
	 * Parse an incoming message
	 */
	static parseMessage(data: string): MessageEnvelope {
		try {
			const parsed = JSON.parse(data);
			return this.validateAndNormalize(parsed);
		} catch (error) {
			throw new Error(`Failed to parse message: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	/**
	 * Validate message structure
	 */
	static isValidMessage(msg: any): msg is MessageEnvelope {
		return (
			msg &&
			typeof msg === 'object' &&
			msg.version === '1.0' &&
			msg.type &&
			msg.id &&
			typeof msg.timestamp === 'number' &&
			msg.channel
		);
	}

	/**
	 * Validate and normalize message
	 */
	private static validateAndNormalize(msg: any): MessageEnvelope {
		if (!this.isValidMessage(msg)) {
			throw new Error('Invalid message format: missing required fields or invalid version');
		}

		return msg as MessageEnvelope;
	}

	/**
	 * Check if message is a request
	 */
	static isRequest(msg: MessageEnvelope): msg is CommandRequest {
		return msg.type === 'request';
	}

	/**
	 * Check if message is a response
	 */
	static isResponse(msg: MessageEnvelope): msg is CommandResponse {
		return msg.type === 'response';
	}

	/**
	 * Check if message is an error
	 */
	static isError(msg: MessageEnvelope): boolean {
		return msg.type === 'error';
	}

	/**
	 * Check if message requires acknowledgment
	 */
	static requiresACK(msg: MessageEnvelope): boolean {
		return (msg as any).requiresACK === true;
	}

	/**
	 * Serialize message to JSON
	 */
	static serializeMessage(msg: MessageEnvelope): string {
		return JSON.stringify(msg);
	}

	/**
	 * Get message timeout for requests
	 */
	static getMessageTimeout(): number {
		return this.MESSAGE_TIMEOUT;
	}

	/**
	 * Get protocol version
	 */
	static getProtocolVersion(): string {
		return this.PROTOCOL_VERSION;
	}
}
