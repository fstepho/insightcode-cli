# Scripts

Utility scripts for InsightCode development and quality assurance.

## 🧪 **Quality Assurance Scripts**

### `doc-test-and-generate.js` ⭐
**Test et génération automatique de la documentation**
```bash
npm run doc:test
```
- 🧪 **Validation critique** : Teste tous les exemples numériques mentionnés dans la documentation
- 📊 **Génération automatique** : Produit les tables de mapping exactes à partir du code
- 🔄 **Anti-régression** : Évite les écarts futurs entre documentation et implémentation
- ⚡ **Usage recommandé** : Avant chaque release pour garantir la cohérence

### `validate-markdown-examples.js` ⭐⭐
**NEW: Comprehensive markdown documentation validator**
```bash
npm run validate-docs
```
- 📖 **Parses markdown files** (HEALTH_SCORE_METHODOLOGY.md, SCORING_ARCHITECTURE.md, etc.)
- 🔍 **Extracts ALL numerical examples** automatically using regex patterns
- ✅ **Validates against real code** (calculateComplexityScore, calculateHealthScore, etc.)
- 🚨 **Detects inconsistencies** without relying on hardcoded test values
- **Patterns detected**: `Complexity X → Score Y`, formulas, health score tables, mapping tables

### `validate-documentation.js`
**LEGACY: Manual validation with hardcoded test cases**
```bash
node scripts/validate-documentation.js
```
- ✅ Vérifie tous les exemples numériques (complexity scores, health scores)
- ✅ Valide les formules mathématiques contre le code réel
- ✅ Détecte les incohérences documentation/implémentation
- ✅ Tests de non-régression automatiques

### `generate-numeric-examples.js`
**Génération automatique des exemples numériques**
```bash
node scripts/generate-numeric-examples.js
```
- 📊 Génère les tables de mapping complexité → score
- 📋 Produit les exemples de Health Score complets
- 🧮 Valide les formules mathématiques exactes
- 🔄 Évite les écarts futurs entre code et documentation

## 📈 **Benchmark Scripts**

### `benchmark.js`
**Analyse des projets populaires JS/TS**
```bash
node scripts/benchmark.js
```
- Analyse des projets open-source populaires
- Validation empirique des seuils de scoring
- Génération de rapports de comparaison

## 🎯 **Usage Recommandé**

### Workflow de développement :
1. **Avant modification** : `npm run validate-docs`
2. **Après modification** : `npm run validate-docs` + `npm test`
3. **Mise à jour docs** : `node scripts/generate-numeric-examples.js`

### Intégration continue :
```bash
npm run build && npm test && node scripts/validate-documentation.js
```

See [Benchmarks Documentation](../benchmarks/) for results and methodology.