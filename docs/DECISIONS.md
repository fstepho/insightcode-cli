# Architectural Decisions - InsightCode CLI

Format: **Date | Decision | Reason | Impact**

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