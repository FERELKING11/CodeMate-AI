/**
 * Execute Handler
 * Handles file execution ($run command)
 */

import type {
	CommandHandler,
	OperationRequest,
	OperationResponse,
	CommandValidation,
	ExecOperation
} from '../types';
import type { OperationStatus } from '../types';
import { validators } from '../../utils/validators';

export class ExecHandler implements CommandHandler {
	validate(payload: any): CommandValidation {
		const errors: string[] = [];

		// Check required fields
		if (!payload.filePath) {
			errors.push('File path is required');
		} else {
			const pathValidation = validators.validateFilePath(payload.filePath);
			if (!pathValidation.valid) {
				errors.push(...(pathValidation.errors || []));
			}
		}

		// Validate file extension for supported languages
		const filePath = payload.filePath as string;
		if (filePath) {
			const ext = filePath.split('.').pop()?.toLowerCase();
			if (!['py', 'sh', 'js', 'ts', 'jsx', 'tsx'].includes(ext || '')) {
				errors.push(`Unsupported file type: .${ext}`);
			}
		}

		return {
			valid: errors.length === 0,
			errors: errors.length > 0 ? errors : undefined
		};
	}

	async execute(request: OperationRequest): Promise<OperationResponse> {
		const operation = request.payload as ExecOperation;

		try {
			return {
				id: request.id,
				status: 'success' as OperationStatus,
				data: {
					type: operation.type,
					file: operation.filePath,
					args: operation.args,
					message: `File execution "$run ${operation.filePath}" queued`
				},
				timestamp: Date.now()
			};
		} catch (error) {
			return {
				id: request.id,
				status: 'error' as OperationStatus,
				error: {
					code: 'EXEC_OP_ERROR',
					message: error instanceof Error ? error.message : 'Unknown error'
				},
				timestamp: Date.now()
			};
		}
	}

	getSchema(): Record<string, any> {
		return {
			type: {
				const: 'run',
				description: 'Execute/run operation'
			},
			filePath: {
				type: 'string',
				description: 'Path to file to execute'
			},
			args: {
				type: 'array',
				items: { type: 'string' },
				description: 'Command line arguments'
			}
		};
	}
}
