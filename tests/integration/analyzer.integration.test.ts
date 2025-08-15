import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { AnalysisOptions } from '../../src/types';
import { analyze } from '../../src/analyzer';

/**
 * Analyzer Integration Tests
 * 
 * Tests pour les flux d'analyse complets, en évitant les biais de confirmation:
 * - Teste des projets avec différentes caractéristiques réelles
 * - Valide la cohérence entre différentes options d'analyse
 * - Vérifie les cas limites et les scénarios d'erreur
 */

describe('Analyzer Integration Tests', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(tmpdir(), 'analyzer-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Real Project Analysis', () => {
    it('analyzes a React-like component structure', async () => {
      const reactProject = {
        'src/components/Header.tsx': `
          import React from 'react';
          
          interface HeaderProps {
            title: string;
            subtitle?: string;
            onMenuClick: () => void;
          }
          
          export const Header: React.FC<HeaderProps> = ({ title, subtitle, onMenuClick }) => {
            return (
              <header className="header">
                <div className="header-content">
                  <h1>{title}</h1>
                  {subtitle && <h2>{subtitle}</h2>}
                  <button onClick={onMenuClick} aria-label="Open menu">
                    ☰
                  </button>
                </div>
              </header>
            );
          };
        `,
        'src/hooks/useLocalStorage.ts': `
          import { useState, useEffect } from 'react';
          
          export function useLocalStorage<T>(key: string, initialValue: T) {
            const [storedValue, setStoredValue] = useState<T>(() => {
              try {
                const item = window.localStorage.getItem(key);
                return item ? JSON.parse(item) : initialValue;
              } catch (error) {
                console.error('Error reading from localStorage:', error);
                return initialValue;
              }
            });
          
            const setValue = (value: T | ((val: T) => T)) => {
              try {
                const valueToStore = value instanceof Function ? value(storedValue) : value;
                setStoredValue(valueToStore);
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
              } catch (error) {
                console.error('Error writing to localStorage:', error);
              }
            };
          
            return [storedValue, setValue] as const;
          }
        `,
        'src/utils/api.ts': `
          interface ApiResponse<T> {
            data: T;
            status: number;
            message?: string;
          }
          
          export class ApiClient {
            private baseUrl: string;
            private headers: Record<string, string>;
          
            constructor(baseUrl: string) {
              this.baseUrl = baseUrl;
              this.headers = {
                'Content-Type': 'application/json'
              };
            }
          
            async get<T>(endpoint: string): Promise<ApiResponse<T>> {
              const response = await fetch(\`\${this.baseUrl}\${endpoint}\`, {
                method: 'GET',
                headers: this.headers
              });
          
              const data = await response.json();
              
              return {
                data,
                status: response.status,
                message: response.statusText
              };
            }
          
            async post<T>(endpoint: string, payload: unknown): Promise<ApiResponse<T>> {
              const response = await fetch(\`\${this.baseUrl}\${endpoint}\`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(payload)
              });
          
              const data = await response.json();
              
              return {
                data,
                status: response.status,
                message: response.statusText
              };
            }
          }
        `
      };

      createProjectStructure(tempDir, reactProject);

      const options: AnalysisOptions = {
        format: 'json',
        projectPath: tempDir,
        includeQuickWins: true
      };

      const result = await analyze(tempDir, options);

      // Assertions générales sur la structure
      expect(result.overview).toBeDefined();
      expect(result.details).toBeDefined();
      expect(result.details.length).toBe(3);

      // Vérifier que chaque fichier a été analysé
      const fileNames = result.details.map(d => path.basename(d.file));
      expect(fileNames).toContain('Header.tsx');
      expect(fileNames).toContain('useLocalStorage.ts');
      expect(fileNames).toContain('api.ts');

      // Vérifier la cohérence des données
      result.details.forEach(file => {
        expect(file.healthScore).toBeGreaterThanOrEqual(0);
        expect(file.healthScore).toBeLessThanOrEqual(100);
        expect(file.functions).toBeDefined();
        expect(Array.isArray(file.issues)).toBe(true);
      });

      // Le hook localStorage devrait être détecté comme ayant des opérations impures
      const hookFile = result.details.find(d => d.file.includes('useLocalStorage'));
      expect(hookFile).toBeDefined();
      // Note: On ne fait pas d'assertion sur le score spécifique, on teste juste la cohérence
    });

    it('analyzes a Node.js backend structure', async () => {
      const backendProject = {
        'src/server.ts': `
          import express from 'express';
          import { userRoutes } from './routes/users';
          import { errorHandler } from './middleware/errorHandler';
          
          const app = express();
          const port = process.env.PORT || 3000;
          
          app.use(express.json());
          app.use('/api/users', userRoutes);
          app.use(errorHandler);
          
          app.listen(port, () => {
            console.log(\`Server running on port \${port}\`);
          });
        `,
        'src/routes/users.ts': `
          import { Router } from 'express';
          import { UserService } from '../services/UserService';
          import { validateUserInput } from '../utils/validation';
          
          export const userRoutes = Router();
          const userService = new UserService();
          
          userRoutes.get('/', async (req, res, next) => {
            try {
              const users = await userService.getAllUsers();
              res.json(users);
            } catch (error) {
              next(error);
            }
          });
          
          userRoutes.post('/', async (req, res, next) => {
            try {
              const validationResult = validateUserInput(req.body);
              if (!validationResult.isValid) {
                return res.status(400).json({ errors: validationResult.errors });
              }
              
              const user = await userService.createUser(req.body);
              res.status(201).json(user);
            } catch (error) {
              next(error);
            }
          });
        `,
        'src/services/UserService.ts': `
          import { DatabaseClient } from '../database/DatabaseClient';
          
          interface User {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
          }
          
          export class UserService {
            private db: DatabaseClient;
          
            constructor() {
              this.db = new DatabaseClient();
            }
          
            async getAllUsers(): Promise<User[]> {
              const query = 'SELECT * FROM users ORDER BY created_at DESC';
              return await this.db.query(query);
            }
          
            async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
              const query = \`
                INSERT INTO users (email, name, created_at) 
                VALUES ($1, $2, NOW()) 
                RETURNING *
              \`;
              
              const [user] = await this.db.query(query, [userData.email, userData.name]);
              return user;
            }
          
            async getUserById(id: string): Promise<User | null> {
              const query = 'SELECT * FROM users WHERE id = $1';
              const [user] = await this.db.query(query, [id]);
              return user || null;
            }
          }
        `,
        'src/database/DatabaseClient.ts': `
          export class DatabaseClient {
            private connectionString: string;
          
            constructor() {
              this.connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/mydb';
            }
          
            async query(sql: string, params: any[] = []): Promise<any[]> {
              // Simulation d'une requête DB
              console.log('Executing query:', sql, 'with params:', params);
              
              // Dans la vraie vie, ceci utiliserait pg, mysql2, etc.
              return [];
            }
          
            async transaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T> {
              // Simulation d'une transaction
              console.log('Starting transaction');
              try {
                const result = await callback(this);
                console.log('Transaction committed');
                return result;
              } catch (error) {
                console.log('Transaction rolled back');
                throw error;
              }
            }
          }
        `
      };

      createProjectStructure(tempDir, backendProject);

      const result = await analyze(tempDir, {
        format: 'json',
        projectPath: tempDir,
        includeQuickWins: true
      });

      expect(result.details.length).toBe(4);

      // Vérifier que tous les fichiers ont des métriques cohérentes
      result.details.forEach(file => {
        expect(file.metrics).toBeDefined();
        expect(file.metrics.complexity).toBeGreaterThanOrEqual(0);
        expect(file.metrics.loc).toBeGreaterThanOrEqual(0);
        expect(file.metrics.duplicationRatio).toBeGreaterThanOrEqual(0);
      });

      // Les fichiers de service devraient avoir des fonctions détectées
      const serviceFile = result.details.find(d => d.file.includes('UserService'));
      expect(serviceFile).toBeDefined();
      expect(serviceFile!.functions!.length).toBeGreaterThan(0);
    });
  });

  describe('Analysis Consistency', () => {
    it('produces consistent results across multiple runs', async () => {
      const consistentProject = {
        'src/calculator.ts': `
          export class Calculator {
            add(a: number, b: number): number {
              return a + b;
            }
          
            subtract(a: number, b: number): number {
              return a - b;
            }
          
            multiply(a: number, b: number): number {
              return a * b;
            }
          
            divide(a: number, b: number): number {
              if (b === 0) {
                throw new Error('Division by zero');
              }
              return a / b;
            }
          }
        `
      };

      createProjectStructure(tempDir, consistentProject);

      const options: AnalysisOptions = {
        format: 'json',
        projectPath: tempDir
      };

      // Exécuter l'analyse plusieurs fois
      const results = await Promise.all([
        analyze(tempDir, options),
        analyze(tempDir, options),
        analyze(tempDir, options)
      ]);

      // Les résultats devraient être identiques
      const [first, second, third] = results;
      
      expect(first.overview.scores.overall).toBe(second.overview.scores.overall);
      expect(first.overview.scores.overall).toBe(third.overview.scores.overall);
      
      expect(first.details.length).toBe(second.details.length);
      expect(first.details.length).toBe(third.details.length);
      
      // Vérifier la cohérence des métriques pour chaque fichier
      first.details.forEach((file, index) => {
        expect(file.healthScore).toBe(second.details[index].healthScore);
        expect(file.healthScore).toBe(third.details[index].healthScore);
      });
    });

    it('handles production vs development mode consistently', async () => {
      const mixedProject = {
        'src/main.ts': 'export const main = () => console.log("main");',
        'src/utils.ts': 'export const utils = () => console.log("utils");',
        'tests/main.test.ts': 'import { main } from "../src/main"; test("main", () => {});',
        'examples/demo.ts': 'import { main } from "../src/main"; main();'
      };

      createProjectStructure(tempDir, mixedProject);

      const devResult = await analyze(tempDir, {
        format: 'json',
        projectPath: tempDir,
        production: false
      });

      const prodResult = await analyze(tempDir, {
        format: 'json',
        projectPath: tempDir,
        production: true
      });

      // Production devrait avoir moins de fichiers
      expect(prodResult.details.length).toBeLessThanOrEqual(devResult.details.length);
      
      // Les fichiers communs devraient avoir les mêmes scores
      const commonFiles = prodResult.details.filter(prodFile =>
        devResult.details.some(devFile => 
          path.basename(devFile.file) === path.basename(prodFile.file)
        )
      );
      
      commonFiles.forEach(prodFile => {
        const devFile = devResult.details.find(df => 
          path.basename(df.file) === path.basename(prodFile.file)
        );
        expect(devFile).toBeDefined();
        expect(prodFile.healthScore).toBe(devFile!.healthScore);
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles files with TypeScript compilation errors gracefully', async () => {
      const brokenProject = {
        'src/broken.ts': `
          import { NonExistentType } from './nowhere';
          
          function brokenFunction(param: NonExistentType): UnknownType {
            const x: UndefinedInterface = {
              property: value, // undefined variable
              method: () => {
                return someUndefinedFunction();
              }
            };
            
            // Syntax error
            if (x.property === {
              return x.method();
            }
          }
        `,
        'src/working.ts': `
          export function workingFunction(x: number): number {
            return x * 2;
          }
        `
      };

      createProjectStructure(tempDir, brokenProject);

      // L'analyse ne devrait pas crasher même avec des erreurs TypeScript
      const result = await analyze(tempDir, {
        format: 'json',
        projectPath: tempDir
      });

      // Devrait au moins analyser le fichier qui fonctionne
      expect(result.details.length).toBeGreaterThanOrEqual(1);
      
      const workingFile = result.details.find(d => d.file.includes('working.ts'));
      expect(workingFile).toBeDefined();
      expect(workingFile!.functions.length).toBe(1);
    });

    it('handles empty and whitespace-only files', async () => {
      const edgeCaseProject = {
        'src/empty.ts': '',
        'src/whitespace.ts': '   \n\n\t\t  \n   ',
        'src/comments-only.ts': `
          // This file contains only comments
          /* 
           * Multiple line comment
           * No actual code
           */
          
          // Another comment
        `,
        'src/imports-only.ts': `
          import fs from 'fs';
          import path from 'path';
          import { something } from 'somewhere';
        `,
        'src/normal.ts': `
          export const value = 42;
        `
      };

      createProjectStructure(tempDir, edgeCaseProject);

      const result = await analyze(tempDir, {
        format: 'json',
        projectPath: tempDir
      });

      // Tous les fichiers devraient être traités
      expect(result.details.length).toBe(5);
      
      // Les fichiers vides devraient avoir des métriques cohérentes
      result.details.forEach(file => {
        expect(file.healthScore).toBeGreaterThanOrEqual(0);
        expect(file.healthScore).toBeLessThanOrEqual(100);
        expect(Array.isArray(file.functions)).toBe(true);
        expect(Array.isArray(file.issues)).toBe(true);
      });

      // Le fichier normal devrait avoir au moins une fonction/variable
      const normalFile = result.details.find(d => d.file.includes('normal.ts'));
      expect(normalFile).toBeDefined();
    });

    it('handles files with unusual but valid TypeScript constructs', async () => {
      const advancedProject = {
        'src/advanced.ts': `
          // Generics avec contraintes complexes
          interface Repository<T extends { id: string | number }> {
            findById<K extends keyof T>(id: T['id']): Promise<Pick<T, K> | null>;
          }
          
          // Types conditionnels
          type ApiResponse<T> = T extends string 
            ? { message: T } 
            : T extends number 
            ? { code: T } 
            : { data: T };
          
          // Fonction avec types d'union complexes
          function processValue<T extends string | number | object>(
            value: T
          ): T extends string 
            ? string 
            : T extends number 
            ? number 
            : object {
            if (typeof value === 'string') {
              return value.toUpperCase() as any;
            }
            if (typeof value === 'number') {
              return (value * 2) as any;
            }
            return { ...value } as any;
          }
          
          // Classes avec décorateurs (simulés)
          class UserService {
            @deprecated('Use getUserById instead')
            getUser(id: string) {
              return this.getUserById(id);
            }
            
            getUserById(id: string) {
              return { id, name: 'User' };
            }
          }
          
          function deprecated(message: string) {
            return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
              console.warn(\`\${propertyName} is deprecated: \${message}\`);
            };
          }
        `
      };

      createProjectStructure(tempDir, advancedProject);

      const result = await analyze(tempDir, {
        format: 'json',
        projectPath: tempDir
      });

      expect(result.details.length).toBe(1);
      
      const file = result.details[0];
      expect(file.functions.length).toBeGreaterThan(0);
      
      // Devrait identifier plusieurs fonctions/méthodes
      const functionNames = file.functions.map(f => f.name);
      expect(functionNames).toContain('processValue');
      expect(functionNames.some(name => name.includes('getUser'))).toBe(true);
    });
  });

  describe('Quick Wins Analysis', () => {
    it('identifies actionable quick wins', async () => {
      const quickWinsProject = {
        'src/issues.ts': `
          // Fonction avec des problèmes évidents pour Quick Wins
          function veryLongFunctionNameThatCouldBeShortened(
            parameterWithVeryLongName: string,
            anotherParameterWithLongName: number,
            yetAnotherParameter: boolean,
            andOneMore: string,
            finalParameter: object
          ) {
            if (parameterWithVeryLongName) {
              if (anotherParameterWithLongName > 0) {
                if (yetAnotherParameter) {
                  if (andOneMore.length > 0) {
                    if (finalParameter) {
                      console.log('Deeply nested');
                      for (let i = 0; i < anotherParameterWithLongName; i++) {
                        for (let j = 0; j < 10; j++) {
                          if (i * j > 100) {
                            return i * j;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            return 0;
          }
          
          // Fonction générique mal nommée
          function func(data: any) {
            return data;
          }
          
          // Duplication évidente
          function processUserData(user: any) {
            if (!user) return null;
            const name = user.name || 'Unknown';
            const email = user.email || '';
            return { name, email, processed: true };
          }
          
          function processCustomerData(customer: any) {
            if (!customer) return null;
            const name = customer.name || 'Unknown';
            const email = customer.email || '';
            return { name, email, processed: true };
          }
        `
      };

      createProjectStructure(tempDir, quickWinsProject);

      const result = await analyze(tempDir, {
        format: 'json',
        projectPath: tempDir,
        includeQuickWins: true
      });

      expect(result.quickWinsAnalysis).toBeDefined();
      expect(typeof result.quickWinsAnalysis).toBe('object');

      // Devrait avoir identifié des quick wins
      expect(result.quickWinsAnalysis!.quickWins.length).toBeGreaterThan(0);

      // Chaque quick win devrait avoir une structure valide
      result.quickWinsAnalysis!.quickWins.forEach(qw => {
        expect(qw.type).toBeDefined();
        expect(qw.file).toBeDefined();
        expect(qw.action).toBeDefined();
      });
    });
  });

  // Helper function
  function createProjectStructure(basePath: string, files: Record<string, string>) {
    Object.entries(files).forEach(([filePath, content]) => {
      const fullPath = path.join(basePath, filePath);
      const dir = path.dirname(fullPath);
      
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(fullPath, content, 'utf8');
    });
  }
});