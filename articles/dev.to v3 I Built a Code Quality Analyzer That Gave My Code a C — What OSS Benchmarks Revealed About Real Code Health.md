# I Built a Code Quality Analyzer That Gave My Code a C — What OSS Benchmarks Revealed About Real Code Health

Ever wondered how "healthy" your codebase really is? After waiting 47 minutes for SonarQube to finish on our TypeScript monorepo, I had a mountain of metrics but still couldn’t answer the only question I cared about:
**Which files should we actually refactor first?**

That frustration led me to build [**InsightCode**](https://github.com/fstepho/insightcode-cli): a CLI tool that scans your JavaScript/TypeScript code 100% locally and gives you *just three* actionable metrics.
But after running it on 19 open-source projects, I realized: my code scored a C—and that’s actually pretty typical. Here’s why.

---

## Why I Built It (and What I Was Missing)

* **SonarQube:** Enterprise-grade, but slow and overwhelming for devs (think 30–60 min for a big repo, plus setup).
* **ESLint:** Great for code style, but doesn’t track cyclomatic complexity or duplication natively.
* **Code Climate:** Offers more metrics, but requires uploading your code to their cloud.

I wanted something local, lightning fast, and focused on the **actual architectural debt**—not just cosmetic issues.

---

## Meet InsightCode

```bash
npm install -g insightcode-cli
insightcode analyze
```

* **Zero config required**
* **100% local (no code leaves your machine)**
* **Results in seconds—not minutes or hours**

**Sample Output:**

```
📊 Code Quality Report
━━━━━━━━━━━━━━━━━━━━━━
📁 Files analyzed: 17
📏 Total lines: 1,306

🎯 Quality Score: 73/100 (Grade: C)

📊 Metrics Breakdown:
┌────────────────┬────────┬────────┬─────────┐
│ Metric         │ Score  │ Value  │ Weight  │
├────────────────┼────────┼────────┼─────────┤
│ Complexity     │ 68/100 │ 15.4   │ 40%     │
│ Duplication.   │ 78/100 │ 12.1%  │ 30%     │
│ Maintainability│ 75/100 │ 76.8   │ 30%     │
└────────────────┴────────┴────────┴─────────┘

⚠️  3 files with high complexity (20+)
💡 Consider breaking down complex functions
```

---

## What’s Really Different? (Architectural Insights)

### 1. Three Actionable Metrics, Not 200 Pages
* **Cyclomatic Complexity (40%)**:
  Implements extended cyclomatic complexity (the modern standard used by ESLint/SonarQube): beyond [McCabe’s original](https://en.wikipedia.org/wiki/Cyclomatic_complexity), control structures, each && and || adds +1 complexity, providing a more accurate measure for JavaScript's compound conditions.
* **Code Duplication (30%)**:
  Pragmatic, content-based detection using 5-line blocks. Only flags *actual* copy-paste (see more on the philosophy below).
* **Maintainability (30%)**:
  Penalizes large file size and excessive function counts, especially for files >1,000 and >2,000 lines (where maintainability drops sharply).

> **Note:** Many OSS projects have large files—these penalties are empirically justified, not arbitrary.
> For example, files above 1,000 lines incur a -10 penalty, above 2,000 lines another -20. [See scoring details](https://github.com/fstepho/insightcode-cli/blob/main/docs/SCORING_THRESHOLDS_JUSTIFICATION.md)

---

### 2. Benchmarking Real OSS Projects: The Architectural Reality

I benchmarked 19 open-source projects (from small libraries to TypeScript itself), running InsightCode both on the **full codebase** (prod + test + examples) and **production code only**.

#### Key architectural insight:

**Why do scores drop so much when you analyze “production-only”?**

* Test and example files often mask deep maintainability issues by spreading code across lots of small, simple files.
* The *real* complexity, duplication, and maintainability debt lives in the few core files of your production code.

#### Example: TypeScript, Express, Lodash, React

* **TypeScript:** Drops from C (76) overall to F (28) in production-only—an enormous 48-point drop. The compiler core is tightly packed and algorithmically dense.
* **Lodash:** Stays F (29 → 27), because its monolithic structure means the maintainability problem is *in* the main file.
* **Express:** D (69) to F (46)—core routing/middleware packed into just a handful of files.
* **React:** D (68) to F (52)—core rendering and reconciliation logic is much denser than test/examples would suggest.

#### Why Such Dramatic Drops? A TypeScript Example

A concrete example is the TypeScript compiler’s `src/compiler/binder.ts` file:

- **File size:** 3,255 lines (triggering major maintainability penalties)
- **Cyclomatic complexity:** 960 (for a single file—recommended is < 20 per function, but this file contains hundreds of functions)
- **No test files to “dilute” the result:** In production-only mode, these massive, complex files dominate the overall score and are not averaged out by hundreds of small test/helper files.

**Bottom line:**  
A single huge, deeply complex file can tank your entire production score. That’s by design—these files *are* your maintenance bottlenecks and deserve attention.

Want to dive deeper?  
[See the full TypeScript analysis and breakdown](https://github.com/fstepho/insightcode-cli/blob/main/docs/benchmarks/benchmark-2025-06-28-production-only.md)

#### *But sometimes the opposite happens!*

* **Vue.js**: Full codebase gets an F (58), but production-only jumps up to D (66).
  Why? Excluding tests/examples slashes duplication, *even though* the average complexity per file goes up. In this case, less duplication mattered more than increased complexity, so the grade improved.

**Key lesson:**

> *Tests/examples can make your codebase look healthier than it is.
> When you focus on production, the true architectural hotspots become obvious.*

[See the full benchmarks and explanations](https://github.com/fstepho/insightcode-cli/blob/main/docs/benchmarks/benchmark-2025-06-28-production-only.md)

---

### 3. Duplication: Why “Structural Duplication” Isn’t Always Bad

#### A Real Example: lodash/perf.js

* **SonarQube** (structure-based): Flags 70% duplication.
* **InsightCode** (content-based): Flags just 6% duplication.

Why?
Benchmark/test files are *supposed* to have repetitive patterns—each suite is intentionally similar but serves a different purpose. Flagging all of it as duplication would create massive false positives and un-actionable noise.

```js
// Not flagged by InsightCode:
suites.push(Benchmark.Suite('methodA').add(...));
suites.push(Benchmark.Suite('methodB').add(...));
// Different methods, similar structure: NOT a copy-paste issue.
```

But if you literally copy-paste logic between two different helpers, it *will* be flagged.

```js
function validateEmail(email) { ... }
function checkEmail(email) { ... }
// Same logic, copy-pasted: flagged as duplication.
```

**Trade-off:**
InsightCode is conservative: It might *miss* some "semantic" duplication (two blocks doing the same thing, written differently), but the upside is a *much lower* rate of false positives. Some flagged duplications might still require human judgment—a utility function duplicated intentionally for performance may not be worth refactoring.

[Read more: Duplication Detection Philosophy](https://github.com/fstepho/insightcode-cli/blob/main/docs/DUPLICATION_DETECTION_PHILOSOPHY.md)

---

### 4. What If You Get a D or F? (Real Advice for Teams)

If your production code gets a D or F—don’t panic, and don’t blame your team. You’re in the same boat as the vast majority of big open-source projects!

**Common root causes in real OSS code:**

* **Monolithic files/functions:** Dozens or hundreds of utilities crammed into one file (see: lodash).
* **Deep nesting and branching:** Especially in parsing, routing, or compiler code (TypeScript, Express, ESLint).
* **Overly generic “god objects” or manager classes:** Hard to refactor, high complexity.
* **Hidden duplication:** Internal helpers copy-pasted instead of extracted (often legacy code).

**What actually works to fix it:**

* **Split large files by domain or responsibility.** (E.g. break `utils.js` into focused modules.)
* **Refactor huge functions into smaller ones, each handling a single concern.**
* **Extract repeated logic into shared helpers, but don’t over-DRY if performance or readability suffer.**
* **For architectural complexity (like compilers):** Sometimes, the complexity is justified—but flagging the hot spots lets you document and monitor them over time.

**Anti-patterns to watch for:**

* Chaining too many responsibilities into one function or file.
* Copy-pasting logic with tiny tweaks ("almost the same" code in different places).
* Relying on gigantic utility or manager files.

[See more: Concrete patterns & anti-patterns from OSS benchmarks](https://github.com/fstepho/insightcode-cli/tree/main/docs/benchmarks)

---

## Maintainability Penalties: Why Size Really Does Matter

InsightCode’s maintainability penalties are grounded in both cognitive science and real-world practice:

* **File >1,000 lines:** -10 penalty
* **File >2,000 lines:** an additional -20 penalty
* **Function count:** >10 per file starts to incur penalties, >20 gets a bigger deduction

These numbers reflect studies showing that humans struggle to navigate and reason about code beyond certain sizes, and OSS analysis confirms that bugs/maintenance problems spike sharply in giant files.

---

## Limitations and Blind Spots

No tool is perfect or context-free, including InsightCode:

* **Code generation & metaprogramming:** If code is dynamically generated or heavily meta-programmed, static metrics might miss the real complexity or duplication.
* **Intentionally duplicated utilities:** Sometimes, a little copy-paste is intentional for performance, clarity, or portability. Metrics can flag it, but your team needs to decide what’s “actionable.”
* **Limited syntax support:** Advanced JSX/TSX patterns, decorators, or experimental features may not be fully analyzed.
* **Non-JS/TS files:** Other languages or configs are currently out of scope.
* **Some "semantic duplication" might be missed:** If two blocks do the same thing but aren’t literally copy-pasted, they may slip by to keep false positives low.

Use InsightCode as a signal, not gospel—a prompt for deeper team discussions, not an absolute verdict.

---

## How to Use It on Your Project

```bash
npm install -g insightcode-cli
cd your-project
insightcode analyze --exclude-utility
```

You can further customize the analysis:

```bash
insightcode analyze --exclude "**/*.spec.js,**/examples/**,**/benchmark/**"
insightcode analyze --json > report.json
```

---

## References

* [Cyclomatic Complexity: McCabe, 1976](https://en.wikipedia.org/wiki/Cyclomatic_complexity)
* [Maintainability Index: Halstead, 1977](https://en.wikipedia.org/wiki/Halstead_complexity_measures)
* [Duplication Philosophy](https://github.com/fstepho/insightcode-cli/blob/main/docs/DUPLICATION_DETECTION_PHILOSOPHY.md)
* [Scoring Thresholds: Justification & Research](https://github.com/fstepho/insightcode-cli/blob/main/docs/SCORING_THRESHOLDS_JUSTIFICATION.md)
* [Benchmarks & architectural explanations](https://github.com/fstepho/insightcode-cli/tree/main/docs/benchmarks)

---

**Feedback, PRs, and real-world war stories are welcome! [insightcode-cli on GitHub](https://github.com/fstepho/insightcode-cli)**

---

*What’s the one metric you wish your static analyzer actually showed you? Let’s discuss in the comments!*

---

**All scores, data, and scoring logic are open—see the [benchmarks](https://github.com/fstepho/insightcode-cli/tree/main/docs/benchmarks) for every project and metric.**