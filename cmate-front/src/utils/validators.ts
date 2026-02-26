/**
 * Validators Utility
 * Input validation helpers
 */

import type { ValidationResult } from '../types';

export const validators = {
  isValidPath(path: string): boolean {
    if (!path || typeof path !== 'string') return false;
    // Prevent directory traversal and absolute paths
    if (path.includes('..') || path.startsWith('/')) return false;
    return path.trim().length > 0;
  },

  isValidFileName(fileName: string): boolean {
    if (!fileName || typeof fileName !== 'string') return false;
    // Prevent invalid file name characters
    const invalidChars = /[\0<>:"/\\|?*]/g;
    return !invalidChars.test(fileName) && fileName.trim().length > 0;
  },

  isValidContent(content: string | undefined): boolean {
    return typeof content === 'string' || content === undefined;
  },

  validateFilePath(path: string): ValidationResult {
    const errors: string[] = [];

    if (!path) {
      errors.push('Path cannot be empty');
    }

    if (path?.includes('..')) {
      errors.push('Path traversal (../) is not allowed');
    }

    if (path?.startsWith('/')) {
      errors.push('Absolute paths are not allowed');
    }

    if (path && path.includes('\0')) {
      errors.push('Path contains invalid characters');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  },

  validateAIId(aiId: string): ValidationResult {
    const errors: string[] = [];

    if (!aiId || typeof aiId !== 'string') {
      errors.push('AI provider ID must be a non-empty string');
    }

    if (aiId && !/^[a-z0-9-]+$/.test(aiId)) {
      errors.push('AI provider ID must contain only lowercase letters, numbers, and hyphens');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  },

  validateModelId(modelId: string): ValidationResult {
    const errors: string[] = [];

    if (!modelId || typeof modelId !== 'string') {
      errors.push('Model ID must be a non-empty string');
    }

    if (modelId && modelId.trim().length === 0) {
      errors.push('Model ID cannot be empty');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  },

  validateJSON(jsonString: string): ValidationResult {
    try {
      JSON.parse(jsonString);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        errors: [(error as Error).message || 'Invalid JSON']
      };
    }
  }
};
