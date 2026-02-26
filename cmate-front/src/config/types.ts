/**
 * Configuration Types
 * Type definitions for config.json and configuration management
 */

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  capabilities: string[];
  costPer1kTokens?: {
    input: number;
    output: number;
  };
  enabled: boolean;
}

export interface AIProvider {
  id: string;
  name: string;
  enabled: boolean;
  apiKey?: string;
  baseUrl?: string;
  models: AIModel[];
}

export interface ToolConfig {
  enabled: boolean;
  command?: string;
  args?: string[];
  formatter?: string;
  linter?: string;
  testRunner?: string;
}

export interface DebugConfig {
  enabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  breakpointSupport: boolean;
}

export interface UIConfig {
  theme: 'light' | 'dark' | 'auto';
  sidebarPosition: 'left' | 'right';
  animationsEnabled: boolean;
}

export interface CodeMateConfig {
  version: string;
  ias: {
    [key: string]: AIProvider;
  };
  tools: {
    [key: string]: ToolConfig;
  };
  debug: DebugConfig;
  ui: UIConfig;
}
