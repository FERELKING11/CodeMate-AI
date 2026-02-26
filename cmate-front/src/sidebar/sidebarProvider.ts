/**
 * Sidebar Provider
 * WebViewViewProvider implementation coordinating UI, state, and commands
 */

import * as vscode from 'vscode';
import * as path from 'path';
import type { CommandRegistry } from '../commands/commandRegistry';
import type { ConfigManager } from '../config/configManager';
import { StateManager } from './state';
import { ProtocolHandler } from '../communication/protocolHandler';
import type { WebViewMessage, SidebarState } from './types';
import type { OperationRequest } from '../commands/types';
import { CommandCategory } from '../commands/types';
import { generateUUID } from '../utils/uuid';
import type { Logger } from '../types';

export class CodeMateSidebarProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'codemate.sidebar';
	private webviewView?: vscode.WebviewView;
	private stateManager: StateManager;
	private logger?: Logger;

	constructor(
		private context: vscode.ExtensionContext,
		private commandRegistry: CommandRegistry,
		private configManager: ConfigManager,
		logger?: Logger
	) {
		this.logger = logger;
		this.stateManager = new StateManager();

		// Subscribe to state changes and update WebView
		this.stateManager.on(state => this.updateWebView(state));
	}

	/**
	 * Resolve webview view
	 */
	async resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken
	): Promise<void> {
		this.webviewView = webviewView;
		this.logger?.info('Resolving CodeMate sidebar view');

		// Configure webview
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.joinPath(this.context.extensionUri, 'resources'),
				vscode.Uri.joinPath(this.context.extensionUri, 'src', 'sidebar', 'webview')
			]
		};

		// Load WebView content
		webviewView.webview.html = this.getWebviewContent(webviewView.webview);

		// Handle messages from WebView
		webviewView.webview.onDidReceiveMessage(
			async (message: WebViewMessage) => {
				await this.handleWebViewMessage(message);
			},
			undefined,
			this.context.subscriptions
		);

		// Send initial data
		this.sendInitialData();
	}

	/**
	 * Get WebView HTML content
	 */
	private getWebviewContent(webview: vscode.Webview): string {
		const scriptUri = webview.asWebviewUri(
			vscode.Uri.joinPath(
				this.context.extensionUri,
				'out',
				'sidebar',
				'webview',
				'script.js'
			)
		);

		const styleUri = webview.asWebviewUri(
			vscode.Uri.joinPath(
				this.context.extensionUri,
				'src',
				'sidebar',
				'webview',
				'styles.css'
			)
		);

		// Read template HTML
		const fs = require('fs');
		const templatePath = vscode.Uri.joinPath(
			this.context.extensionUri,
			'src',
			'sidebar',
			'webview',
			'index.html'
		).fsPath;

		let html = fs.readFileSync(templatePath, 'utf-8');

		// Replace placeholders
		html = html.replace(/<link rel="stylesheet" href="styles\.css">/,
			`<link rel="stylesheet" href="${styleUri}">`
		);
		html = html.replace(/<script src="script\.js"><\/script>/,
			`<script src="${scriptUri}"><\/script>`
		);

		return html;
	}

	/**
	 * Send initial data to WebView
	 */
	private async sendInitialData(): Promise<void> {
		try {
			const config = this.configManager.getConfig();
			const enabledAIs = this.configManager.getEnabledAIs();

			// Convert to format expected by WebView
			const aiProviders: Record<string, any> = {};
			enabledAIs.forEach(ai => {
				aiProviders[ai.id] = {
					id: ai.id,
					name: ai.name,
					enabled: ai.enabled,
					models: ai.models.filter(m => m.enabled)
				};
			});

			this.webviewView?.webview.postMessage({
				type: 'providerData',
				payload: aiProviders
			});

			// Send initial state
			this.updateWebView(this.stateManager.getState());
		} catch (error) {
			this.logger?.error('Failed to send initial data to WebView', error);
		}
	}

	/**
	 * Handle messages from WebView
	 */
	private async handleWebViewMessage(message: WebViewMessage): Promise<void> {
		this.logger?.debug(`Received WebView message: ${message.type}`);

		try {
			switch (message.type) {
				case 'selectAI':
					this.stateManager.setSelectedAI(message.payload);
					break;

				case 'selectModel':
					this.stateManager.setSelectedModel(message.payload);
					break;

				case 'selectFile':
					this.stateManager.setSelectedFile(message.payload);
					break;

				case 'executeCommand':
					await this.executeCommand(message.payload);
					break;

				case 'clearHistory':
					this.stateManager.clearHistory();
					break;

				case 'requestInitialState':
					this.sendInitialData();
					break;

				default:
					this.logger?.warn(`Unknown message type: ${message.type}`);
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			this.logger?.error(`Error handling WebView message: ${message.type}`, error);

			this.webviewView?.webview.postMessage({
				type: 'error',
				payload: {
					message: errorMessage
				}
			});
		}
	}

	/**
	 * Execute command from WebView selection
	 */
	private async executeCommand(payload: any): Promise<void> {
		const {
			commandId,
			ai,
			model,
			file
		} = payload;

		try {
			this.stateManager.setLoading(true);
			const operationId = this.stateManager.addOperation({
				commandId,
				status: 'executing',
				progress: 0,
				startTime: Date.now()
			});

			// Build operation request
			const request: OperationRequest = {
				id: generateUUID(),
				timestamp: Date.now(),
				commandId,
				category: this.getCommandCategory(commandId),
				selectedAI: ai,
				selectedModel: model,
				payload: this.buildCommandPayload(commandId, file),
				workspaceRoot: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '',
				filePath: file
			};

			this.logger?.debug(`Executing command: ${commandId}`, request);

			// Execute through registry
			const response = await this.commandRegistry.execute(request);

			// Update operation status
			this.stateManager.updateOperation(operationId, {
				status: response.status === 'success' ? 'completed' : 'failed',
				progress: 100,
				endTime: Date.now(),
				error: response.error?.message
			});

			// Add to history
			this.stateManager.addToHistory({
				timestamp: Date.now(),
				commandId,
				ai,
				model,
				status: response.status === 'success' ? 'success' : 'error',
				duration: Date.now() - request.timestamp,
				message: response.data?.message || response.error?.message
			});

			// Send result to WebView
			this.webviewView?.webview.postMessage({
				type: 'commandResponse',
				payload: {
					status: response.status,
					message: response.error?.message || response.data?.message || 'Operation completed',
					data: response.data
				}
			});

			// Remove from active operations after a delay
			setTimeout(() => {
				this.stateManager.removeOperation(operationId);
			}, 3000);

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			this.logger?.error(`Command execution failed: ${commandId}`, error);

			this.webviewView?.webview.postMessage({
				type: 'error',
				payload: {
					message: errorMessage
				}
			});

			this.stateManager.setLoading(false);
		} finally {
			this.stateManager.setLoading(false);
		}
	}

	/**
	 * Get command category from command ID
	 */
	private getCommandCategory(commandId: string): CommandCategory {
		if (commandId.startsWith('file.')) return CommandCategory.FileOps;
		if (commandId.startsWith('debug.')) return CommandCategory.Debug;
		if (commandId.startsWith('tools.')) return CommandCategory.Tools;
		if (commandId.startsWith('exec.')) return CommandCategory.Execute;
		return CommandCategory.Custom;
	}

	/**
	 * Build command payload based on command type
	 */
	private buildCommandPayload(commandId: string, filePath?: string): Record<string, any> {
		const type = commandId.split('.')[1];

		// Handle file operations
		if (commandId.startsWith('file.')) {
			return {
				type,
				targetPath: filePath || '',
				content: ''
			};
		}

		// Handle debug operations
		if (commandId.startsWith('debug.')) {
			return {
				type,
				filePath: filePath || '',
				lineNumber: 1
			};
		}

		// Handle tools
		if (commandId.startsWith('tools.')) {
			return {
				type,
				filePath: filePath || '',
				tool: type
			};
		}

		// Handle execution
		if (commandId.startsWith('exec.')) {
			return {
				type: 'run',
				filePath: filePath || ''
			};
		}

		return {};
	}

	/**
	 * Update WebView with new state
	 */
	private updateWebView(state: SidebarState): void {
		if (!this.webviewView) return;

		this.webviewView.webview.postMessage({
			type: 'stateUpdate',
			payload: state
		});
	}

	/**
	 * Dispose resources
	 */
	dispose(): void {
		this.stateManager.clearListeners();
		this.logger?.debug('SidebarProvider disposed');
	}
}
