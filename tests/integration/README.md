# Tests d'Intégration InsightCode CLI

## Objectifs Anti-Biais de Confirmation

Ces tests d'intégration sont conçus pour **éviter les biais de confirmation** en testant:

### ✅ Ce qu'ils testent (objectivement)
- **Vrais flux end-to-end** du CLI vers l'output final
- **Projets réels** avec structures variées (React, Node.js, parsers complexes)
- **Cas d'échec attendus** (permissions, fichiers corrompus, liens circulaires)
- **Limites de performance** (mémoire, temps, taille de projet)
- **Cohérence** entre multiple exécutions
- **Formats de sortie** valides selon leurs spécifications

### ❌ Ce qu'ils évitent (biais)
- Assertions sur des **scores spécifiques** ("doit être 85/100")
- Tests qui **confirment le comportement actuel** sans validité objective
- **Cherry-picking** de cas qui marchent bien
- Ignorance des **cas d'échec** ou **edge cases**
- Tests qui **supposent** ce que l'outil devrait trouver

## Structure des Tests

### `cli.integration.test.ts`
Tests des flux CLI complets:
- Formats de sortie (JSON, CI, Summary, Markdown)
- Options et flags (--production, --exclude, --strict-duplication)
- Gestion des arguments invalides
- Performance sur projets de taille variable

### `analyzer.integration.test.ts`  
Tests de l'analyseur sur vrais projets:
- Projets React avec hooks et composants
- Backend Node.js avec services et repositories
- Cohérence entre multiple analyses
- Gestion des erreurs TypeScript

### `failure-scenarios.integration.test.ts`
Tests spécifiquement pour les **cas d'échec**:
- Répertoires inaccessibles
- Liens symboliques circulaires
- Fichiers avec syntaxe cassée
- Limites de ressources (mémoire, profondeur)
- Prévention des faux positifs

## Principes de Validation

### 1. **Validation Structurelle** (pas de contenu)
```typescript
// ✅ Bon
expect(result.overview).toBeDefined();
expect(Array.isArray(result.details)).toBe(true);

// ❌ Biais
expect(result.overview.scores.overall).toBe(87);
```

### 2. **Cohérence Inter-Exécutions**
```typescript
// ✅ Bon  
const [run1, run2] = await Promise.all([analyze(...), analyze(...)]);
expect(run1.overview.scores.overall).toBe(run2.overview.scores.overall);
```

### 3. **Tests de Robustesse**
```typescript  
// ✅ Bon
expect(() => JSON.parse(result.stdout)).not.toThrow();
expect(result.exitCode).toBeGreaterThanOrEqual(0);
```

### 4. **Validation des Limites**
```typescript
// ✅ Bon
expect(duration).toBeLessThan(30000); // Pas de timeout
expect(memoryIncrease).toBeLessThan(500 * 1024 * 1024); // Pas de fuite mémoire
```

## Exécution

```bash
# Tests d'intégration uniquement
npm test -- tests/integration/

# Avec timeout étendu pour les gros projets
npm test -- tests/integration/ --testTimeout=60000
```

## Critères de Succès

Un test d'intégration réussi signifie:
1. **Pas de crash** sur inputs valides
2. **Gestion gracieuse** des erreurs
3. **Outputs cohérents** entre exécutions
4. **Performance acceptable** (temps/mémoire)
5. **Formats valides** selon spécifications

Il ne signifie **PAS** que l'outil détecte exactement ce qu'on pense qu'il devrait détecter.