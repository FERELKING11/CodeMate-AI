/**
 * Tools Handler
 * Handles code quality operations (format, lint, test, generate)
 */

import type {
	CommandHandler,
	OperationRequest,
	OperationResponse,
	CommandValidation,
	ToolOperation
} from '../types';
import type { OperationStatus } from '../types';
import { validators } from '../../utils/validators';

export class ToolsHandler implements CommandHandler {
	validate(payload: any): CommandValidation {
		const errors: string[] = [];

		// Check required fields
		if (!payload.type) {
			errors.push('Tool operation type is required');
		} else if (!['format', 'lint', 'test', 'generate'].includes(payload.type)) {
			errors.push(`Invalid tool operation type: ${payload.type}`);
		}

		// File path is optional (can apply to workspace)
		if (payload.filePath && typeof payload.filePath === 'string') {
			const pathValidation = validators.validateFilePath(payload.filePath);
			if (!pathValidation.valid) {
				errors.push(...(pathValidation.errors || []));
			}
		}

		// Type-specific validation
		const type = payload.type as string;

		if (type === 'generate') {
			if (!payload.tool || typeof payload.tool !== 'string') {
				errors.push('Tool specification is required for generate operations');
			}
		}

		return {
			valid: errors.length === 0,
			errors: errors.length > 0 ? errors : undefined
		};
	}

	async execute(request: OperationRequest): Promise<OperationResponse> {
		const operation = request.payload as ToolOperation;

		try {
			return {
				id: request.id,
				status: 'success' as OperationStatus,
				data: {
					type: operation.type,
					file: operation.filePath || 'workspace',
					tool: operation.tool,
					message: `Tool operation "${operation.type}" queued`
				},
				timestamp: Date.now()
			};
		} catch (error) {
			return {
				id: request.id,
				status: 'error' as OperationStatus,
				error: {
					code: 'TOOL_OP_ERROR',
					message: error instanceof Error ? error.message : 'Unknown error'
				},
				timestamp: Date.now()
			};
		}
	}

	getSchema(): Record<string, any> {
		return {
			type: {
				enum: ['format', 'lint', 'test', 'generate'],
				description: 'Type of code quality operation'
			},
			filePath: {
				type: 'string',
				description: 'Path to file (optional, applies to workspace if omitted)'
			},
			tool: {
				type: 'string',
				description: 'Specific tool to use'
			},
			options: {
				type: 'object',
				description: 'Tool-specific options'
			}
		};
	}
}
