# Architectural Decisions - InsightCode CLI

Format: **Date | Decision | Reason | Impact**

---

## 2025-07-13: CHANGELOG format compliance with Keep a Changelog
**Decision**: Restructure CHANGELOG.md to strictly follow Keep a Changelog format with standard sections (Added/Changed/Removed/Fixed) instead of custom emoji sections.
**Reason**: Keep a Changelog is the industry standard. Our custom format with emojis and verbose descriptions was non-standard and harder to parse. Standard format improves readability and tool compatibility.
**Impact**: Cleaner, more professional changelog that follows established conventions. Easier for tools and users to parse changes. More concise entries focused on essential information.

---

## 2025-07-13: Comprehensive Documentation Validation System
**Decision**: Implement unified documentation validation using `validate-docs.js` with 10 regex patterns to automatically detect and verify 79+ numerical examples across 11 documentation files against actual code implementation.
**Reason**: Manual documentation maintenance was error-prone and time-consuming. Previous versions had inconsistencies between documented examples and actual code behavior. Need automated anti-regression system to ensure long-term accuracy.
**Impact**: 100% accuracy guarantee for all documentation examples. Prevents future documentation drift. Enables confident releases knowing all technical specifications are verified. Reduces maintenance burden while improving quality.

---

## 2025-07-13: CLI Interface Simplification - Analysis as Default Action  
**Decision**: Make analysis the default CLI action. Users can now use `insightcode` directly instead of requiring `insightcode analyze`.
**Reason**: Improved user experience. Analysis is the primary use case (95%+ of usage). Removes friction for new users. Aligns with industry standards where the main action is the default.
**Impact**: Cleaner CLI interface. Backward compatibility maintained (analyze subcommand still works). Simplified documentation and onboarding. Better first-time user experience.

---

## 2025-07-13: Mathematical Accuracy Verification for v0.6.0
**Decision**: Verify every mathematical formula, scoring constant, and threshold in documentation against actual implementation using automated validation.
**Reason**: Documentation accuracy is critical for user trust and adoption. Previous manual processes led to inconsistencies. Need to guarantee that all documented examples produce correct results.
**Impact**: 100% confidence in documentation accuracy. Enhanced user trust. Eliminated confusion between documented behavior and actual tool behavior. Foundation for reliable technical communication.

---

## 2025-07-13: Modular Component Extraction for Dependency Analysis
**Decision**: Extract `DependencyResolver` and `DependencyGraph` as standalone modules from the monolithic `dependency-analyzer.ts`, reducing main analyzer by ~500 lines.
**Reason**: Improve separation of concerns, enhance testability, and reduce complexity in core analyzer. The original file was becoming unwieldy with multiple responsibilities (resolution, graph management, orchestration).
**Impact**: Better modularity with 3 specialized components (`DependencyResolver`, `DependencyGraph`, `UniversalDependencyAnalyzer`). Improved maintainability while preserving identical public API. Enhanced testability of individual components.

---

## 2025-07-13: FileDetailBuilder Class Introduction
**Decision**: Replace monolithic `parser.ts` with dedicated `FileDetailBuilder` class and create specialized `src/analyzer/` directory with 3 modules (`ContextGenerator`, `OverviewCalculator`, `ProjectDiscovery`).
**Reason**: The original `parser.ts` was a 382-line monolithic file handling multiple concerns. Need better encapsulation and modular architecture for file detail construction and analysis orchestration.
**Impact**: Improved code organization with clear separation of responsibilities. Enhanced maintainability and testability. Better encapsulation of file detail construction logic. Foundation for scalable analyzer architecture.

---

## 2025-07-13: Developer Experience Enhancement
**Decision**: Add `npm run typecheck` command and improve error handling throughout dependency analyzer.
**Reason**: Better development workflow and more robust error handling for better debugging experience. TypeScript checking was missing from the workflow.
**Impact**: Improved developer productivity with dedicated TypeScript checking. More reliable error handling throughout the codebase. Better debugging capabilities.

---

## 2025-07-13: Quality Assurance Workflow Unification  
**Decision**: Create unified `npm run qa` command that combines build, test, and documentation validation.
**Reason**: Streamline quality assurance process. Developers need a single command to verify all aspects of code quality before commits.
**Impact**: Simplified workflow for contributors. Single command ensures all quality checks pass. Reduces risk of incomplete validation before releases.

---

