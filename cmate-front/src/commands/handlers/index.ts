/**
 * Handler Registration
 * Exports and registers all command handlers
 */

import type { CommandRegistry } from '../commandRegistry';
import type { Logger } from '../../types';
import { FileOpsHandler } from './fileOpsHandler';
import { DebugHandler } from './debugHandler';
import { ToolsHandler } from './toolsHandler';
import { ExecHandler } from './execHandler';
import { CommandCategory } from '../types';

export function registerAllHandlers(registry: CommandRegistry, logger?: Logger): void {
	const fileOpsHandler = new FileOpsHandler();
	const debugHandler = new DebugHandler();
	const toolsHandler = new ToolsHandler();
	const execHandler = new ExecHandler();

	// File Operations
	registry.register({
		id: 'file.create',
		title: 'Create File',
		category: CommandCategory.FileOps,
		description: 'Create a new file in the workspace',
		handler: fileOpsHandler,
		requiresFile: false
	});

	registry.register({
		id: 'file.delete',
		title: 'Delete File',
		category: CommandCategory.FileOps,
		description: 'Delete a file from the workspace',
		handler: fileOpsHandler,
		requiresFile: true
	});

	registry.register({
		id: 'file.modify',
		title: 'Modify File',
		category: CommandCategory.FileOps,
		description: 'Modify the contents of a file',
		handler: fileOpsHandler,
		requiresFile: true
	});

	registry.register({
		id: 'file.copy',
		title: 'Copy File',
		category: CommandCategory.FileOps,
		description: 'Copy a file to a new location',
		handler: fileOpsHandler,
		requiresFile: true
	});

	registry.register({
		id: 'file.move',
		title: 'Move File',
		category: CommandCategory.FileOps,
		description: 'Move a file to a different location',
		handler: fileOpsHandler,
		requiresFile: true
	});

	registry.register({
		id: 'file.rename',
		title: 'Rename File',
		category: CommandCategory.FileOps,
		description: 'Rename a file',
		handler: fileOpsHandler,
		requiresFile: true
	});

	// Debug Operations
	registry.register({
		id: 'debug.breakpoint',
		title: 'Set Breakpoint',
		category: CommandCategory.Debug,
		description: 'Set or clear a breakpoint',
		handler: debugHandler,
		requiresFile: true
	});

	registry.register({
		id: 'debug.watch',
		title: 'Add Watch',
		category: CommandCategory.Debug,
		description: 'Add a watch expression',
		handler: debugHandler,
		requiresFile: true
	});

	registry.register({
		id: 'debug.logging',
		title: 'Enable Logging',
		category: CommandCategory.Debug,
		description: 'Enable debug logging',
		handler: debugHandler,
		requiresFile: false
	});

	// Tools Operations
	registry.register({
		id: 'tools.format',
		title: 'Format Code',
		category: CommandCategory.Tools,
		description: 'Format code using configured formatter',
		handler: toolsHandler,
		requiresFile: false
	});

	registry.register({
		id: 'tools.lint',
		title: 'Lint Code',
		category: CommandCategory.Tools,
		description: 'Lint code using configured linter',
		handler: toolsHandler,
		requiresFile: false
	});

	registry.register({
		id: 'tools.test',
		title: 'Generate Tests',
		category: CommandCategory.Tools,
		description: 'Generate tests for code',
		handler: toolsHandler,
		requiresFile: false
	});

	registry.register({
		id: 'tools.generate',
		title: 'Generate Code',
		category: CommandCategory.Tools,
		description: 'Generate code snippets or files',
		handler: toolsHandler,
		requiresFile: false
	});

	// Execute Operations
	registry.register({
		id: 'exec.run',
		title: 'Run File',
		category: CommandCategory.Execute,
		description: 'Execute a file',
		handler: execHandler,
		requiresFile: true
	});

	logger?.info(`Registered ${registry.getCommandCount()} handlers`);
}

export { FileOpsHandler, DebugHandler, ToolsHandler, ExecHandler };
