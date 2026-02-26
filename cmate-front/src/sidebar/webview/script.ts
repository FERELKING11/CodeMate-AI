/**
 * Sidebar WebView Script
 * Client-side logic for the sidebar UI
 */

// VSCode Webview API
declare const vscode: any;

interface ExtensionMessage {
	type: string;
	payload: any;
	id?: string;
}

interface SidebarState {
	selectedAI: string | null;
	selectedModel: string | null;
	selectedFile: string | null;
	selectedOperation: string | null;
	isLoading: boolean;
	operations: any[];
	history: any[];
	uiMode: 'compact' | 'expanded';
}

interface AIProvider {
	id: string;
	name: string;
	enabled: boolean;
	models: AIModel[];
}

interface AIModel {
	id: string;
	name: string;
	contextWindow: number;
	capabilities: string[];
	enabled?: boolean;
}

class CodeMateSidebarUI {
	private state: SidebarState = {
		selectedAI: null,
		selectedModel: null,
		selectedFile: null,
		selectedOperation: null,
		isLoading: false,
		operations: [],
		history: [],
		uiMode: 'expanded'
	};

	private ais: Record<string, AIProvider> = {};

	constructor() {
		this.initializeListeners();
		this.initializeEventHandlers();
	}

	/**
	 * Initialize message listeners from extension
	 */
	private initializeListeners(): void {
		window.addEventListener('message', (event: MessageEvent) => {
			const message: ExtensionMessage = event.data;

			switch (message.type) {
				case 'stateUpdate':
					this.updateState(message.payload);
					break;
				case 'providerData':
					this.updateProviderData(message.payload);
					break;
				case 'commandResponse':
					this.handleCommandResponse(message.payload);
					break;
				case 'error':
					this.handleError(message.payload);
					break;
			}
		});
	}

	/**
	 * Initialize DOM event handlers
	 */
	private initializeEventHandlers(): void {
		// AI selector
		const aiSelect = document.getElementById('aiSelect') as HTMLSelectElement;
		aiSelect?.addEventListener('change', (e) => {
			const aiId = (e.target as HTMLSelectElement).value;
			this.selectAI(aiId);
		});

		// Model selector
		const modelSelect = document.getElementById('modelSelect') as HTMLSelectElement;
		modelSelect?.addEventListener('change', (e) => {
			const modelId = (e.target as HTMLSelectElement).value;
			this.selectModel(modelId);
		});

		// File selector
		const fileSelect = document.getElementById('fileSelect') as HTMLSelectElement;
		fileSelect?.addEventListener('change', (e) => {
			const filePath = (e.target as HTMLSelectElement).value;
			this.selectFile(filePath);
		});

		// Operations
		document.querySelectorAll('.btn-operation').forEach((button) => {
			button.addEventListener('click', () => {
				const commandId = button.getAttribute('data-command');
				if (commandId) {
					this.executeCommand(commandId);
				}
			});
		});

		// UI Mode Toggle
		const toggleBtn = document.getElementById('toggleUI');
		toggleBtn?.addEventListener('click', () => {
			this.toggleUIMode();
		});

		// Clear History
		const clearBtn = document.getElementById('clearHistory');
		clearBtn?.addEventListener('click', () => {
			this.clearHistory();
		});
	}

	/**
	 * Update local state and re-render
	 */
	private updateState(newState: Partial<SidebarState>): void {
		this.state = { ...this.state, ...newState };
		this.render();
	}

	/**
	 * Update provider data from extension
	 */
	private updateProviderData(ais: Record<string, AIProvider>): void {
		this.ais = ais;
		this.renderAISelector();
	}

	/**
	 * Select AI provider
	 */
	private selectAI(aiId: string): void {
		vscode.postMessage({
			type: 'selectAI',
			payload: aiId !=='' ? aiId : null
		});
	}

	/**
	 * Select model
	 */
	private selectModel(modelId: string): void {
		vscode.postMessage({
			type: 'selectModel',
			payload: modelId !== '' ? modelId : null
		});
	}

	/**
	 * Select file
	 */
	private selectFile(filePath: string): void {
		vscode.postMessage({
			type: 'selectFile',
			payload: filePath !== '' ? filePath : null
		});
	}

	/**
	 * Execute command
	 */
	private executeCommand(commandId: string): void {
		if (!this.state.selectedAI || !this.state.selectedModel) {
			const status = document.getElementById('statusText');
			if (status) status.textContent = 'Please select AI and Model first';
			return;
		}

		vscode.postMessage({
			type: 'executeCommand',
			payload: {
				commandId,
				ai: this.state.selectedAI,
				model: this.state.selectedModel,
				file: this.state.selectedFile
			}
		});
	}