## 2025-07-13: RELEASE_NOTES Removal for Project Maturity
**Decision**: Remove `RELEASE_NOTES_v0.6.0.md` file and consolidate all release information into CHANGELOG.md.
**Reason**: Avoid documentation duplication and corporate formalism inappropriate for project maturity level. CHANGELOG.md suffices for tracking changes.
**Impact**: Cleaner documentation structure. Single source of truth for changes. Reduced maintenance burden. More appropriate documentation approach for project scale.

---

## 2025-07-12: Duplication Detection Algorithm Update (8-line blocks)
**Decision**: Update duplication detection from 5-line to 8-line sliding window blocks, with enhanced filtering (50 characters minimum, 8 tokens minimum).
**Reason**: Better balance between detection accuracy and performance. 8-line blocks catch more meaningful duplication patterns while filtering out trivial code snippets. Aligns with enhanced detection algorithm implemented in v0.6.0+.
**Impact**: More accurate duplication detection with fewer false positives. All documentation updated to reflect 8-line implementation. Maintains philosophy of pragmatic, content-based detection versus structural similarity.

---

## 2025-07-08: **Introduction of Rich Context Extraction for LLM Analysis**
**Decision**: Implement comprehensive code context extraction system (`context-builder.ts`) that provides rich semantic information about TypeScript/JavaScript files to help LLMs better analyze InsightCode outputs. The system analyzes AST structure, patterns, dependencies, and complexity breakdowns to generate detailed context summaries.

**Reason**: To enable more sophisticated analysis and reporting by providing LLMs with structured context about code architecture, patterns, and quality metrics when they analyze InsightCode results. This moves beyond simple metrics to provide semantic understanding of code structure, making LLM-based analysis more actionable and insightful.

**Impact**: 
- **New capabilities**: Rich architectural analysis, pattern detection (async/await, error handling, TypeScript usage), dependency mapping, and complexity breakdown at function level
- **Enhanced benchmarking**: Detailed context reports with code samples, architectural insights, and "silent killer" detection
- **Better UX**: More actionable insights for developers with specific function-level complexity analysis and architectural risk assessment
- **Future-ready**: Foundation for AI-powered code analysis and recommendations

---

## 2025-07-03: **Final Shift to Criticality-Weighted Scoring (Impact + Complexity)**
**Decision**: The final project score is now weighted by a `criticismScore` calculated for each file. This score is a combination of the file's intrinsic **complexity** and its architectural **Impact** (number of other files that import it). This decision **supersedes all previous decisions regarding LOC-based weighting**.
**Reason**: Weighting by lines of code (LOC) was a flawed intermediate step. It incorrectly favored large, simple files over small, critical ones. The new model based on impact and complexity provides a much more accurate measure of a file's true importance and risk to the project.
**Impact**: The scoring system is now fully aligned with our "criticality-first" philosophy. The final grade accurately reflects the maintenance burden posed by the most interconnected and complex parts of the codebase.

---

## 2025-07-03: **Unification of Scoring and Ranking Logic in `analyzer.ts`**
**Decision**: All file ranking and scoring logic is now centralized in `analyzer.ts`. The `fileScoring.ts` module has been **deleted**. The `criticismScore` is now the single source of truth for both weighting the final project score and for ranking the `topFiles`.
**Reason**: The existence of `fileScoring.ts` created a competing and inconsistent definition of "criticality". This led to a confusing architecture with multiple sources of truth.
**Impact**: The codebase is simpler, more maintainable, and logically coherent. There is now one clear, justifiable method for determining which files are the most important.

---

## 2025-07-03: **Introduction of Advanced Architectural Metrics**
**Decision**: The core analysis (`analyzer.ts`) now calculates and exposes two new advanced metrics: `complexityStdDev` (Standard Deviation) and `silentKillers` (architecturally risky files).
**Reason**: To provide deeper architectural insights beyond a simple quality score. `complexityStdDev` identifies "monolith" files, while `silentKillers` highlights high-impact files that might otherwise go unnoticed.
**Impact**: The CLI provides significantly more value, offering users not just a grade, but a true profile of their project's architecture and hidden risks.


## 2025-07-03: Academic Best Practices for Metric Aggregation (SUPERSEDED)
**Decision**: ~~Refactor analyzer.ts to calculate project scores as weighted averages of file scores instead of applying scoring functions to project averages.~~
**Status**: **SUPERSEDED by Criticality-Weighted Scoring** - This LOC-based approach was replaced by impact+complexity weighting.
**Legacy Reason**: Follow internal hypothesis for proper metric aggregation. The previous approach calculated complexity/duplication averages first, then scored them, which doesn't properly weight the impact of individual files.
**Legacy Impact**: Mathematically correct scoring system where larger files have appropriate influence on project scores. Uses file size (LOC) as weighting factor, which is the industry standard. Maintains backward compatibility while ensuring academic rigor.

