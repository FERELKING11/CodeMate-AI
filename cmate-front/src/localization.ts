import * as vscode from 'vscode';
import en from './locales/en.json';
import fr from './locales/fr.json';

export type Strings = { [key: string]: string };

export function loadStrings(configuredLanguage?: string): Strings {
  let lang = configuredLanguage || vscode.workspace.getConfiguration().get('codemate.language', 'auto');
  if (lang === 'auto') {
    const envLang = (vscode.env.language || 'en').toLowerCase();
    lang = envLang.startsWith('fr') ? 'fr' : 'en';
  }
  return lang === 'fr' ? (fr as any) : (en as any);
}

export function t(strings: Strings, key: string): string {
  return strings[key] || key;
}
