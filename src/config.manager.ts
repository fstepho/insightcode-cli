// File: src/config.manager.ts

import * as fs from 'fs';
import * as path from 'path';
import { ThresholdConfig } from './types';
import { DEFAULT_THRESHOLDS } from './thresholds.constants';
import { deepMerge } from './utils';

let config: ThresholdConfig | null = null;

/**
 * Charge la configuration depuis insightcode.config.json, la fusionne avec les valeurs par défaut,
 * et la met en cache.
 */
export function getConfig(): ThresholdConfig {
  if (config) return config;

  try {
    const configPath = path.join(process.cwd(), 'insightcode.config.json');
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf-8');
      const userConfig = JSON.parse(content);
      // Fusionne en profondeur la configuration utilisateur avec celle par défaut
      config = deepMerge(DEFAULT_THRESHOLDS as unknown as Record<string, unknown>, userConfig.thresholds || {}) as unknown as ThresholdConfig;
    } else {
      config = DEFAULT_THRESHOLDS;
    }
  } catch (error) {
    console.warn('Warning: Failed to load or parse insightcode.config.json. Using default thresholds.');
    config = DEFAULT_THRESHOLDS;
  }

  return config!;
}

/**
 * Réinitialise la configuration en cache (principalement pour les tests).
 */
export function resetConfig(): void {
  config = null;
}

/**
 * Permet de forcer une configuration spécifique pour les tests.
 */
export function setConfigForTesting(testConfig: ThresholdConfig): void {
  config = testConfig;
}