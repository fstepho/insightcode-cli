import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { analyze } from '../../src/analyzer';

describe('Scoring Debug - Diagnostic des scores', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(tmpdir(), 'scoring-debug-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('diagnostique les scores pour différents niveaux de qualité', async () => {
    const projects = {
      // Projet de qualité moyenne avec des problèmes évidents
      'medium-quality': {
        'src/user-service.ts': `
          export function processUserData(user: any) {
            if (!user) {
              console.log('No user provided');
              return null;
            }
            const name = user.name || 'Unknown User';
            const email = user.email || 'no-email@example.com';
            const result = { name: name.trim(), email, processed: true };
            console.log('User processed successfully');
            return result;
          }
        `,
        'src/customer-service.ts': `
          export function processCustomerData(customer: any) {
            if (!customer) {
              console.log('No customer provided');
              return null;
            }
            const name = customer.name || 'Unknown Customer';
            const email = customer.email || 'no-email@example.com';
            const result = { name: name.trim(), email, processed: true };
            console.log('Customer processed successfully');
            return result;
          }
        `,
        'src/average-code.ts': `
          export function processData(data: any) {
            if (!data) return null;
            
            let result = [];
            for (let i = 0; i < data.length; i++) {
              if (data[i].active) {
                if (data[i].type === 'user') {
                  result.push(data[i]);
                } else if (data[i].type === 'admin') {
                  result.push(data[i]);
                }
              }
            }
            
            console.log('Processed items:', result.length);
            return result;
          }

          export function calc(x: any, y: any, op: string) {
            if (op === '+') return x + y;
            if (op === '-') return x - y;
            if (op === '*') return x * y;
            if (op === '/') return x / y;
            return 0;
          }

          export function calc(x: any, y: any, op: string) {
            if (op === '+') return x + y;
            if (op === '-') return x - y;
            if (op === '*') return x * y;
            if (op === '/') return x / y;
            return 0;
          }
        `
      },
      
      // Projet de faible qualité avec de nombreux problèmes
      'low-quality': {
        'src/data-a.ts': `
          export function processDataA(p: any) {
            if (!p) return null;
            console.log('Starting data processing...');
            const value = p.value || 0;
            const type = p.type || 'default';
            const category = p.category || 'general';
            const result = { value, type, category, processed: true };
            console.log('Data processing completed');
            return result;
          }
        `,
        'src/data-b.ts': `
          export function processDataB(p: any) {
            if (!p) return null;
            console.log('Starting data processing...');
            const value = p.value || 0;
            const type = p.type || 'default';
            const category = p.category || 'general';
            const result = { value, type, category, processed: true };
            console.log('Data processing completed');
            return result;
          }
        `,
        'src/data-c.ts': `
          export function processDataC(p: any) {
            if (!p) return null;
            console.log('Starting data processing...');
            const value = p.value || 0;
            const type = p.type || 'default';
            const category = p.category || 'general';
            const result = { value, type, category, processed: true };
            console.log('Data processing completed');
            return result;
          }
        `,
        'src/massive-god-class.ts': `
          let globalData = [];
          let globalTemp;
          let globalFlag = false;
          let globalCounter = 0;
          let globalState = {};
          let globalConfig = {};
          let globalCache = new Map();
          let globalEvents = [];
          let globalErrors = [];
          let globalMetrics = {};
          let globalHandlers = {};
          let globalValidators = {};
          let globalTransformers = {};
          let globalFilters = {};
          let globalSorters = {};
          let globalFormatters = {};
          let globalParsers = {};
          let globalSerializers = {};
          let globalDeserializers = {};
          let globalEncoders = {};
          
          // Fonction complexe avec deep nesting (≥8 niveaux)
          export function deepNestedFunction(x: any) {
            if (x) {
              if (x.a) {
                if (x.a.b) {
                  if (x.a.b.c) {
                    if (x.a.b.c.d) {
                      if (x.a.b.c.d.e) {
                        if (x.a.b.c.d.e.f) {
                          if (x.a.b.c.d.e.f.g) {
                            if (x.a.b.c.d.e.f.g.h) {
                              console.log('extremely deep nesting');
                              return x.a.b.c.d.e.f.g.h;
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            return null;
          }

          export function massiveComplexFunction(d: any) {
            console.log('starting massive processing');
            globalTemp = Math.random();
            globalCounter++;
            
            if (globalTemp > 0.8) {
              if (d && d.type === 'complex') {
                if (d.data && Array.isArray(d.data)) {
                  if (d.data.length > 100) {
                    for (let i = 0; i < d.data.length; i++) {
                      for (let j = 0; j < d.data.length; j++) {
                        for (let k = 0; k < d.data.length; k++) {
                          if (i !== j && j !== k && i !== k) {
                            if (d.data[i] === d.data[j] || d.data[j] === d.data[k]) {
                              globalFlag = true;
                              globalErrors.push('Duplicate found');
                              if (globalFlag && globalCounter > 10) {
                                if (globalErrors.length > 5) {
                                  console.error('Too many errors');
                                  return false;
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  } else if (d.data.length > 50) {
                    // Another complex branch
                    for (let item of d.data) {
                      if (item && typeof item === 'object') {
                        if (item.id && item.name && item.value) {
                          globalCache.set(item.id, item);
                          globalState[item.id] = item.value;
                          if (item.events) {
                            globalEvents.push(...item.events);
                          }
                        }
                      }
                    }
                  }
                }
              } else if (d && d.type === 'simple') {
                // Yet another branch with complexity
                if (d.operations) {
                  for (let op of d.operations) {
                    switch (op.type) {
                      case 'transform':
                        if (globalTransformers[op.name]) {
                          globalTransformers[op.name](op.data);
                        }
                        break;
                      case 'filter':
                        if (globalFilters[op.name]) {
                          globalFilters[op.name](op.criteria);
                        }
                        break;
                      case 'sort':
                        if (globalSorters[op.name]) {
                          globalSorters[op.name](op.field, op.direction);
                        }
                        break;
                      case 'format':
                        if (globalFormatters[op.name]) {
                          globalFormatters[op.name](op.template);
                        }
                        break;
                      default:
                        console.warn('Unknown operation:', op.type);
                    }
                  }
                }
              }
            } else if (globalTemp > 0.5) {
              // More complexity branches
              if (d && d.metadata) {
                for (let key in d.metadata) {
                  if (d.metadata.hasOwnProperty(key)) {
                    if (key.startsWith('config_')) {
                      globalConfig[key] = d.metadata[key];
                    } else if (key.startsWith('metric_')) {
                      globalMetrics[key] = d.metadata[key];
                    } else if (key.startsWith('handler_')) {
                      globalHandlers[key] = d.metadata[key];
                    }
                  }
                }
              }
            }
            
            console.log('massive processing completed');
            globalCounter--;
            return globalFlag;
          }

          // Fonction 1 - Duplicate business logic
          export function validateUserDataV1(userData: any) {
            if (!userData) return false;
            if (!userData.email || userData.email.length < 5) return false;
            if (!userData.name || userData.name.length < 2) return false;
            if (!userData.age || userData.age < 18 || userData.age > 120) return false;
            if (!userData.role || !['admin', 'user', 'moderator'].includes(userData.role)) return false;
            console.log('User validation v1 passed');
            return true;
          }

          // Fonction 2 - Duplicate business logic
          export function validateCustomerDataV1(customerData: any) {
            if (!customerData) return false;
            if (!customerData.email || customerData.email.length < 5) return false;
            if (!customerData.name || customerData.name.length < 2) return false;
            if (!customerData.age || customerData.age < 18 || customerData.age > 120) return false;
            if (!customerData.role || !['admin', 'user', 'moderator'].includes(customerData.role)) return false;
            console.log('Customer validation v1 passed');
            return true;
          }

          // Fonction 3 - More duplicate logic
          export function processPaymentDataV1(paymentData: any) {
            if (!paymentData) return false;
            if (!paymentData.amount || paymentData.amount <= 0) return false;
            if (!paymentData.currency || paymentData.currency.length !== 3) return false;
            if (!paymentData.method || !['card', 'paypal', 'bank'].includes(paymentData.method)) return false;
            console.log('Payment validation v1 passed');
            return true;
          }

          // Function 4 - Poor naming and more complexity
          export function a(b: any, c: any, d: any, e: any, f: any, g: any) {
            let x = b + c;
            let y = d * e;
            let z = f / g;
            
            if (x > 10) {
              if (y < 5) {
                if (z > 1) {
                  for (let i = 0; i < x; i++) {
                    for (let j = 0; j < y; j++) {
                      for (let k = 0; k < z; k++) {
                        console.log(i, j, k);
                        if (i * j * k > 100) {
                          return i * j * k;
                        }
                      }
                    }
                  }
                }
              }
            }
            return x + y + z;
          }

          // Function 5 - More poor naming
          export function doStuff(param1: any, param2: any, param3: any) {
            let result = param1;
            if (param2) {
              if (param2.active) {
                if (param2.settings) {
                  if (param2.settings.advanced) {
                    result = param2.settings.advanced.value || param1;
                  }
                }
              }
            }
            if (param3) {
              result = result + param3.modifier;
            }
            return result;
          }

          // Function 6 - Generic name
          export function process(input: any) {
            return input ? input.toString().toUpperCase() : '';
          }

          // Function 7 - Single letter
          export function fn(p: any) {
            return p + 1;
          }

          // Function 8 - Too long name
          export function thisIsAnExtremelyLongFunctionNameThatDoesNotNeedToBeSoLongAndCouldBeSimplifiedSignificantly(
            parameterWithAnExtremelyLongNameThatIsNotNecessary: any
          ) {
            return parameterWithAnExtremelyLongNameThatIsNotNecessary;
          }

          // Function 9 - More complexity
          export function handleComplexWorkflow(workflow: any) {
            if (workflow && workflow.steps) {
              for (let step of workflow.steps) {
                if (step.type === 'conditional') {
                  if (step.condition) {
                    if (step.condition.operator === 'equals') {
                      if (step.condition.left === step.condition.right) {
                        if (step.actions) {
                          for (let action of step.actions) {
                            if (action.type === 'call') {
                              console.log('Calling:', action.target);
                            } else if (action.type === 'set') {
                              console.log('Setting:', action.variable, '=', action.value);
                            }
                          }
                        }
                      }
                    } else if (step.condition.operator === 'greater') {
                      // More nested logic...
                      console.log('Greater than condition');
                    }
                  }
                } else if (step.type === 'loop') {
                  if (step.iterations && step.iterations > 0) {
                    for (let i = 0; i < step.iterations; i++) {
                      console.log('Loop iteration:', i);
                    }
                  }
                }
              }
            }
            return workflow;
          }

          // Function 10 - Final complex function
          export function megaComplexProcessor(data: any, options: any, callbacks: any) {
            if (!data || !options) return null;
            
            let processed = 0;
            let errors = 0;
            let warnings = 0;
            
            try {
              if (Array.isArray(data)) {
                for (let i = 0; i < data.length; i++) {
                  try {
                    let item = data[i];
                    if (item && typeof item === 'object') {
                      if (options.validate) {
                        if (!item.id || !item.name) {
                          warnings++;
                          if (callbacks && callbacks.onWarning) {
                            callbacks.onWarning('Missing required fields', item);
                          }
                        }
                      }
                      
                      if (options.transform) {
                        for (let transform of options.transform) {
                          if (transform.type === 'uppercase') {
                            if (item[transform.field]) {
                              item[transform.field] = item[transform.field].toString().toUpperCase();
                            }
                          } else if (transform.type === 'lowercase') {
                            if (item[transform.field]) {
                              item[transform.field] = item[transform.field].toString().toLowerCase();
                            }
                          } else if (transform.type === 'number') {
                            if (item[transform.field]) {
                              item[transform.field] = parseFloat(item[transform.field]);
                              if (isNaN(item[transform.field])) {
                                errors++;
                                if (callbacks && callbacks.onError) {
                                  callbacks.onError('Invalid number conversion', item);
                                }
                              }
                            }
                          }
                        }
                      }
                      
                      processed++;
                    }
                  } catch (itemError) {
                    errors++;
                    if (callbacks && callbacks.onError) {
                      callbacks.onError(itemError, data[i]);
                    }
                  }
                }
              }
            } catch (globalError) {
              errors++;
              if (callbacks && callbacks.onError) {
                callbacks.onError(globalError, data);
              }
            }
            
            return { processed, errors, warnings, data };
          }
        `
      }
    };

    const results: Record<string, any> = {};

    for (const [quality, files] of Object.entries(projects)) {
      const projectDir = fs.mkdtempSync(path.join(tmpdir(), `${quality}-`));
      createProjectStructure(projectDir, files);
      
      results[quality] = await analyze(projectDir, {
        format: 'json',
        projectPath: projectDir
      });
      
      fs.rmSync(projectDir, { recursive: true, force: true });
    }

    console.log('\n=== DIAGNOSTIC DES SCORES ===');
    
    for (const [quality, result] of Object.entries(results)) {
      console.log(`\n${quality.toUpperCase()}:`);
      console.log(`  Score global: ${result.overview.scores.overall}`);
      console.log(`  Score complexité: ${result.overview.scores.complexity}`);
      console.log(`  Score duplication: ${result.overview.scores.duplication}`);
      console.log(`  Score maintenabilité: ${result.overview.scores.maintainability}`);
      
      const file = result.details[0];
      console.log(`  Fichier healthScore: ${file.healthScore}`);
      console.log(`  Fichier complexité: ${file.metrics.complexity}`);
      console.log(`  Fichier LOC: ${file.metrics.loc}`);
      console.log(`  Fichier duplication: ${file.metrics.duplicationRatio}`);
      console.log(`  Nombre d'issues fichier: ${file.issues.length}`);
      console.log(`  Nombre de fonctions: ${file.functions.length}`);
      console.log(`  Cohesion: ${file.dependencies.cohesionScore}`);
      console.log(`  Instabilité: ${file.dependencies.instability}`);
      console.log(`  Deps entrantes: ${file.dependencies.incomingDependencies}`);
      console.log(`  Deps sortantes: ${file.dependencies.outgoingDependencies}`);
      
      const totalFunctionIssues = file.functions.flatMap(f => f.issues || []).length;
      console.log(`  Total function issues: ${totalFunctionIssues}`);
    }

    // Test basique pour passer
    expect(results['medium-quality']).toBeDefined();
    expect(results['low-quality']).toBeDefined();
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