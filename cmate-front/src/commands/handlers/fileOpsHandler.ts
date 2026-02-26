/**
 * File Operations Handler
 * Handles file creation, deletion, modification, copying, moving, and renaming
 */

import type {
	CommandHandler,
	OperationRequest,
	OperationResponse,
	CommandValidation,
	FileOperation
} from '../types';
import type { OperationStatus } from '../types';
import { validators } from '../../utils/validators';

export class FileOpsHandler implements CommandHandler {
	validate(payload: any): CommandValidation {
		const errors: string[] = [];

		// Check required fields
		if (!payload.type) {
			errors.push('Operation type is required');
		} else if (!['create', 'delete', 'modify', 'copy', 'move', 'rename'].includes(payload.type)) {
			errors.push(`Invalid operation type: ${payload.type}`);
		}

		if (!payload.targetPath) {
			errors.push('Target path is required');
		} else {
			const pathValidation = validators.validateFilePath(payload.targetPath);
			if (!pathValidation.valid) {
				errors.push(...(pathValidation.errors || []));
			}
		}

		// Type-specific validation
		const type = payload.type as string;

		if (['copy', 'move', 'rename'].includes(type)) {
			if (!payload.sourcePath) {
				errors.push(`Source path is required for ${type} operation`);
			} else {
				const sourceValidation = validators.validateFilePath(payload.sourcePath);
				if (!sourceValidation.valid) {
					errors.push(...(sourceValidation.errors || []));
				}
			}
		}

		if (['create', 'modify'].includes(type)) {
			if (typeof payload.content !== 'string') {
				errors.push('Content must be a string');
			}
		}

		return {
			valid: errors.length === 0,
			errors: errors.length > 0 ? errors : undefined
		};
	}

	async execute(request: OperationRequest): Promise<OperationResponse> {
		const operation = request.payload as FileOperation;

		try {
			// This is a placeholder - actual execution is handled by backend
			// The extension sends the operation to the backend via WebSocket
			return {
				id: request.id,
				status: 'success' as OperationStatus,
				data: {
					type: operation.type,
					path: operation.targetPath,
					message: `File operation "${operation.type}" queued for execution`
				},
				timestamp: Date.now()
			};
		} catch (error) {
			return {
				id: request.id,
				status: 'error' as OperationStatus,
				error: {
					code: 'FILE_OP_ERROR',
					message: error instanceof Error ? error.message : 'Unknown error'
				},
				timestamp: Date.now()
			};
		}
	}

	getSchema(): Record<string, any> {
		return {
			type: {
				enum: ['create', 'delete', 'modify', 'copy', 'move', 'rename'],
				description: 'Type of file operation'
			},
			targetPath: {
				type: 'string',
				description: 'Path to target file'
			},
			sourcePath: {
				type: 'string',
				description: 'Path to source file (for copy, move, rename)'
			},
			content: {
				type: 'string',
				description: 'File content (for create, modify)'
			},
			options: {
				type: 'object',
				properties: {
					overwrite: { type: 'boolean' },
					createParents: { type: 'boolean' }
				}
			}
		};
	}
}