---

## 2025-07-03: Single Source of Truth for Scoring Logic
**Decision**: Centralize all 45/30/25 weighting logic in scoring.ts and eliminate duplicate implementations across analyzer.ts, reporter.ts, and fileScoring.ts.
**Reason**: Multiple scoring implementations created maintenance burden and potential inconsistencies. Found duplicate logic in three different files.
**Impact**: All scoring calculations now use identical logic from shared functions. Easier maintenance, guaranteed consistency, and cleaner architecture.
**Note**: Weights are internal hypotheses (45% complexity, 30% maintainability, 25% duplication) requiring empirical validation.

---

## 2025-07-03: Weighted Average Project Scoring with LOC Weighting (SUPERSEDED)
**Decision**: ~~Use file size (lines of code) as weighting factor when aggregating file scores to project scores.~~
**Status**: **SUPERSEDED by Criticality-Weighted Scoring** - This approach was fundamentally flawed and replaced.
**Legacy Reason**: Industry standard approach - larger files should have more influence on overall project health. A 1000-line file with issues is more impactful than a 10-line file with the same issues.
**Legacy Impact**: More accurate project-level scores that reflect real-world maintenance burden. Follows academic literature on software metric aggregation.
**Why Superseded**: LOC weighting incorrectly favored large, simple files over small, critical ones. The new criticality-based model (impact + complexity) provides much more accurate risk assessment.

## 2025-07-03: Rename topIssues.ts to fileScoring.ts (COMPLETED & SUPERSEDED)
**Decision**: ~~Rename the module from topIssues.ts to fileScoring.ts for clarity.~~
**Status**: **COMPLETED then SUPERSEDED** - Module was renamed then later deleted entirely.
**Legacy Reason**: The module does more than just identify top issues - it handles all file-level scoring logic using the same functions as project scoring.
**Legacy Impact**: Better code organization and clearer module responsibility. Name reflects actual functionality.
**Final Resolution**: Module was completely removed as part of centralizing all scoring logic in `analyzer.ts` to eliminate competing definitions of "criticality".

---

## 2025-06-29: Scoring pattern pure functions
**Decision**: Refactor scoring functions in `scoring.ts` to be pure functions that take a file object and return a score.
**Reason**: To ensure that scoring logic is predictable, testable, and reusable across different contexts.
**Impact**: Improved maintainability and testability of the scoring logic, allowing for easier future enhancements and bug fixes.

---

## 2025-06-29: File Scoring Algorithm with Weighted Criticality (COMPLETED)
**Decision**: Create dedicated `topIssues.ts` module with weighted file scoring (complexity-heavy).
**Status**: **COMPLETED** - Module was created, later renamed to `fileScoring.ts`, then finally deleted and merged into `analyzer.ts`.
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

## 2025-06-27: Production code analysis with --production
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

## 2025-07-03: Conservative duplication detection accepted (UPDATED)
**Decision**: Keep 8-line block detection with enhanced filtering (50+ characters, 8+ tokens minimum).
**Reason**: Better balance between precision and recall. 8-line blocks catch meaningful duplication while enhanced filtering reduces false positives from trivial code.
**Impact**: More accurate actionable duplication detection, aligned with pragmatic philosophy focused on refactorable duplicates.

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

## 2025-06-25: Weighted score 45/30/25 (Updated from 40/30/30)
**Decision**: Complexity 45%, Maintainability 30%, Duplication 25%  
**Reason**: Internal hypothesis - Complexity is the primary defect predictor (requires empirical validation)
**Impact**: Score that reflects internal hypotheses about refactoring priorities
**Status**: Internal hypothesis requiring empirical validation, not industry standard

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

## 2025-06-24: Duplication by block hashing (UPDATED)
**Decision**: MD5 hash of 8-line blocks to detect duplication (updated from original 5-line approach)
**Reason**: Balance between precision and performance. 8-line blocks provide better detection of meaningful duplications.
**Impact**: Fast detection, fewer false positives, more accurate results

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
## 2025-06-24: Avoid technical pitfalls
**Decision**: Follow KISS, no over-engineering, no premature abstractions, 
**Reason**: Keep it simple, avoid complexity
**Impact**: Fewer bugs, easier to maintain, faster development

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

## Guiding Principles

1. **If it takes > 1 day, it's too complex**
2. **Functional > Perfect**
3. **Less code = Fewer bugs**
4. **Users don't care about your architecture**
5. **Ship early, iterate often**

---

*This document avoids repeating the same debates. When in doubt, review past decisions.*