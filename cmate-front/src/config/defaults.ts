/**
 * Default Configuration
 * Fallback configuration when no config.json is found
 */

import type { CodeMateConfig } from './types';

export const defaultConfig: CodeMateConfig = {
  version: '2.0.0',
  ias: {
    claude: {
      id: 'claude',
      name: 'Claude (Anthropic)',
      enabled: true,
      models: [
        {
          id: 'claude-3-5-sonnet',
          name: 'Claude 3.5 Sonnet',
          provider: 'claude',
          contextWindow: 200000,
          capabilities: ['code', 'reasoning', 'tools', 'images'],
          costPer1kTokens: { input: 0.003, output: 0.015 },
          enabled: true
        },
        {
          id: 'claude-3-opus',
          name: 'Claude 3 Opus',
          provider: 'claude',
          contextWindow: 200000,
          capabilities: ['code', 'reasoning', 'tools', 'images'],
          costPer1kTokens: { input: 0.015, output: 0.075 },
          enabled: true
        },
        {
          id: 'claude-3-haiku',
          name: 'Claude 3 Haiku',
          provider: 'claude',
          contextWindow: 200000,
          capabilities: ['code', 'reasoning'],
          costPer1kTokens: { input: 0.00025, output: 0.00125 },
          enabled: true
        }
      ]
    },
    chatgpt: {
      id: 'chatgpt',
      name: 'ChatGPT (OpenAI)',
      enabled: true,
      models: [
        {
          id: 'gpt-4o',
          name: 'GPT-4o',
          provider: 'chatgpt',
          contextWindow: 128000,
          capabilities: ['code', 'reasoning', 'tools', 'images'],
          costPer1kTokens: { input: 0.005, output: 0.015 },
          enabled: true
        },
        {
          id: 'gpt-4-turbo',
          name: 'GPT-4 Turbo',
          provider: 'chatgpt',
          contextWindow: 128000,
          capabilities: ['code', 'reasoning', 'tools', 'images'],
          costPer1kTokens: { input: 0.01, output: 0.03 },
          enabled: true
        },
        {
          id: 'gpt-4',
          name: 'GPT-4',
          provider: 'chatgpt',
          contextWindow: 8000,
          capabilities: ['code', 'reasoning'],
          costPer1kTokens: { input: 0.03, output: 0.06 },
          enabled: true
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          provider: 'chatgpt',
          contextWindow: 4096,
          capabilities: ['code'],
          costPer1kTokens: { input: 0.0005, output: 0.0015 },
          enabled: true
        }
      ]
    },
    gemini: {
      id: 'gemini',
      name: 'Gemini (Google)',
      enabled: true,
      models: [
        {
          id: 'gemini-2.0-flash',
          name: 'Gemini 2.0 Flash',
          provider: 'gemini',
          contextWindow: 1000000,
          capabilities: ['code', 'reasoning', 'tools', 'images', 'video'],
          enabled: true
        },
        {
          id: 'gemini-1.5-pro',
          name: 'Gemini 1.5 Pro',
          provider: 'gemini',
          contextWindow: 1000000,
          capabilities: ['code', 'reasoning', 'tools', 'images', 'video'],
          enabled: true
        },
        {
          id: 'gemini-1.5-flash',
          name: 'Gemini 1.5 Flash',
          provider: 'gemini',
          contextWindow: 1000000,
          capabilities: ['code', 'reasoning', 'images', 'video'],
          enabled: true
        }
      ]
    },
    grok: {
      id: 'grok',
      name: 'Grok (xAI)',
      enabled: false,
      models: [
        {
          id: 'grok-2',
          name: 'Grok 2',
          provider: 'grok',
          contextWindow: 128000,
          capabilities: ['code', 'reasoning'],
          enabled: true
        },
        {
          id: 'grok-2-vision',
          name: 'Grok 2 Vision',
          provider: 'grok',
          contextWindow: 128000,
          capabilities: ['code', 'reasoning', 'images'],
          enabled: true
        }
      ]
    },
    deepseek: {
      id: 'deepseek',
      name: 'DeepSeek',
      enabled: false,
      models: [
        {
          id: 'deepseek-coder',
          name: 'DeepSeek Coder',
          provider: 'deepseek',
          contextWindow: 4000,
          capabilities: ['code'],
          enabled: true
        },
        {
          id: 'deepseek-chat',
          name: 'DeepSeek Chat',
          provider: 'deepseek',
          contextWindow: 4000,
          capabilities: ['code', 'reasoning'],
          enabled: true
        }
      ]
    }
  },
  tools: {
    formatter: {
      enabled: true,
      command: 'prettier',
      args: ['--write'],
      formatter: 'prettier'
    },
    linter: {
      enabled: true,
      command: 'eslint',
      args: ['--fix'],
      linter: 'eslint'
    },
    testRunner: {
      enabled: true,
      command: 'jest',
      testRunner: 'jest'
    },
    generator: {
      enabled: true
    }
  },
  debug: {
    enabled: true,
    logLevel: 'info',
    breakpointSupport: true
  },
  ui: {
    theme: 'auto',
    sidebarPosition: 'left',
    animationsEnabled: true
  }
};
