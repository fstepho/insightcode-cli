// File: src/config.ts

import * as fs from 'fs';
import * as path from 'path';
import { ThresholdConfig } from './types';
import { deepMerge } from './utils'; 

// Les seuils par défaut pour la création d'Issues.
export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  complexity: {
    production: { medium: 10, high: 20 },
    test: { medium: 15, high: 30 },
    utility: { medium: 15, high: 25 },
    example: { medium: 20, high: 40 },
    config: { medium: 20, high: 35 }
  },
  size: {
    production: { medium: 200, high: 300 },
    test: { medium: 300, high: 500 },
    utility: { medium: 250, high: 400 },
    example: { medium: 150, high: 250 },
    config: { medium: 300, high: 500 }
  },
  duplication: {
    production: { medium: 15, high: 30 },
    test: { medium: 25, high: 50 },
    utility: { medium: 20, high: 40 },
    example: { medium: 50, high: 80 },
    config: { medium: 30, high: 60 }
  }
};

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
      config = deepMerge(DEFAULT_THRESHOLDS, userConfig.thresholds || {});
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
