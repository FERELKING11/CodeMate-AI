/**
 * Sidebar State Manager
 * Manages UI state and emits change events
 */

import type { SidebarState, HistoryEntry, PendingOperation } from './types';
import type { EventEmitter } from '../types';
import { generateUUID } from '../utils/uuid';

export class StateManager implements EventEmitter<SidebarState> {
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

	private changeListeners: Array<(state: SidebarState) => void | Promise<void>> = [];

	/**
	 * Get current state (defensive copy)
	 */
	getState(): SidebarState {
		return { ...this.state };
	}

	/**
	 * Update state (merges with existing state)
	 */
	setState(partial: Partial<SidebarState>): void {
		this.state = { ...this.state, ...partial };
		this.emit(this.state);
	}

	/**
	 * Set selected AI provider
	 */
	setSelectedAI(aiId: string | null): void {
		this.state.selectedAI = aiId;
		// Reset model when AI changes
		this.state.selectedModel = null;
		this.emit(this.state);
	}

	/**
	 * Set selected model
	 */
	setSelectedModel(modelId: string | null): void {
		this.state.selectedModel = modelId;
		this.emit(this.state);
	}

	/**
	 * Set selected file
	 */
	setSelectedFile(filePath: string | null): void {
		this.state.selectedFile = filePath;
		this.emit(this.state);
	}

	/**
	 * Set selected operation
	 */
	setSelectedOperation(operationId: string | null): void {
		this.state.selectedOperation = operationId;
		this.emit(this.state);
	}

	/**
	 * Set loading state
	 */
	setLoading(isLoading: boolean): void {
		this.state.isLoading = isLoading;
		this.emit(this.state);
	}

	/**
	 * Add operation to pending queue
	 */
	addOperation(operation: Omit<PendingOperation, 'id'>): string {
		const id = generateUUID();
		const fullOperation: PendingOperation = {
			id,
			...operation
		};

		this.state.operations.push(fullOperation);
		this.emit(this.state);
		return id;
	}

	/**
	 * Update pending operation
	 */
	updateOperation(id: string, partial: Partial<PendingOperation>): void {
		const operation = this.state.operations.find(op => op.id === id);
		if (operation) {
			Object.assign(operation, partial);
			this.emit(this.state);
		}
	}

	/**
	 * Remove operation from pending queue
	 */
	removeOperation(id: string): void {
		this.state.operations = this.state.operations.filter(op => op.id !== id);
		this.emit(this.state);
	}

	/**
	 * Add entry to history (keeps last 50)
	 */
	addToHistory(entry: Omit<HistoryEntry, 'id'>): string {
		const id = generateUUID();
		const fullEntry: HistoryEntry = {
			id,
			...entry
		};

		this.state.history = [fullEntry, ...this.state.history].slice(0, 50);
		this.emit(this.state);
		return id;
	}

	/**
	 * Clear history
	 */
	clearHistory(): void {
		this.state.history = [];
		this.emit(this.state);
	}

	/**
	 * Toggle UI mode (compact <-> expanded)
	 */
	toggleUIMode(): void {
		this.state.uiMode = this.state.uiMode === 'compact' ? 'expanded' : 'compact';
		this.emit(this.state);
	}

	/**
	 * Subscribe to state changes
	 */
	on(callback: (state: SidebarState) => void | Promise<void>): () => void {
		this.changeListeners.push(callback);
		// Return unsubscribe function
		return () => {
			this.changeListeners = this.changeListeners.filter(l => l !== callback);
		};
	}

	/**
	 * Subscribe once to next state change
	 */
	once(callback: (state: SidebarState) => void | Promise<void>): void {
		const unsubscribe = this.on(async state => {
			await callback(state);
			unsubscribe();
		});
	}

	/**
	 * Emit state change to all listeners
	 */
	async emit(event: SidebarState): Promise<void> {
		const promises = this.changeListeners.map(listener => {
			try {
				return Promise.resolve(listener(event));
			} catch (error) {
				console.error('Error in state change listener:', error);
				return Promise.resolve();
			}
		});

		await Promise.all(promises);
	}

	/**
	 * Reset to initial state
	 */
	reset(): void {
		this.state = {
			selectedAI: null,
			selectedModel: null,
			selectedFile: null,
			selectedOperation: null,
			isLoading: false,
			operations: [],
			history: [],
			uiMode: 'expanded'
		};
		this.emit(this.state);
	}

	/**
	 * Clear all listeners
	 */
	clearListeners(): void {
		this.changeListeners = [];
	}
}
