# InsightCode Duplication Detection Philosophy

## Table of Contents

- [Executive Summary](#executive-summary)
- [Practical Example: lodash/perf.js Case Study](#practical-example-lodashperfjs-case-study)
- [Our Detection Algorithm](#our-detection-algorithm)
- [Why This Matters](#why-this-matters)
- [Practical Examples](#practical-example)
- [Benefits of Our Approach](#benefits-of-our-approach)
- [When to Use Which Tool](#when-to-use-which-tool)
- [Technical Implementation](#technical-implementation)
- [Real-World Impact](#real-world-impact)
- [Summary](#summary)

## Executive Summary

InsightCode uses a **pragmatic, content-based duplication detection** approach that focuses on actual copy-paste problems rather than structural similarities. This results in more actionable insights for developers.

> **🎯 Quick validation**: Check our [benchmark results](../benchmarks/) showing InsightCode vs other tools on 9 popular projects.

> **Note**: For technical details and academic justification of our detection algorithm, see [SCORING_THRESHOLDS_JUSTIFICATION.md](./SCORING_THRESHOLDS_JUSTIFICATION.md).

## Practical Example: lodash/perf.js Case Study

### The 70% vs 6% Difference Explained

| Tool | Approach | lodash/perf.js Result | Philosophy |
|------|----------|----------------------|------------|
| **SonarQube** | Token/Structure-based | 70.4% duplication | "This code has repetitive structure" |
| **InsightCode** | Content-based | 6% duplication | "This code has actual copy-paste" |

### Why the Massive Difference?

Using `lodash/perf.js` as an example - a file with 106 benchmark suites:

**SonarQube sees:**
```javascript
// Pattern repeated 106 times = 70% duplication
suites.push(
  Benchmark.Suite('`_.methodName`')
    .add(buildName, { 'fn': 'lodash.methodName(...)' })
    .add(otherName, { 'fn': '_.methodName(...)' })
);
```

**InsightCode sees:**
```javascript
// Different methods = different code = 6% duplication
// Only counts if EXACT same logic is repeated
```

## Our Detection Algorithm

### 1. Sliding Window (8 lines)
We analyze consecutive 8-line blocks - optimal for catching meaningful duplications without false positives.

### 2. Smart Normalization
```javascript
// Original code variations:
const userName = "John";
let user_name = 'John';
var userName = "John";

// All normalize to:
VAR = STRING;
```

### 3. Semantic Preservation
```javascript
// These remain DIFFERENT after normalization:
lodash.map(data, fn)    // → .map(VAR, VAR)
lodash.filter(data, fn) // → .filter(VAR, VAR)
// Different methods = different semantics = not duplicates
```

### 4. Conservative Filtering
- Minimum 50 characters after normalization
- Minimum 8 tokens (meaningful code)
- Blocks must appear 2+ times to count
- Cross-file detection only (no intra-file duplicates)

## Why This Matters

### For Benchmark/Test Files
- **Structural repetition is NECESSARY** - each test must be independent
- **70% "duplication" is misleading** - you can't refactor benchmark suites
- **6% actual duplication is actionable** - real copy-paste to fix

### For Production Code
- **Catches real problems** - actual copy-pasted business logic
- **Avoids false positives** - similar structure ≠ duplication
- **Actionable results** - every flagged duplication can be refactored

## Practical Example

### False Positive (Structural)
```javascript
// NOT considered duplication by InsightCode
router.get('/users', validateAuth, getUsers);
router.get('/posts', validateAuth, getPosts);
router.get('/comments', validateAuth, getComments);
// Similar structure, different endpoints = intentional pattern
```

### True Positive (Content)
```javascript
// WOULD be flagged by InsightCode
function validateEmail(email) {
  if (!email) return false;
  if (email.length > 255) return false;
  if (!email.includes('@')) return false;
  return true;
}

function checkEmail(email) {
  if (!email) return false;
  if (email.length > 255) return false;
  if (!email.includes('@')) return false;
  return true;
}
// Identical logic = actual duplication
```

## Benefits of Our Approach

1. **Lower false positive rate** - Only flags code that can actually be refactored
2. **Pragmatic for real codebases** - Understands that patterns aren't duplication
3. **Faster analysis** - Simpler algorithm = better performance
4. **Developer-friendly** - Results align with developer intuition

## When to Use Which Tool

### Use InsightCode when:
- You want actionable duplication metrics
- You're analyzing codebases with intentional patterns
- You need fast, local analysis
- You prefer pragmatic over academic metrics

### Use SonarQube when:
- You need enterprise compliance reports
- You want to identify structural patterns
- You're doing architectural analysis
- You need deep code quality metrics

## Technical Implementation

Our normalization preserves semantic differences while removing syntactic variations:

```typescript
function normalizeBlock(block: string): string {
  return block
    // Syntax variations → unified
    .replace(/\b(const|let|var)\s+\w+/g, 'VAR')
    
    // Semantics preserved
    .replace(/\b\w+\.([\w]+)/g, '.$1')  // method names kept
    
    // Content abstracted
    .replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, 'STRING')
    .replace(/\b\d+(\.\d+)?\b/g, 'NUM')
    
    // Properties normalized
    .replace(/\b(\w+)\s*[:=]\s*/g, 'PROP = ')
    
    // Noise removed
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
}
```

## Real-World Impact

Our latest benchmark of 9 popular projects confirms this philosophy. The average duplication across all production code was 20.4%. This highlights that even well-maintained projects carry a measurable level of duplication, and our tool provides a realistic baseline for evaluating it.

This shows that **test code naturally has more duplication** due to setup/teardown patterns, and our pragmatic approach correctly identifies this as non-actionable.

## Summary

Our philosophy: **"If it can't be refactored, it's not duplication."**

While other tools might report high duplication in benchmark or test files, we focus on what matters: actual copy-paste code that hurts maintainability. This pragmatic approach means:
- Fewer false positives
- More actionable results
- Better developer experience
- Faster analysis

> **💡 Want to adjust detection sensitivity?** See our [duplication modes user guide](./DUPLICATION_MODES_USER_GUIDE.md) for configuration options.

---

*For the technical implementation details and academic justification, see [SCORING_THRESHOLDS_JUSTIFICATION.md](./SCORING_THRESHOLDS_JUSTIFICATION.md).*