	/**
	 * Handle command response from extension
	 */
	private handleCommandResponse(response: any): void {
		const status = document.getElementById('statusText');
		if (status) {
			status.textContent = response.message || 'Command executed';
		}

		// Update status indicator
		const indicator = document.getElementById('statusIndicator');
		if (indicator) {
			indicator.className = `status-indicator ${response.status === 'success' ? 'success' : 'error'}`;
		}
	}

	/**
	 * Handle errors
	 */
	private handleError(error: any): void {
		const status = document.getElementById('statusText');
		if (status) {
			status.textContent = `Error: ${error.message}`;
		}

		const indicator = document.getElementById('statusIndicator');
		if (indicator) {
			indicator.className = 'status-indicator error';
		}
	}

	/**
	 * Toggle UI mode
	 */
	private toggleUIMode(): void {
		this.state.uiMode = this.state.uiMode === 'compact' ? 'expanded' : 'compact';
		this.render();
	}

	/**
	 * Clear history
	 */
	private clearHistory(): void {
		vscode.postMessage({
			type: 'clearHistory'
		});
		this.state.history = [];
		this.render();
	}

	/**
	 * Render AI selector
	 */
	private renderAISelector(): void {
		const select = document.getElementById('aiSelect') as HTMLSelectElement;
		if (!select) return;

		select.innerHTML = '<option value="">Select AI Provider...</option>';

		Object.values(this.ais).forEach((ai) => {
			if (ai.enabled) {
				const option = document.createElement('option');
				option.value = ai.id;
				option.textContent = ai.name;
				select.appendChild(option);
			}
		});

		if (this.state.selectedAI) {
			select.value = this.state.selectedAI;
			this.renderModelSelector();
		}
	}

	/**
	 * Render model selector
	 */
	private renderModelSelector(): void {
		const select = document.getElementById('modelSelect') as HTMLSelectElement;
		if (!select || !this.state.selectedAI) return;

		const ai = this.ais[this.state.selectedAI];
		select.disabled = !ai;

		if (!ai) {
			select.innerHTML = '<option value="">Select Model...</option>';
			return;
		}

		select.innerHTML = '<option value="">Select Model...</option>';

		ai.models.filter(m => m.enabled).forEach((model) => {
			const option = document.createElement('option');
			option.value = model.id;
			option.textContent = model.name;
			select.appendChild(option);
		});

		if (this.state.selectedModel) {
			select.value = this.state.selectedModel;
			this.renderModelInfo();
		}
	}

	/**
	 * Render model information
	 */
	private renderModelInfo(): void {
		const info = document.getElementById('modelInfo');
		if (!info || !this.state.selectedAI || !this.state.selectedModel) return;

		const ai = this.ais[this.state.selectedAI];
		const model = ai?.models.find(m => m.id === this.state.selectedModel);

		if (!model) {
			info.textContent = '';
			return;
		}

		info.innerHTML = `
			<small>
				<strong>Context:</strong> ${model.contextWindow.toLocaleString()} tokens<br>
				<strong>Capabilities:</strong> ${model.capabilities.join(', ')}
			</small>
		`;
	}

	/**
	 * Main render function
	 */
	private render(): void {
		// Update operations visibility
		const statusSection = document.getElementById('statusSection');
		if (statusSection) {
			statusSection.style.display = this.state.operations.length > 0 ? 'block' : 'none';
		}

		// Render operations
		this.renderOperations();

		// Render history
		this.renderHistory();

		// Update styles based on mode
		const container = document.querySelector('.codemate-container');
		if (container) {
			container.setAttribute('data-ui-mode', this.state.uiMode);
		}
	}

	/**
	 * Render active operations
	 */
	private renderOperations(): void {
		const list = document.getElementById('operationsList');
		if (!list) return;

		list.innerHTML = '';

		this.state.operations.forEach((op) => {
			const el = document.createElement('div');
			el.className = `operation-status ${op.status}`;

			const percentage = op.progress || 0;
			el.innerHTML = `
				<div class="operation-status-title">${op.commandId}</div>
				<div class="operation-status-message">${op.error || 'In progress...'}</div>
				${percentage > 0 ? `<div class="progress-bar"><div class="progress-fill" style="width: ${percentage}%"></div></div>` : ''}
			`;

			list.appendChild(el);
		});
	}

	/**
	 * Render history
	 */
	private renderHistory(): void {
		const list = document.getElementById('historyList');
		if (!list) return;

		list.innerHTML = '';

		this.state.history.slice(0, 10).forEach((entry) => {
			const el = document.createElement('div');
			el.className = `history-item ${entry.status}`;

			const time = new Date(entry.timestamp).toLocaleTimeString();
			el.innerHTML = `
				<div>${entry.commandId}</div>
				<div class="history-time">${time}</div>
			`;

			list.appendChild(el);
		});
	}
}

// Initialize UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	new CodeMateSidebarUI();

	// Request initial data from extension
	vscode.postMessage({
		type: 'requestInitialState'
	});
});
