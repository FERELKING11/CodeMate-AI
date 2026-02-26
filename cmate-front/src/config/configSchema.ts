/**
 * Configuration Schema Validation
 * Validates and type-checks configuration objects
 */

import type { CodeMateConfig, AIProvider, AIModel, ToolConfig } from './types';
import type { ValidationResult } from '../types';

export class ConfigSchema {
  static validateConfig(config: unknown): ValidationResult {
    const errors: string[] = [];

    if (!config || typeof config !== 'object') {
      errors.push('Configuration must be an object');
      return { valid: false, errors };
    }

    const cfg = config as Record<string, any>;

    // Validate version
    if (!cfg.version || typeof cfg.version !== 'string') {
      errors.push('Configuration must have a valid "version" field');
    }

    // Validate ias
    if (!cfg.ias || typeof cfg.ias !== 'object') {
      errors.push('Configuration must have an "ias" object');
    } else {
      for (const [key, ia] of Object.entries(cfg.ias)) {
        const iaValidation = this.validateAI(ia, key);
        if (!iaValidation.valid) {
          errors.push(...(iaValidation.errors || []));
        }
      }
    }

    // Validate tools (optional)
    if (cfg.tools && typeof cfg.tools === 'object') {
      for (const [key, tool] of Object.entries(cfg.tools)) {
        if (!tool || typeof tool !== 'object') {
          errors.push(`Tool "${key}" must be an object`);
        }
      }
    }

    // Validate debug (optional)
    if (cfg.debug) {
      if (!['debug', 'info', 'warn', 'error'].includes(cfg.debug.logLevel)) {
        errors.push('Invalid debug.logLevel value');
      }
      if (typeof cfg.debug.enabled !== 'boolean') {
        errors.push('debug.enabled must be a boolean');
      }
    }

    // Validate ui (optional)
    if (cfg.ui) {
      if (!['light', 'dark', 'auto'].includes(cfg.ui.theme)) {
        errors.push('Invalid ui.theme value');
      }
      if (!['left', 'right'].includes(cfg.ui.sidebarPosition)) {
        errors.push('Invalid ui.sidebarPosition value');
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  private static validateAI(ai: unknown, name: string): ValidationResult {
    const errors: string[] = [];

    if (!ai || typeof ai !== 'object') {
      errors.push(`AI provider "${name}" must be an object`);
      return { valid: false, errors };
    }

    const provider = ai as Record<string, any>;

    // Required fields
    if (!provider.id || typeof provider.id !== 'string') {
      errors.push(`AI provider "${name}" must have a valid "id" field`);
    }

    if (!provider.name || typeof provider.name !== 'string') {
      errors.push(`AI provider "${name}" must have a valid "name" field`);
    }

    if (typeof provider.enabled !== 'boolean') {
      errors.push(`AI provider "${name}" must have a boolean "enabled" field`);
    }

    // Validate models
    if (!Array.isArray(provider.models)) {
      errors.push(`AI provider "${name}" must have a "models" array`);
    } else {
      for (let i = 0; i < provider.models.length; i++) {
        const modelValidation = this.validateModel(provider.models[i], `${name}.models[${i}]`);
        if (!modelValidation.valid) {
          errors.push(...(modelValidation.errors || []));
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  private static validateModel(model: unknown, name: string): ValidationResult {
    const errors: string[] = [];

    if (!model || typeof model !== 'object') {
      errors.push(`Model "${name}" must be an object`);
      return { valid: false, errors };
    }

    const m = model as Record<string, any>;

    // Required fields
    if (!m.id || typeof m.id !== 'string') {
      errors.push(`Model "${name}" must have a valid "id" field`);
    }

    if (!m.name || typeof m.name !== 'string') {
      errors.push(`Model "${name}" must have a valid "name" field`);
    }

    if (!m.provider || typeof m.provider !== 'string') {
      errors.push(`Model "${name}" must have a valid "provider" field`);
    }

    if (typeof m.contextWindow !== 'number' || m.contextWindow <= 0) {
      errors.push(`Model "${name}" must have a valid "contextWindow" number`);
    }

    if (!Array.isArray(m.capabilities)) {
      errors.push(`Model "${name}" must have a "capabilities" array`);
    }

    if (typeof m.enabled !== 'boolean') {
      errors.push(`Model "${name}" must have a boolean "enabled" field`);
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  static getSchema(): Record<string, any> {
    return {
      version: { type: 'string', required: true },
      ias: {
        type: 'object',
        required: true,
        properties: {
          id: { type: 'string', required: true },
          name: { type: 'string', required: true },
          enabled: { type: 'boolean', required: true },
          models: {
            type: 'array',
            required: true,
            items: {
              id: { type: 'string', required: true },
              name: { type: 'string', required: true },
              provider: { type: 'string', required: true },
              contextWindow: { type: 'number', required: true },
              capabilities: { type: 'array', required: true },
              enabled: { type: 'boolean', required: true }
            }
          }
        }
      },
      tools: { type: 'object', required: false },
      debug: { type: 'object', required: false },
      ui: { type: 'object', required: false }
    };
  }
}
