# Scripts

Utility scripts for InsightCode development and quality assurance.

## 🧪 **Quality Assurance Scripts**

### `validate-docs.js` ⭐⭐
**Comprehensive documentation validation and generation**
```bash
# Validate all documentation examples
npm run validate-docs

# Generate documentation tables
npm run generate-docs
```
- 📖 **Parses markdown files** (FILE_HEALTH_SCORE_METHODOLOGY.md, SCORING_ARCHITECTURE.md, etc.)
- 🔍 **Extracts ALL numerical examples** automatically using 10 regex patterns
- ✅ **Validates against real code** (calculateFileComplexityScore, calculateFileHealthScore, etc.)
- 🚨 **Detects inconsistencies** without relying on hardcoded test values
- 📊 **Generates documentation tables** with research basis and formulas
- 🔄 **Anti-regression** : Prevents future discrepancies between documentation and implementation
- **Patterns detected**: Complexity scores, penalties, formulas, file health scores, mappings, duplication, weights, thresholds

### `validate.js`
**Live code testing and accuracy measurement**
```bash
node scripts/validate.js
```
- 🧪 Tests scoring functions with real temporary files
- 📊 Accuracy measurement against known cases
- ✅ Validates scoring implementation with own codebase

### `validate-coefficients.js`
**Mathematical coefficient analysis**
```bash
npm run validate-coefficients
```
- 🧮 Analysis of mathematical coefficients and powers
- 📋 Research basis validation for scoring formulas
- 🎯 Expert judgment mapping verification

### `validate-power-coefficients.js`
**Empirical coefficient optimization**
```bash
npm run validate-powers
```
- 🔬 Systematic power coefficient testing
- 📈 Empirical validation methodology
- 🎯 Expert review task generation

## 🔧 **Utility Scripts**

### `test-duplication-modes.js`
**Test different duplication detection modes**
```bash
npm run test:duplication-modes
```
- 🔍 Tests various duplication detection strategies
- 📊 Performance comparison between modes

### `discover-rules.js`
**Discover linting and quality rules**
```bash
node scripts/discover-rules.js
```
- 🔍 Discovers applicable linting rules for the project
- 📋 Generates rule configuration recommendations

### `install-git-ai.sh`
**Install git AI helper**
```bash
./scripts/install-git-ai.sh
```
- 🤖 Installs AI-powered git commit message helper
- 🔧 Sets up development environment enhancements

## 🎯 **Usage Recommandé**

### Workflow de développement :
1. **Avant modification** : `npm run validate-docs`
2. **Après modification** : `npm run validate-docs` + `npm test`
3. **Mise à jour docs** : `npm run generate-docs`

### Intégration continue :
```bash
npm run qa  # Includes build, test, and validate-docs
```

### Validation complète avant release :
```bash
npm run qa && npm run validate-coefficients && npm run validate-powers
```