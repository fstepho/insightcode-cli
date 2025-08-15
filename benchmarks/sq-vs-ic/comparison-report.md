# InsightCode vs SonarQube Comparison Report

**Date:** Fri Aug 15 12:10:42 CEST 2025
**Duration:** 132s

## Tool Versions & Configuration
| Tool | Version | Configuration |
|------|---------|---------------|
| InsightCode | 0.8.0 | Production mode, strict duplication detection |
| SonarScanner | SonarScanner 4.3.0 | Default configuration with JS/TS rules |
| jq | jq-1.8.1 | JSON processing |
| curl | curl 8.7.1 (x86_64-apple-darwin24.0) libcurl/8.7.1 (SecureTransport) LibreSSL/3.3.6 zlib/1.2.12 nghttp2/1.64.0 | API communication |

### Analysis Configuration Details
- **InsightCode**: `--production --format=json --strict-duplication --exclude [patterns]`
- **SonarQube**: `sonar.exclusions=[patterns]` in project properties
- **Source Alignment**: Both tools analyze identical source directories
- **Harmonized Exclusions**: 20 identical exclusion patterns applied to both tools

## Success Rate
| Tool | Success | Failures | Success Rate |
|------|---------|----------|--------------|
| InsightCode | 9 | 0 | 100% |
| SonarQube   | 0 | 9 | 0% |

## Project Summary
| Project | IC Grade | IC Overall Score | IC Files | IC LOC | IC Total Complexity | IC Complexity/KLOC | SQ Grade* | SQ Files | SQ LOC | SQ Total Complexity | SQ Complexity/KLOC | IC Time | SQ Time | Duplication (IC/SQ) |
|---------|----------|------------------|----------|--------|---------------------|-------------------|-----------|----------|--------|---------------------|-------------------|---------|---------|---------------------|
| chalk | C | 75 | 3 | 345 | 44.01 | 146.7 | A | 3 | 345 | 50 | 166.6 | 515ms | 4673ms | 0% / 0.0% |
| express | B | 82 | 6 | 1144 | 51.0 | 46.3 | A | 6 | 1138 | 332 | 301.8 | 642ms | 5459ms | 0% / 0.0% |
| uuid | B | 86 | 27 | 890 | 132.03 | 165.0 | A | 27 | 889 | 139 | 173.7 | 632ms | 5427ms | 0.04% / 0.0% |
| lodash | A | 91 | 12 | 490 | 45.96 | 114.9 | A | 12 | 490 | 76 | 190.0 | 539ms | 5023ms | 0.01% / 0.0% |
| eslint | C | 72 | 378 | 61690 | 11453.4 | 185.9 | A | 389 | 63129 | 13816 | 218.9 | 4537ms | 16902ms | 0.04% / 4.1% |
| jest | C | 76 | 386 | 44962 | 6774.30 | 150.8 | A | 393 | 44608 | 8392 | 188.1 | 3991ms | 33609ms | 0.02% / 1.9% |
| vue | D | 63 | 246 | 43913 | 8526.36 | 194.2 | A | 259 | 44529 | 10304 | 231.5 | 3631ms | 17778ms | 0.01% / 0.5% |
| angular | C | 73 | 1724 | 202483 | 35152.36 | 173.6 | A | 1869 | 209499 | 43162 | 206.1 | 22283ms | 94317ms | 0.03% / 1.9% |
| typescript | D | 69 | 597 | 337971 | 61317.87 | 181.4 | A | 599 | 263234 | 60970 | 231.6 | 92481ms | 82940ms | 0.02% / 5.8% |

*SQ Grade = Maintainability Rating only (sqale_rating), not a composite quality score

## LOC Discrepancy Deep Dive
| Project | Sources Dir | IC All Files | IC JS Files | SQ All Files | SQ JS Files | IC LOC | SQ LOC | LOC Diff | % Diff | Issue Type |
|---------|-------------|--------------|-------------|--------------|-------------|--------|--------|----------|--------|------------|
| chalk | ✅ source |        6 |        3 |        6 |        3 | 345 | 345 | 0 | 0% | 🟢 Minor difference (<5%) |
| express | ✅ lib |        6 |        6 |        6 |        6 | 1144 | 1138 | 6 | .5% | 🟢 Minor difference (<5%) |
| uuid | ✅ src |       38 |       27 |       38 |       27 | 890 | 889 | 1 | .1% | 🟢 Minor difference (<5%) |
| lodash | ✅ lib |       12 |       12 |       12 |       12 | 490 | 490 | 0 | 0% | 🟢 Minor difference (<5%) |
| eslint | ✅ lib |      389 |      389 |      389 |      389 | 61690 | 63129 | -1439 | -2.2% | 🟡 Significant LOC difference |
| jest | ✅ packages |      746 |      386 |      746 |      386 | 44962 | 44608 | 354 | .7% | 🟠 Moderate LOC difference |
| vue | ✅ packages |      455 |      252 |      455 |      252 | 43913 | 44529 | -616 | -1.3% | 🟠 Moderate LOC difference |
| angular | ✅ packages |     4283 |     1862 |     4283 |     1862 | 202483 | 209499 | -7016 | -3.3% | 🟡 Significant LOC difference |
| typescript | ✅ src |      600 |      600 |      600 |      600 | 337971 | 263234 | 74737 | 28.3% | 🔴 Major LOC counting difference |

## Comparative Metrics Analysis

