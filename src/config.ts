import * as fs from 'fs';
import * as path from 'path';

export interface ConfigThresholds {
  complexity: {
    excellent: number;
    good: number;
    acceptable: number;
    poor: number;
    veryPoor: number;
  };
  duplication: {
    excellent: number;
    good: number;
    acceptable: number;
    poor: number;
    veryPoor: number;
  };
  fileSize: {
    excellent: number;
    good: number;
    acceptable: number;
    poor: number;
    veryPoor: number;
  };
  functionCount: {
    excellent: number;
    good: number;
    acceptable: number;
    poor: number;
  };
  grades: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
  maintainabilityLabels: {
    good: number;
    acceptable: number;
    poor: number;
  };
  extremeFilePenalties: {
    largeFileThreshold: number;
    largeFilePenalty: number;
    massiveFileThreshold: number;
    massiveFilePenalty: number;
  };
}

const DEFAULT_THRESHOLDS: ConfigThresholds = {
  complexity: {
    excellent: 10,
    good: 15,
    acceptable: 20,
    poor: 30,
    veryPoor: 50
  },
  duplication: {
    excellent: 3,
    good: 8,
    acceptable: 15,
    poor: 30,
    veryPoor: 50
  },
  fileSize: {
    excellent: 200,
    good: 300,
    acceptable: 400,
    poor: 500,
    veryPoor: 750
  },
  functionCount: {
    excellent: 10,
    good: 15,
    acceptable: 20,
    poor: 30
  },
  grades: {
    A: 90,
    B: 80,
    C: 70,
    D: 60
  },
  maintainabilityLabels: {
    good: 80,
    acceptable: 60,
    poor: 40
  },
  extremeFilePenalties: {
    largeFileThreshold: 1000,
    largeFilePenalty: 10,
    massiveFileThreshold: 2000,
    massiveFilePenalty: 20
  }
};

let config: ConfigThresholds | null = null;

export function getConfig(): ConfigThresholds {
  if (config) return config;

  try {
    const configPath = path.join(process.cwd(), 'insightcode.config.json');
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf-8');
      const userConfig = JSON.parse(content);
      config = { ...DEFAULT_THRESHOLDS, ...userConfig.thresholds };
    } else {
      config = DEFAULT_THRESHOLDS;
    }
  } catch (error) {
    console.warn('Warning: Failed to load config, using defaults');
    config = DEFAULT_THRESHOLDS;
  }

  return config!;
}

export function resetConfig(): void {
  config = null;
}

export function setConfigForTesting(testConfig: ConfigThresholds): void {
  config = testConfig;
}