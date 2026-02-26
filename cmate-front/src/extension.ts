/**
 * CodeMate AI Extension
 * Main entry point for VSCode extension
 */

import * as vscode from 'vscode';
import { ConfigManager } from './config/configManager';
import { CommandRegistry } from './commands/commandRegistry';
import { registerAllHandlers } from './commands/handlers';
import { CodeMateSidebarProvider } from './sidebar/sidebarProvider';
import { createLogger } from './utils/logger';
import type { Logger } from './types';

// Global instances
let logger: Logger;
let configManager: ConfigManager;
let commandRegistry: CommandRegistry;
let outputChannel: vscode.OutputChannel;

/**
 * Extension activation
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
	try {
		// Create output channel
		outputChannel = vscode.window.createOutputChannel('CodeMate AI');
		context.subscriptions.push(outputChannel);

		// Initialize logger
		const logLevel = vscode.workspace.getConfiguration('codemate').get('debug.logLevel', 'info') as any;
		logger = createLogger(outputChannel, logLevel);

		logger.info('🚀 CodeMate AI Extension activating...');
		logger.info(`Version: ${context.extension.packageJSON.version}`);

		// Initialize configuration manager
		configManager = new ConfigManager(logger);
		logger.info(`✓ Configuration loaded (${configManager.getEnabledAIs().length} AI providers enabled)`);

		// Initialize command registry
		commandRegistry = new CommandRegistry(logger);
		registerAllHandlers(commandRegistry, logger);
		logger.info(`✓ Command registry initialized with ${commandRegistry.getCommandCount()} commands`);

		// Register sidebar view provider
		const sidebarProvider = new CodeMateSidebarProvider(
			context,
			commandRegistry,
			configManager,
			logger
		);

		context.subscriptions.push(
			vscode.window.registerWebviewViewProvider(
				CodeMateSidebarProvider.viewType,
				sidebarProvider
			)
		);

		logger.info('✓ Sidebar provider registered');

		// Legacy Command Registrations (for backward compatibility with command palette)
		registerLegacyCommands(context);

		logger.info('✅ CodeMate AI Extension activated successfully');

		// Show welcome message (only on first activation)
		const welcomeShown = context.globalState.get('codemate.welcomeShown');
		if (!welcomeShown) {
			context.globalState.update('codemate.welcomeShown', true);
			vscode.window.showInformationMessage(
				'Welcome to CodeMate AI! 🎉 Open the sidebar to get started.',
				'Learn More'
			).then(selection => {
				if (selection === 'Learn More') {
					vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://github.com/yourusername/codemate-ai'));
				}
			});
		}

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logger?.error('Failed to activate CodeMate AI extension', error);
		vscode.window.showErrorMessage(`CodeMate AI: ${errorMessage}`);
		throw error;
	}
}

/**
 * Register legacy commands for backward compatibility
 */
function registerLegacyCommands(context: vscode.ExtensionContext): void {
	// These commands are now handled by the sidebar, but we keep them for users
	// who prefer the command palette interface

	const commands = [
		'codemate.createFile',
		'codemate.deleteFile',
		'codemate.modifyFile',
		'codemate.copyFile',
		'codemate.moveFile',
		'codemate.renameFile',
		'codemate.runFile',
		'codemate.debugFile',
		'codemate.formatCode',
		'codemate.lintCode',
		'codemate.generateTests'
	];

	for (const command of commands) {
		context.subscriptions.push(
			vscode.commands.registerCommand(command, async () => {
				vscode.window.showInformationMessage(
					'CodeMate AI commands are now accessed through the sidebar. Click the CodeMate icon in the explorer.',
					'Open Sidebar'
				).then(selection => {
					if (selection === 'Open Sidebar') {
						vscode.commands.executeCommand('codemate.sidebar.focus');
					}
				});
			})
		);
	}

	logger?.debug(`Registered ${commands.length} legacy commands for compatibility`);
}

/**
 * Extension deactivation
 */
export async function deactivate(): Promise<void> {
	logger?.info('CodeMate AI Extension deactivating...');

	try {
		// Cleanup resources
		if (configManager) {
			configManager.dispose();
		}

		if (commandRegistry) {
			commandRegistry.clear();
		}

		logger?.info('✅ CodeMate AI Extension deactivated');
	} catch (error) {
		logger?.error('Error during deactivation', error);
	}
}
