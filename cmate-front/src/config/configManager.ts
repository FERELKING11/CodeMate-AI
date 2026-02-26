/**
 * Configuration Manager
 * Manages config.json loading, VSCode settings merging, and file watching
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as vscode from 'vscode';
import type { CodeMateConfig, AIProvider, AIModel } from './types';
import { ConfigSchema } from './configSchema';
import { defaultConfig } from './defaults';
import type { Logger } from '../types';

export class ConfigManager {
	private config: CodeMateConfig;
	private configPath: string | null = null;
	private watcher: fs.FSWatcher | null = null;
	private changeListeners: Array<(config: CodeMateConfig) => void> = [];
	private logger?: Logger;

	constructor(logger?: Logger) {
		this.logger = logger;
		this.config = this.loadConfig();
		this.watchConfigFile();
	}

	/**
	 * Load configuration from file or use defaults
	 */
	private loadConfig(): CodeMateConfig {
		const configPath = this.resolveConfigPath();

		if (configPath && fs.existsSync(configPath)) {
			try {
				this.logger?.info(`Loading config from: ${configPath}`);
				const contents = fs.readFileSync(configPath, 'utf-8');
				const parsed = JSON.parse(contents);

				// Validate configuration
				const validation = ConfigSchema.validateConfig(parsed);
				if (!validation.valid) {
					this.logger?.warn(`Config validation failed: ${validation.errors?.join(', ')}`);
					return defaultConfig;
				}

				this.configPath = configPath;
				return parsed as CodeMateConfig;
			} catch (error) {
				this.logger?.error('Failed to load config from file', error);
				return defaultConfig;
			}
		}

		this.logger?.info('Using default configuration');
		return defaultConfig;
	}

	/**
	 * Resolve config file path
	 * Priority: workspace/.codemate/config.json > ~/.codemate/config.json
	 */
	private resolveConfigPath(): string | null {
		// Try workspace root first
		const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (workspaceRoot) {
			const workspaceConfig = path.join(workspaceRoot, '.codemate', 'config.json');
			if (fs.existsSync(workspaceConfig)) {
				return workspaceConfig;
			}
		}

		// Try user home directory
		const homeConfig = path.join(os.homedir(), '.codemate', 'config.json');
		if (fs.existsSync(homeConfig)) {
			return homeConfig;
		}

		return null;
	}

	/**
	 * Watch config file for changes
	 */
	private watchConfigFile(): void {
		if (!this.configPath) return;

		try {
			const configDir = path.dirname(this.configPath);
			if (!fs.existsSync(configDir)) return;

			this.watcher = fs.watch(configDir, (eventType, filename) => {
				if (filename === 'config.json' && (eventType === 'change' || eventType === 'rename')) {
					this.logger?.info('Config file changed, reloading...');
					this.config = this.loadConfig();
					this.notifyListeners(this.config);
				}
			});

			this.logger?.debug('File watcher started for config file');
		} catch (error) {
			this.logger?.warn('Failed to set up file watcher', error);
		}
	}

	/**
	 * Get the current configuration
	 */
	getConfig(): CodeMateConfig {
		return { ...this.config };
	}

	/**
	 * Get configuration merged with VSCode settings
	 */
	async getConfigMergedWithSettings(): Promise<CodeMateConfig> {
		const vsCodeConfig = vscode.workspace.getConfiguration('codemate');
		const config = { ...this.config };

		// Override debug settings from VSCode settings
		if (vsCodeConfig.has('debug.logLevel')) {
			config.debug.logLevel = vsCodeConfig.get('debug.logLevel', 'info') as any;
		}

		// Override UI settings from VSCode settings
		if (vsCodeConfig.has('enableAnimations')) {
			config.ui.animationsEnabled = vsCodeConfig.get('enableAnimations', true);
		}

		return config;
	}

	/**
	 * Get enabled AI providers
	 */
	getEnabledAIs(): AIProvider[] {
		return Object.values(this.config.ias).filter(ai => ai.enabled);
	}

	/**
	 * Get specific AI provider
	 */
	getAI(id: string): AIProvider | undefined {
		return this.config.ias[id];
	}

	/**
	 * Get all models for an AI provider
	 */
	getModelsForAI(aiId: string): AIModel[] {
		const ai = this.config.ias[aiId];
		if (!ai) return [];
		return ai.models.filter(m => m.enabled);
	}

	/**
	 * Get specific model
	 */
	getModel(providerId: string, modelId: string): AIModel | undefined {
		const ai = this.config.ias[providerId];
		if (!ai) return undefined;
		return ai.models.find(m => m.id === modelId && m.enabled);
	}

	/**
	 * Get tool configuration
	 */
	getTool(toolId: string) {
		return this.config.tools[toolId];
	}

	/**
	 * Subscribe to configuration changes
	 */
	onConfigChange(listener: (config: CodeMateConfig) => void): () => void {
		this.changeListeners.push(listener);
		// Return unsubscribe function
		return () => {
			this.changeListeners = this.changeListeners.filter(l => l !== listener);
		};
	}

	/**
	 * Notify all listeners of configuration changes
	 */
	private notifyListeners(config: CodeMateConfig): void {
		for (const listener of this.changeListeners) {
			try {
				listener(config);
			} catch (error) {
				this.logger?.error('Error in config change listener', error);
			}
		}
	}

	/**
	 * Get backend URL from settings or config
	 */
	getBackendUrl(): string {
		return vscode.workspace.getConfiguration('codemate').get('backendUrl', 'ws://localhost:8080');
	}

	/**
	 * Get language setting
	 */
	getLanguage(): 'auto' | 'en' | 'fr' {
		return vscode.workspace.getConfiguration('codemate').get('language', 'auto') as any;
	}

	/**
	 * Get debug log level
	 */
	getLogLevel(): 'debug' | 'info' | 'warn' | 'error' {
		return this.config.debug.logLevel;
	}

	/**
	 * Clean up resources
	 */
	dispose(): void {
		if (this.watcher) {
			this.watcher.close();
		}
		this.changeListeners = [];
	}
}
