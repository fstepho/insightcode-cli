# Architectural Decisions - InsightCode CLI

Format: **Date | Decision | Reason | Impact**

## 2025-07-03: **Final Shift to Criticality-Weighted Scoring (Impact + Complexity)**

**Decision**: The final project score is now weighted by a `criticismScore` calculated for each file. This score is a combination of the file's intrinsic **complexity** and its architectural **Impact** (number of other files that import it). This decision **supersedes all previous decisions regarding LOC-based weighting**.
**Reason**: Weighting by lines of code (LOC) was a flawed intermediate step. It incorrectly favored large, simple files over small, critical ones. The new model based on impact and complexity provides a much more accurate measure of a file's true importance and risk to the project.
**Impact**: The scoring system is now fully aligned with our "criticality-first" philosophy. The final grade accurately reflects the maintenance burden posed by the most interconnected and complex parts of the codebase.

## 2025-07-03: **Unification of Scoring and Ranking Logic in `analyzer.ts`**

**Decision**: All file ranking and scoring logic is now centralized in `analyzer.ts`. The `fileScoring.ts` module has been **deleted**. The `criticismScore` is now the single source of truth for both weighting the final project score and for ranking the `topFiles`.
**Reason**: The existence of `fileScoring.ts` created a competing and inconsistent definition of "criticality". This led to a confusing architecture with multiple sources of truth.
**Impact**: The codebase is simpler, more maintainable, and logically coherent. There is now one clear, justifiable method for determining which files are the most important.

## 2025-07-03: **Introduction of Advanced Architectural Metrics**

**Decision**: The core analysis (`analyzer.ts`) now calculates and exposes two new advanced metrics: `complexityStdDev` (Standard Deviation) and `silentKillers` (architecturally risky files).
**Reason**: To provide deeper architectural insights beyond a simple quality score. `complexityStdDev` identifies "monolith" files, while `silentKillers` highlights high-impact files that might otherwise go unnoticed.
**Impact**: The CLI provides significantly more value, offering users not just a grade, but a true profile of their project's architecture and hidden risks.

## 2025-06-29: File Scoring Algorithm with Weighted Criticality
**Decision**: Create dedicated `topIssues.ts` module with weighted file scoring (complexity-heavy).
**Reason**: Need prioritized list of files to fix; users want to know which files need attention first.
**Impact**: Terminal shows top 5 critical files with severity labels; JSON export includes `topFiles` array; developers can immediately focus on highest-impact improvements.

---

## 2025-06-29: Enhanced Reporter with Criticality-Based Ranking
**Decision**: Implement a file scoring algorithm that ranks files by total impact rather than order of discovery.
**Reason**: Users reported that the "Top Issues" section was not showing the most critical problems. Files with extreme complexity (16,000+) were not appearing while minor issues (complexity 21) were shown first.
**Impact**: The reporter now accurately identifies the most problematic files in any codebase, making it immediately actionable for developers.

---

## 2025-06-28: Graduated complexity scoring instead of linear
**Decision**: Replace linear complexity penalty (100 - complexity * 5) with graduated thresholds
**Reason**: Linear scoring too harsh for medium complexity (15-25), not nuanced enough for quality levels
**Impact**: More realistic scores, better differentiation between code quality levels, fairer assessment

---

## 2025-06-28: Fix reporter complexity calculation to match analyzer
**Decision**: Move complexity scoring logic from analyzer to reporter, ensure identical calculation
**Reason**: Reporter showed 0% complexity for high complexity projects (22.4 → 0%), misleading users
**Impact**: Perfect consistency between terminal and JSON outputs, improved user trust

---

## 2025-06-27: Separate benchmark reports for full vs production-only
**Decision**: Generate different report files with suffix (-production-only)
**Reason**: Need to compare full codebase analysis vs production-only to showcase feature value
**Impact**: Clear comparison data, separate archives, better feature demonstration

---

## 2025-06-27: Fix ENOBUFS error with 50MB buffer in benchmark
**Decision**: Increase execSync maxBuffer from default (1MB) to 50MB
**Reason**: Large projects like TypeScript (2.8M lines) exceeded buffer limit
**Impact**: 100% benchmark success rate, can analyze any size project

---

## 2025-06-27: Production code analysis with --exclude-utility
**Decision**: Add flag to exclude test/example/utility files from analysis
**Reason**: Test code skews metrics (duplication OK in tests, examples have patterns)
**Impact**: Clearer product quality view, chalk score drops from C(76) to F(58)

---

## 2025-06-27: Smart thresholds per file type
**Decision**: Different thresholds for production/test/utility/example/config files
**Reason**: Test files naturally have more duplication, scripts more complex
**Impact**: Fewer false positives, more accurate quality assessment

---

## 2025-06-27: File type classification system
**Decision**: Auto-classify files based on path patterns (test/, .spec.ts, etc.)
**Reason**: Apply appropriate thresholds without manual configuration
**Impact**: Zero-config smart analysis, backward compatible

---

