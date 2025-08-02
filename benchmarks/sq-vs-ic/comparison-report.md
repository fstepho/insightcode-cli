# InsightCode vs SonarQube Comparison Report

**Date:** Sat Aug  2 22:49:50 CEST 2025
**Duration:** 344s

## Tool Versions & Configuration
| Tool | Version | Configuration |
|------|---------|---------------|
| InsightCode | 0.7.0 | Production mode, strict duplication detection |
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
| SonarQube   | 9 | 0 | 100% |

## Project Summary
| Project | IC Grade | IC Overall Score | IC Files | IC LOC | IC Total Complexity | IC Complexity/KLOC | SQ Grade* | SQ Files | SQ LOC | SQ Total Complexity | SQ Complexity/KLOC | IC Time | SQ Time | Duplication (IC/SQ) |
|---------|----------|------------------|----------|--------|---------------------|-------------------|-----------|----------|--------|---------------------|-------------------|---------|---------|---------------------|
| chalk | A | 92 | 3 | 345 | 38.01 | 126.7 | A | 3 | 345 | 50 | 166.6 | 352ms | 4673ms | 0% / 0.0% |
| express | A | 93 | 6 | 1144 | 51.0 | 46.3 | A | 6 | 1138 | 332 | 301.8 | 325ms | 5459ms | 0% / 0.0% |
| uuid | A | 96 | 27 | 889 | 132.03 | 165.0 | A | 27 | 889 | 139 | 173.7 | 357ms | 5427ms | 0.04% / 0.0% |
| lodash | A | 100 | 12 | 490 | 45.96 | 114.9 | A | 12 | 490 | 76 | 190.0 | 297ms | 5023ms | 0.01% / 0.0% |
| eslint | B | 83 | 378 | 61140 | 7930.44 | 129.7 | A | 389 | 63129 | 13816 | 218.9 | 3506ms | 16902ms | 0.04% / 4.1% |
| jest | B | 85 | 386 | 44591 | 6558.14 | 147.3 | A | 393 | 44608 | 8392 | 188.1 | 2878ms | 33609ms | 0.02% / 1.9% |
| vue | C | 75 | 246 | 43903 | 7749.0 | 176.5 | A | 259 | 44529 | 10304 | 231.5 | 2485ms | 17778ms | 0.01% / 0.5% |
| angular | B | 82 | 1724 | 200769 | 34773.08 | 173.2 | A | 1869 | 209499 | 43162 | 206.1 | 15633ms | 94317ms | 0.03% / 1.9% |
| typescript | C | 77 | 597 | 292081 | 64290.93 | 220.1 | A | 599 | 263234 | 60970 | 231.6 | 50981ms | 82940ms | 0.02% / 5.8% |

*SQ Grade = Maintainability Rating only (sqale_rating), not a composite quality score

## LOC Discrepancy Deep Dive
| Project | Sources Dir | IC All Files | IC JS Files | SQ All Files | SQ JS Files | IC LOC | SQ LOC | LOC Diff | % Diff | Issue Type |
|---------|-------------|--------------|-------------|--------------|-------------|--------|--------|----------|--------|------------|
| chalk | ✅ source |        6 |        3 |        6 |        3 | 345 | 345 | 0 | 0% | 🟢 Minor difference (<5%) |
| express | ✅ lib |        6 |        6 |        6 |        6 | 1144 | 1138 | 6 | .5% | 🟢 Minor difference (<5%) |
| uuid | ✅ src |       38 |       27 |       38 |       27 | 889 | 889 | 0 | 0% | 🟢 Minor difference (<5%) |
| lodash | ✅ lib |       12 |       12 |       12 |       12 | 490 | 490 | 0 | 0% | 🟢 Minor difference (<5%) |
| eslint | ✅ lib |      389 |      389 |      389 |      389 | 61140 | 63129 | -1989 | -3.1% | 🟡 Significant LOC difference |
| jest | ✅ packages |      746 |      386 |      746 |      386 | 44591 | 44608 | -17 | 0% | 🟢 Minor difference (<5%) |
| vue | ✅ packages |      455 |      252 |      455 |      252 | 43903 | 44529 | -626 | -1.4% | 🟠 Moderate LOC difference |
| angular | ✅ packages |     4283 |     1862 |     4283 |     1862 | 200769 | 209499 | -8730 | -4.1% | 🟡 Significant LOC difference |
| typescript | ✅ src |      600 |      600 |      600 |      600 | 292081 | 263234 | 28847 | 10.9% | 🔴 Major LOC counting difference |

## Comparative Metrics Analysis

⚠️ **Scoring Incompatibility Notice**
- **InsightCode**: Holistic architectural quality (0-100 scale, composite score)
- **SonarQube**: No native overall score; grades shown are Maintainability Rating only
- SonarQube has 3 separate ratings: Reliability, Security, Maintainability (each A-E)
- Use relative metrics (/KLOC) for meaningful cross-tool analysis

| Project | IC Overall | SQ Bugs/KLOC | SQ Smells/KLOC | SQ Complexity/KLOC | SQ Debt/KLOC |
|---------|------------|--------------|----------------|-------------------|---------------|
| chalk | 92 | 0 | 20.2 | 144.9 | 107.2 min |
| express | 93 | 0 | 215.2 | 291.7 | 1147.6 min |
| uuid | 96 | 0 | 34.8 | 156.3 | 179.9 min |
| lodash | 100 | 2.0 | 4.0 | 155.1 | 20.4 min |
| eslint | 83 | 0 | 4.8 | 218.8 | 48.6 min |
| jest | 85 | .5 | 16.4 | 188.1 | 108.6 min |
| vue | 75 | 1.2 | 25.7 | 231.3 | 234.4 min |
| angular | 82 | .3 | 28.5 | 206.0 | 201.2 min |
| typescript | 77 | .2 | 24.8 | 231.6 | 187.0 min |

## Performance Summary
| Tool | Avg Analysis Time | Total Files Analyzed | Avg Files/Second |
|------|------------------|---------------------|------------------|
| InsightCode | 8534ms | 3379 | 43.9 |
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
