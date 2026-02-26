/**
 * Command Registry
 * Extensible command registration and execution system
 */

import type {
	CommandDescriptor,
	CommandHandler,
	OperationRequest,
	OperationResponse,
	CommandCategory,
	OperationStatus
} from './types';
import type { Logger } from '../types';

export class CommandRegistry {
	private commands: Map<string, CommandDescriptor> = new Map();
	private logger?: Logger;

	constructor(logger?: Logger) {
		this.logger = logger;
	}

	/**
	 * Register a command handler
	 */
	register(descriptor: CommandDescriptor): void {
		if (this.commands.has(descriptor.id)) {
			this.logger?.warn(`Command "${descriptor.id}" already registered, overwriting`);
		}

		this.commands.set(descriptor.id, descriptor);
		this.logger?.debug(`Registered command: ${descriptor.id}`);
	}

	/**
	 * Register multiple commands at once
	 */
	registerBatch(descriptors: CommandDescriptor[]): void {
		for (const descriptor of descriptors) {
			this.register(descriptor);
		}
	}

	/**
	 * Execute a command
	 */
	async execute(request: OperationRequest): Promise<OperationResponse> {
		const descriptor = this.commands.get(request.commandId);

		if (!descriptor) {
			this.logger?.warn(`Command not found: ${request.commandId}`);
			return {
				id: request.id,
				status: 'error' as OperationStatus,
				error: {
					code: 'COMMAND_NOT_FOUND',
					message: `Command "${request.commandId}" not found. Available commands: ${Array.from(this.commands.keys()).join(', ')}`
				},
				timestamp: Date.now()
			};
		}

		// Validate payload
		const validation = descriptor.handler.validate(request.payload);
		if (!validation.valid) {
			this.logger?.warn(`Validation failed for ${request.commandId}:`, validation.errors);
			return {
				id: request.id,
				status: 'error' as OperationStatus,
				error: {
					code: 'VALIDATION_ERROR',
					message: 'Payload validation failed',
					details: {
						errors: validation.errors
					}
				},
				timestamp: Date.now()
			};
		}

		// Execute command
		try {
			this.logger?.debug(`Executing command: ${request.commandId}`);
			const startTime = Date.now();

			const response = await descriptor.handler.execute(request);

			const duration = Date.now() - startTime;
			this.logger?.debug(`Command completed in ${duration}ms: ${request.commandId}`);

			return {
				...response,
				metadata: {
					...response.metadata,
					duration
				}
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			this.logger?.error(`Command execution failed: ${request.commandId}`, error);

			return {
				id: request.id,
				status: 'error' as OperationStatus,
				error: {
					code: 'EXECUTION_ERROR',
					message: `Command execution failed: ${errorMessage}`
				},
				timestamp: Date.now()
			};
		}
	}

	/**
	 * Get command by ID
	 */
	getCommand(id: string): CommandDescriptor | undefined {
		return this.commands.get(id);
	}

	/**
	 * Get all commands
	 */
	getAllCommands(): CommandDescriptor[] {
		return Array.from(this.commands.values());
	}

	/**
	 * Get commands by category
	 */
	getCommandsByCategory(category: CommandCategory): CommandDescriptor[] {
		return Array.from(this.commands.values()).filter(cmd => cmd.category === category);
	}

	/**
	 * Get commands that require a file
	 */
	getFileRequiredCommands(): CommandDescriptor[] {
		return Array.from(this.commands.values()).filter(cmd => cmd.requiresFile);
	}

	/**
	 * Check if command exists
	 */
	hasCommand(id: string): boolean {
		return this.commands.has(id);
	}

	/**
	 * Unregister a command
	 */
	unregister(id: string): boolean {
		const deleted = this.commands.delete(id);
		if (deleted) {
			this.logger?.debug(`Unregistered command: ${id}`);
		}
		return deleted;
	}

	/**
	 * Get command count
	 */
	getCommandCount(): number {
		return this.commands.size;
	}

	/**
	 * Get command schema
	 */
	getCommandSchema(id: string): Record<string, any> | undefined {
		const descriptor = this.commands.get(id);
		if (!descriptor) return undefined;
		return descriptor.handler.getSchema();
	}

	/**
	 * Clear all commands
	 */
	clear(): void {
		this.commands.clear();
		this.logger?.debug('All commands unregistered');
	}
}