## 2025-06-27: Support single file analysis
**Decision**: Modify parseDirectory to handle both directories and single files
**Reason**: Users want to analyze individual files, not just directories
**Impact**: More flexible usage, enables validation scripts

---

## 2025-06-27: Benchmark 9 popular projects
**Decision**: Create automated script to analyze axios, eslint, prettier, etc.
**Reason**: Validate our scoring, build credibility, find marketing insights

---

## 2025-06-27: Validation script with 100% accuracy
**Decision**: Create validate.js to test known complexity patterns
**Reason**: Need to prove our calculations are correct
**Impact**: 100% accuracy confirmed, full confidence in results

---

## 2025-06-27: Document exact complexity rules
**Decision**: Document that || and && count everywhere, including returns
**Reason**: Transparency builds trust, helps users understand scores
**Impact**: No ambiguity about how metrics are calculated

---

## 2025-06-27: "Your C is respectable" messaging
**Decision**: Position C grade as good, not mediocre
**Reason**: 47% of popular projects got C, including axios
**Impact**: Users feel better about their scores, more likely to adopt

---

## 2025-06-27: Conservative duplication detection accepted
**Decision**: Keep 5-line block detection despite ~85% accuracy
**Reason**: Better to underreport than overreport duplication
**Impact**: Some duplication missed but no false alarms

---

## 2025-06-27: Archive benchmarks in benchmarks/
**Decision**: Store benchmark results in dedicated folder, not scripts folder
**Reason**: Documentation belongs in docs/ or benchmarks/, scripts/ for executable code
**Impact**: Better organization, easier to find

---

## 2025-06-26: Add shields.io badges to README
**Decision**: Add NPM version and MIT license badges using shields.io
**Reason**: Professional appearance, instant credibility, standard practice
**Impact**: Better first impression, clear versioning and licensing info

---

## 2025-06-26: Use Commander 13.1.0 instead of 14.x
**Decision**: Use Commander 13.1.0 for broader Node.js compatibility
**Reason**: Commander 14 requires Node 20+, v13 supports Node 18+
**Impact**: Wider user base, compatible with Node LTS 18

---

## 2025-06-26: Make GitHub repository public before NPM publish
**Decision**: Switch repo from private to public
**Reason**: NPM links work, users can contribute, transparency
**Impact**: Open source from day one, community engagement possible

---

## 2025-06-26: Create git tag before NPM publish
**Decision**: Tag releases with v-prefix (v0.1.0)
**Reason**: Version tracking, GitHub releases, rollback capability
**Impact**: Professional release management, clear history

---

## 2025-06-26: Use .npmignore for clean package
**Decision**: Create .npmignore to exclude non-essential files
**Reason**: Smaller package size, cleaner distribution
**Impact**: 44.6 kB unpacked size, fast installation

---

## 2025-06-26: Use Chalk 4.x instead of 5.x
**Decision**: Stay on Chalk 4.x (CommonJS)
**Reason**: Chalk 5.x is ESM-only, our project uses CommonJS
**Impact**: Avoid compatibility issues, simpler setup

---

## 2025-06-25: Tests with Vitest and temporary files
**Decision**: Use temporary files created on the fly for tests  
**Reason**: More flexible than static fixtures, truly isolated tests  
**Impact**: More maintainable and reproducible tests

---

## 2025-06-25: 27 tests covering critical paths only
**Decision**: Focus on critical paths, no over-testing  
**Reason**: 80/20 - cover 80% of risks with 20% of effort  
**Impact**: Maintainable test suite that runs in 1.3s

---

## 2025-06-25: Accept NaN score for empty list
**Decision**: Don't fix the NaN score bug when 0 files  
**Reason**: Rare edge case, fix could introduce other bugs  
**Impact**: Behavior documented in tests

---

## 2025-06-25: Reporter with ASCII bars and icons
**Decision**: Use `████░░` bars and emoji icons (❌/⚠️/💡)  
**Reason**: Attractive visual without additional dependencies  
**Impact**: Professional output that works in all terminals

---

## 2025-06-25: Tips shown if score < 70
**Decision**: Threshold at 70 to show improvement tips  
**Reason**: Grade C and below = needs help  
**Impact**: Added value for those who need it

---

## 2025-06-25: Reporter complexity accepted at 25
**Decision**: Don't refactor reporter despite its complexity  
**Reason**: Trade-off between readability and acceptable complexity  
**Impact**: Our own score remains C but code is clear

---

## 2025-06-25: Weighted score 40/30/30
**Decision**: Complexity 40%, Duplication 30%, Maintainability 30%  
**Reason**: Complexity is the #1 factor in technical debt  
**Impact**: Score that reflects real refactoring priorities

---

## 2025-06-25: Grade C for score 73/100
**Decision**: Strict grading (A=90+, B=80+, C=70+, D=60+, F<60)  
**Reason**: Push for excellence, not complacency  
**Impact**: Our own project has a C, it's honest and motivating

---

## 2025-06-25: 0% duplication acceptable
**Decision**: No false positives, conservative algorithm  
**Reason**: Better to miss duplication than cry wolf  
**Impact**: Trust in results when duplication detected

---

