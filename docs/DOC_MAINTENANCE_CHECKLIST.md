# Documentation Maintenance Checklist

## 🎯 Purpose
This checklist ensures all project documentation stays synchronized and up-to-date after each development session. Use it to avoid inconsistencies and forgotten updates.

## 📋 Pre-Session Checklist

### 1. Review Current State
- [ ] Read `CURRENT_TASK.md` - Is this still the current task?
- [ ] Check `AI_CONTEXT.md` - Are metrics and state accurate?
- [ ] Scan `DECISIONS.md` - Any decisions that affect today's work?

### 2. Prepare Session
- [ ] Update `CURRENT_TASK.md` with today's objective
- [ ] Note any constraints or decisions that might impact the session
- [ ] Clear any completed tasks from previous session

## 📝 Post-Session Checklist

### 1. Update CURRENT_TASK.md
- [ ] Mark completed items with [x]
- [ ] Add any discoveries or blockers in "Session Notes"
- [ ] Update metrics if they changed
- [ ] Set next task if current is complete

### 2. Update AI_CONTEXT.md
- [ ] **Project Metrics** section:
  - [ ] File count and line count
  - [ ] Test count and coverage
  - [ ] Current score and grade
  - [ ] Top issues list
- [ ] **Project State** section:
  - [ ] Move completed items from "In Progress" to "Done"
  - [ ] Update "In Progress" with current work
  - [ ] Review "To Do" list
- [ ] **Session History** (if exists):
  - [ ] Add today's session summary
  - [ ] Note duration and key achievements

### 3. Update DECISIONS.md
- [ ] Add any new architectural decisions made
- [ ] Use the format: Date | Decision | Reason | Impact
- [ ] Check if any old decisions need revisiting

### 4. Update Other Files
- [ ] `CHANGELOG.md` - Add new features/fixes under [Unreleased]
- [ ] `README.md` - Update if features or usage changed
- [ ] `package.json` - Check version, dependencies, scripts

### 5. Verify Consistency
- [ ] Do all documents reflect the same project state?
- [ ] Are metrics consistent across documents?
- [ ] Is the current task clear for next session?
- [ ] Would a new AI assistant understand where we are?

## 🔄 Session Transition Template

When completing a task and moving to the next:

```markdown
## Completed: [Task Name]
- Duration: X hours
- Key achievements:
  - ✅ [Achievement 1]
  - ✅ [Achievement 2]
- Metrics impact:
  - Before: [metrics]
  - After: [metrics]
- Decisions made:
  - [Any architectural decisions]

## Next: [Next Task Name]
- Estimated duration: X hours
- Prerequisites:
  - [What needs to be ready]
- Success criteria:
  - [ ] [Criterion 1]
  - [ ] [Criterion 2]
```

## 🚨 Common Inconsistencies to Avoid

1. **Version Mismatch**
   - package.json version ≠ CHANGELOG version
   - README saying "coming soon" for implemented features

2. **State Mismatch**
   - CURRENT_TASK showing active work that's already done
   - AI_CONTEXT not reflecting completed features
   - Test count/metrics out of sync

3. **Missing Updates**
   - New features not in CHANGELOG
   - Decisions made but not documented
   - README examples not matching actual output

## 💡 Best Practices

1. **Update immediately** after session while context is fresh
2. **Use exact numbers** (lines of code, test count) not approximations
3. **Date everything** for historical tracking
4. **Be specific** about what changed and why
5. **Think about the next AI** - will it understand the state?

## 🤖 AI Assistant Instructions

When asked to update documentation:
1. Run through this entire checklist
2. Show what sections you're updating
3. Highlight any inconsistencies found
4. Suggest improvements if patterns are unclear

Example prompt for AI:
```
Please update all project documentation after this session.
We completed [X] and the new metrics are [Y].
Use the DOC_MAINTENANCE_CHECKLIST.md to ensure nothing is missed.
```

---

*This checklist is part of the InsightCode CLI project documentation.*
*Last updated: 2025-06-25*