#!/bin/bash
# Script pour vérifier que le système AI est correctement installé

echo "🔍 Checking AI System Setup for InsightCode..."
echo "============================================"

ERRORS=0
WARNINGS=0

# Fonction pour check
check_file() {
  if [ -f "$1" ]; then
    echo "✅ $1"
    return 0
  else
    echo "❌ $1 (missing)"
    ((ERRORS++))
    return 1
  fi
}

check_dir() {
  if [ -d "$1" ]; then
    echo "✅ $1/"
    return 0
  else
    echo "❌ $1/ (missing)"
    ((ERRORS++))
    return 1
  fi
}

check_in_gitignore() {
  if grep -q "$1" .gitignore 2>/dev/null; then
    echo "✅ $1 in .gitignore"
    return 0
  else
    echo "⚠️  $1 not in .gitignore"
    ((WARNINGS++))
    return 1
  fi
}

check_git_alias() {
  if git config --get alias.$1 > /dev/null 2>&1; then
    echo "✅ git $1 alias configured"
    return 0
  else
    echo "❌ git $1 alias missing"
    ((ERRORS++))
    return 1
  fi
}

echo ""
echo "1️⃣  Checking main files..."
check_file ".ai.md"
check_file ".husky/prepare-commit-msg"
[ -x ".husky/prepare-commit-msg" ] && echo "✅ Hook is executable" || echo "⚠️  Hook not executable"

echo ""
echo "2️⃣  Checking documentation..."
check_file "README.md"
check_file "CHANGELOG.md"
check_file "docs/CODE_QUALITY_GUIDE.md"
check_file "docs/DECISIONS.md"
check_file "docs/SCORING_THRESHOLDS_JUSTIFICATION.md"
check_file "docs/DUPLICATION_DETECTION_PHILOSOPHY.md"

echo ""
echo "3️⃣  Checking old files are removed..."
if [ -f "CLAUDE.md" ]; then
  echo "⚠️  CLAUDE.md still exists (should be removed)"
  ((WARNINGS++))
else
  echo "✅ CLAUDE.md removed"
fi

if [ -f "docs/archive/CLAUDE.md" ]; then
  echo "✅ CLAUDE.md archived"
fi

echo ""
echo "4️⃣  Checking .gitignore entries..."
check_in_gitignore ".ai.md.backup"
check_in_gitignore ".ai.md.bak"
check_in_gitignore ".ai.md.tmp"
check_in_gitignore ".ai-backups/"

echo ""
echo "5️⃣  Checking Git aliases..."
check_git_alias "ai"
check_git_alias "ai-status"
check_git_alias "ai-log"

echo ""
echo "6️⃣  Checking .ai.md structure..."
if [ -f ".ai.md" ]; then
  if grep -q "<!-- GIT-HOOK:START -->" .ai.md && grep -q "<!-- GIT-HOOK:END -->" .ai.md; then
    echo "✅ GIT-HOOK markers present"
  else
    echo "❌ GIT-HOOK markers missing"
    ((ERRORS++))
  fi
  
  if grep -q "<!-- GIT-LOG:START -->" .ai.md && grep -q "<!-- GIT-LOG:END -->" .ai.md; then
    echo "✅ GIT-LOG markers present"
  else
    echo "❌ GIT-LOG markers missing"
    ((ERRORS++))
  fi
fi

echo ""
echo "7️⃣  Checking dependencies..."
if command -v jq &> /dev/null; then
  echo "✅ jq installed"
else
  echo "❌ jq not installed (required for hook)"
  ((ERRORS++))
fi

if command -v npx &> /dev/null; then
  echo "✅ npx available"
else
  echo "❌ npx not found (required for analysis)"
  ((ERRORS++))
fi

echo ""
echo "============================================"
echo "Summary: $ERRORS errors, $WARNINGS warnings"

if [ $ERRORS -eq 0 ]; then
  if [ $WARNINGS -eq 0 ]; then
    echo "✅ AI System is perfectly configured!"
  else
    echo "✅ AI System is functional (with minor warnings)"
  fi
  exit 0
else
  echo "❌ AI System has configuration errors"
  echo ""
  echo "To fix:"
  echo "1. Run: ./scripts/install-git-ai.sh"
  echo "2. Install missing dependencies"
  echo "3. Check file permissions"
  exit 1
fi