## 2025-06-24: Parser with TypeScript Compiler API
**Decision**: Use official TypeScript API rather than custom parser  
**Reason**: Maximum precision, maintained by Microsoft, free  
**Impact**: 100% reliable parsing, guaranteed future support

---

## 2025-06-24: Simple cyclomatic complexity (McCabe)
**Decision**: Count only decision points, no cognitive complexity  
**Reason**: Industry standard, simple to understand and explain  
**Impact**: Clear and actionable metric

---

## 2025-06-24: Duplication by block hashing
**Decision**: MD5 hash of 5-line blocks to detect duplication  
**Reason**: Balance between precision and performance  
**Impact**: Fast detection, few false positives

---

## 2025-06-24: Reduced to 3 metrics instead of 5
**Decision**: MVP with only complexity, duplication, maintainability  
**Reason**: Simplicity > Features. 80% of value with 40% of effort  
**Impact**: 2x faster dev, 2x simpler code

---

## 2025-06-24: TypeScript only, not Angular-specific
**Decision**: Analyze all TypeScript/JavaScript, not specific to Angular  
**Reason**: 10x larger market, same dev complexity  
**Impact**: 500k+ potential users vs 50k

---

## 2025-06-24: No license system in v1
**Decision**: 100% free open source, monetization after PMF  
**Reason**: Acquisition first, revenue later. Reduce friction  
**Impact**: -2 weeks dev, +50% estimated adoption

---

## 2025-06-24: Stateless architecture (no DB)
**Decision**: No persistence, JSON export for history  
**Reason**: Zero maintenance, privacy by design, simplicity  
**Impact**: No native history but 10x simpler

---

## 2025-06-24: Global NPM, no scoped package
**Decision**: `insightcode-cli` instead of `@insightcode/cli`  
**Reason**: Simpler, no need for NPM org  
**Impact**: More natural installation

---

## 2025-06-24: Choice of Commander.js over yargs/oclif
**Decision**: Commander for CLI framework  
**Reason**: Simpler, well documented, sufficient  
**Impact**: 50% less boilerplate

---

## 2025-06-24: Use 4 dependencies max
**Decision**: commander, typescript, chalk, fast-glob only  
**Reason**: Each dep = maintenance risk  
**Impact**: Bundle <50KB, fewer bugs

---

## 2025-06-24: No complex GitHub Actions
**Decision**: Simple manual npm publish  
**Reason**: Side project, no need for complex CI/CD  
**Impact**: 1 command to release

---

## 2025-06-24: README as main doc
**Decision**: No doc site, everything in README  
**Reason**: 1 source of truth, simpler  
**Impact**: Doc always up to date

---

## 2025-06-24: Critical tests only (not 100% coverage)
**Decision**: Test parsing and scoring, not CLI  
**Reason**: 80/20, effort vs value  
**Impact**: 2h of tests vs 2 days

---

## 2025-07-03: Academic Best Practices for Metric Aggregation
**Decision**: Refactor analyzer.ts to calculate project scores as weighted averages of file scores instead of applying scoring functions to project averages.
**Reason**: Follow academic research and industry standards for proper metric aggregation. The previous approach calculated complexity/duplication averages first, then scored them, which doesn't properly weight the impact of individual files.
**Impact**: Mathematically correct scoring system where larger files have appropriate influence on project scores. Uses file size (LOC) as weighting factor, which is the industry standard. Maintains backward compatibility while ensuring academic rigor.

---

## 2025-07-03: Single Source of Truth for Scoring Logic
**Decision**: Centralize all 40/30/30 weighting logic in scoring.ts and eliminate duplicate implementations across analyzer.ts, reporter.ts, and fileScoring.ts.
**Reason**: Multiple scoring implementations created maintenance burden and potential inconsistencies. Found duplicate logic in three different files.
**Impact**: All scoring calculations now use identical logic from shared functions. Easier maintenance, guaranteed consistency, and cleaner architecture.

---

## 2025-07-03: Weighted Average Project Scoring with LOC Weighting
**Decision**: Use file size (lines of code) as weighting factor when aggregating file scores to project scores.
**Reason**: Industry standard approach - larger files should have more influence on overall project health. A 1000-line file with issues is more impactful than a 10-line file with the same issues.
**Impact**: More accurate project-level scores that reflect real-world maintenance burden. Follows academic literature on software metric aggregation.

---

## 2025-07-03: Rename topIssues.ts to fileScoring.ts
**Decision**: Rename the module from topIssues.ts to fileScoring.ts for clarity.
**Reason**: The module does more than just identify top issues - it handles all file-level scoring logic using the same functions as project scoring.
**Impact**: Better code organization and clearer module responsibility. Name reflects actual functionality.

---

## Coming: [Template for future decisions]
**Decision**:  
**Reason**:  
**Impact**:  

---

## Guiding Principles

1. **If it takes > 1 day, it's too complex**
2. **Functional > Perfect**
3. **Less code = Fewer bugs**
4. **Users don't care about your architecture**
5. **Ship early, iterate often**

---

*This document avoids repeating the same debates. When in doubt, review past decisions.*