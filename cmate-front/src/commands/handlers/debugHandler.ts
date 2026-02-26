/**
 * Debug Handler
 * Handles debug operations (breakpoints, watches, logging)
 */

import type {
	CommandHandler,
	OperationRequest,
	OperationResponse,
	CommandValidation,
	DebugOperation
} from '../types';
import type { OperationStatus } from '../types';
import { validators } from '../../utils/validators';

export class DebugHandler implements CommandHandler {
	validate(payload: any): CommandValidation {
		const errors: string[] = [];

		// Check required fields
		if (!payload.type) {
			errors.push('Debug operation type is required');
		} else if (!['setBreakpoint', 'clearBreakpoint', 'addWatch', 'enableLogging'].includes(payload.type)) {
			errors.push(`Invalid debug operation type: ${payload.type}`);
		}

		if (!payload.filePath) {
			errors.push('File path is required');
		} else {
			const pathValidation = validators.validateFilePath(payload.filePath);
			if (!pathValidation.valid) {
				errors.push(...(pathValidation.errors || []));
			}
		}

		// Type-specific validation
		const type = payload.type as string;

		if (['setBreakpoint', 'clearBreakpoint'].includes(type)) {
			if (typeof payload.lineNumber !== 'number' || payload.lineNumber < 1) {
				errors.push('Valid line number is required');
			}
		}

		if (type === 'addWatch') {
			if (!payload.expression || typeof payload.expression !== 'string') {
				errors.push('Watch expression is required');
			}
		}

		if (type === 'enableLogging') {
			if (payload.logLevel && !['debug', 'info', 'warn', 'error'].includes(payload.logLevel)) {
				errors.push('Invalid log level');
			}
		}

		return {
			valid: errors.length === 0,
			errors: errors.length > 0 ? errors : undefined
		};
	}

	async execute(request: OperationRequest): Promise<OperationResponse> {
		const operation = request.payload as DebugOperation;

		try {
			return {
				id: request.id,
				status: 'success' as OperationStatus,
				data: {
					type: operation.type,
					file: operation.filePath,
					line: operation.lineNumber,
					message: `Debug operation "${operation.type}" processed`
				},
				timestamp: Date.now()
			};
		} catch (error) {
			return {
				id: request.id,
				status: 'error' as OperationStatus,
				error: {
					code: 'DEBUG_OP_ERROR',
					message: error instanceof Error ? error.message : 'Unknown error'
				},
				timestamp: Date.now()
			};
		}
	}

	getSchema(): Record<string, any> {
		return {
			type: {
				enum: ['setBreakpoint', 'clearBreakpoint', 'addWatch', 'enableLogging'],
				description: 'Type of debug operation'
			},
			filePath: {
				type: 'string',
				description: 'Path to file'
			},
			lineNumber: {
				type: 'number',
				description: 'Line number for breakpoint'
			},
			expression: {
				type: 'string',
				description: 'Watch expression or logging expression'
			},
			logLevel: {
				enum: ['debug', 'info', 'warn', 'error'],
				description: 'Log level for logging operations'
			}
		};
	}
}