⚠️ **Scoring Incompatibility Notice**
- **InsightCode**: Holistic architectural quality (0-100 scale, composite score)
- **SonarQube**: No native overall score; grades shown are Maintainability Rating only
- SonarQube has 3 separate ratings: Reliability, Security, Maintainability (each A-E)
- Use relative metrics (/KLOC) for meaningful cross-tool analysis

| Project | IC Overall | SQ Bugs/KLOC | SQ Smells/KLOC | SQ Complexity/KLOC | SQ Debt/KLOC |
|---------|------------|--------------|----------------|-------------------|---------------|
| chalk | 75 | 0 | 20.2 | 144.9 | 107.2 min |
| express | 82 | 0 | 215.2 | 291.7 | 1147.6 min |
| uuid | 86 | 0 | 34.8 | 156.3 | 179.9 min |
| lodash | 91 | 2.0 | 4.0 | 155.1 | 20.4 min |
| eslint | 72 | 0 | 4.8 | 218.8 | 48.6 min |
| jest | 76 | .5 | 16.4 | 188.1 | 108.6 min |
| vue | 63 | 1.2 | 25.7 | 231.3 | 234.4 min |
| angular | 73 | .3 | 28.5 | 206.0 | 201.2 min |
| typescript | 69 | .2 | 24.8 | 231.6 | 187.0 min |

## Performance Summary
| Tool | Avg Analysis Time | Total Files Analyzed | Avg Files/Second |
|------|------------------|---------------------|------------------|
| InsightCode | 14361ms | 3379 | 26.1 |
| SonarQube | 29569ms | 3557 | 13.3 |

## Notes
- **Complexity/KLOC**: Normalized complexity metric per 1000 lines of code for better comparison
- **InsightCode**: Shows total complexity (avgComplexity × totalFiles) for direct comparison
  - Configuration: Production mode with strict duplication detection
  - Mode: `--production --format=json --strict-duplication`
  - Scoring: Uses native overall score (0-100) from analysis results
- **SonarQube**: Uses total complexity, normalized by lines of code
  - Version: SonarScanner 4.3.0
  - Default JavaScript/TypeScript quality profile
  - Metrics: Raw compliance metrics (bugs, smells, debt) normalized per KLOC
- **Analysis Time**: Includes setup, scanning, intelligent polling, and result processing time
- **Duplication Detection**: Different algorithms - InsightCode uses strict mode, SonarQube uses default
- **LOC Calculation**: May vary depending on exclusion rules and language detection
- **Grading Criteria**: Not equivalent between tools (different scales and weightings)
- **Exclusions**: Both tools exclude test files, node_modules, dist, coverage directories

## LOC Discrepancy Analysis & Debugging Files

**Generated debugging files for each project (in details/ directory):**
- `details/{project}-insightcode-all-js-files.txt`: All JS/TS files found by InsightCode
- `details/{project}-sonarqube-all-js-files.txt`: All JS/TS files found by SonarQube
- `details/{project}-insightcode-filtered-files.txt`: Files after exclusion filtering (IC)
- `details/{project}-sonarqube-filtered-files.txt`: Files after exclusion filtering (SQ)
- `details/{project}-insightcode-error.log`: InsightCode analysis error output (if any)
- `details/{project}-sonarqube-scanner.log`: SonarQube scanner complete output and warnings

**Major LOC differences detected - possible causes:**
1. **Different source directories**: Check if both tools analyze the same base path
2. **File discovery logic**: Different algorithms for finding JS/TS files
3. **Exclusion effectiveness**: Patterns may work differently between tools
4. **Generated files**: .d.ts, .map files included/excluded differently
5. **Language detection**: Different criteria for counting TypeScript vs JavaScript
6. **Comment/blank line counting**: Different LOC calculation methodologies
7. **Symlinks/duplicates**: Different handling of linked or duplicated files

## Methodology Comparison

### InsightCode (Holistic Architecture Analysis)
- **Overall Score**: Native metric from analysis results (0-100)
- **Components**: Weighted combination of complexity, duplication, and maintainability
- **Grade Mapping**: A=90-100, B=80-89, C=70-79, D=60-69, F=0-59
- **Focus**: Architectural quality and code structure

### SonarQube (Rule Compliance Metrics)
- **Bugs/KLOC**: Number of reliability issues per 1000 lines of code
- **Code Smells/KLOC**: Maintainability issues per 1000 lines of code
- **Complexity/KLOC**: Cyclomatic complexity per 1000 lines of code
- **Technical Debt/KLOC**: Estimated time to fix issues (minutes per 1000 lines)
- **Focus**: Rule adherence and immediate code quality issues

### Why Scores Are Not Directly Comparable
- **Different Philosophies**: IC measures architectural health vs SQ measures rule compliance
- **Different Scales**: IC uses composite 0-100 scale vs SQ uses individual metrics
- **Different Priorities**: IC focuses on maintainability vs SQ focuses on defect prevention

## Complexity Comparison Methodology
**InsightCode Total Complexity** = avgComplexity × totalFiles
**SonarQube Total Complexity** = Direct total from API

This provides a fair comparison since both represent the total cyclomatic complexity of the analyzed codebase.

## SonarQube Analysis Reliability Improvements

**Intelligent Analysis Polling:**
- Replaces fixed 15-second wait with dynamic task status monitoring
- Uses `/api/ce/component` API to track analysis completion
- Adaptive timeouts: 10min (standard), 20min (angular/typescript/eslint)
- Robust error handling with automatic retry mechanism

**Recommended actions:**
- Review the 'LOC Analysis & Path Debugging' table above
- Verify that both tools analyze the same source directories
- Consider aligning source paths for more accurate comparison
