#!/bin/bash
# Git AI System Installation for InsightCode

echo "🚀 Installing Git AI System..."

# Determine project root
PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
if [ -z "$PROJECT_ROOT" ]; then
  echo "❌ Error: Not in a git repository"
  exit 1
fi

echo "📁 Project root: $PROJECT_ROOT"
cd "$PROJECT_ROOT"

# Check dependencies
if ! command -v jq &> /dev/null; then
  echo "❌ Missing jq. Install with: brew install jq"
  exit 1
fi

# Check if InsightCode is installed
if ! command -v npx insightcode &> /dev/null 2>&1; then
  echo "⚠️  InsightCode CLI not found. Install with: npm install -g insightcode-cli"
fi

# Create Git aliases
echo "📝 Installing Git aliases..."

git config --local alias.ai '!f() { git commit -m "ai: $*"; }; f'

git config --local alias.ai-status '!f() {
  [ ! -f ".ai.md" ] && echo "❌ .ai.md not found" && return 1
  echo "🔄 Updating metrics..."
  
  # Detect if we are analyzing InsightCode itself
  PROJECT_NAME=$(basename "$PWD")
  if [[ "$PROJECT_NAME" == "insightcode-cli" ]] || grep -q "insightcode-cli" package.json 2>/dev/null; then
    echo "📊 Self-analysis mode (for testing/demo purposes)..."
  fi
  
  ANALYSIS=$(npx insightcode analyze . --json 2>/dev/null || echo "{}")
  [ "$ANALYSIS" = "{}" ] && echo "❌ Analysis failed" && return 1
  
  # Extract metrics
  SCORE=$(echo "$ANALYSIS" | jq -r ".score // \"?\"")
  GRADE=$(echo "$ANALYSIS" | jq -r ".grade // \"?\"")
  FILES=$(echo "$ANALYSIS" | jq -r ".summary.totalFiles // \"?\"")
  LINES=$(echo "$ANALYSIS" | jq -r ".summary.totalLines // \"?\"")
  TOP=$(echo "$ANALYSIS" | jq -r ".topFiles[0] // {} | \"\\(.path // \"N/A\") (complexity: \\(.complexity // \"N/A\"))\"")
  
  # Update .ai.md
  DATE=$(date "+%Y-%m-%d %H:%M")
  NEW_STATUS="<!-- GIT-HOOK:START -->
Last Analysis: $DATE
Score: $GRADE ($SCORE/100) | Files: $FILES | Lines: $LINES
Top Issues: $TOP
<!-- GIT-HOOK:END -->"
  
  # Replace in file
  sed -n "1,/<!-- GIT-HOOK:START -->/p" .ai.md | sed "\$d" > .ai.md.new
  echo "$NEW_STATUS" >> .ai.md.new
  sed -n "/<!-- GIT-HOOK:END -->/,\$p" .ai.md | tail -n +2 >> .ai.md.new
  mv .ai.md.new .ai.md
  
  echo "✅ Score: $GRADE ($SCORE/100)"
}; f'

git config --local alias.ai-log '!f() {
  [ ! -f ".ai.md" ] && echo "❌ .ai.md not found" && return 1
  echo "📅 Session Log:"
  awk "/<!-- GIT-LOG:START -->/{p=1;next} /<!-- GIT-LOG:END -->/{p=0} p&&/^- /{print}" .ai.md
}; f'

git config --local alias.ai-task '!f() {
  [ -z "$1" ] && echo "Usage: git ai-task \"description\"" && return 1
  [ ! -f ".ai.md" ] && echo "❌ .ai.md not found" && return 1
  echo "📝 Adding task: $1"
  sed -i.bak "/^\\*\\*Active\\*\\*:/ s/$/ | TODO: $1/" .ai.md && rm .ai.md.bak
  echo "✅ Task added to Current Focus"
}; f'

# Create minimal .ai.md if not present (at root)
if [ ! -f "$PROJECT_ROOT/.ai.md" ]; then
  echo "📁 Creating minimal .ai.md at project root..."
  
  # Detect if this is InsightCode itself
  IS_INSIGHTCODE=false
  if [[ "$(basename "$PWD")" == "insightcode-cli" ]] || grep -q '"name".*"insightcode-cli"' package.json 2>/dev/null; then
    IS_INSIGHTCODE=true
  fi
  
  if [ "$IS_INSIGHTCODE" = true ]; then
    cat > "$PROJECT_ROOT/.ai.md" << 'EOF'
# 🤖 AI Development Context

## 📊 Quick Status
<!-- GIT-HOOK:START -->
Last Analysis: Never
Score: ? (?/100) | Files: ? | Lines: ?
Top Issues: N/A
<!-- GIT-HOOK:END -->

> ⚠️ **Note**: This score is InsightCode analyzing itself for testing and demo purposes.
> It is NOT a quality indicator of InsightCode, but demonstrates its capabilities.

## 🎯 Current Focus
**Active**: Initial setup
**Next**: TBD
**Blocker**: None

## 📅 Session Log
<!-- GIT-LOG:START -->
<!-- GIT-LOG:END -->

## 📖 For AI Assistants
This is the InsightCode project itself. Self-analysis is used for:
- Testing all features work correctly
- Generating real metrics for documentation
- Providing output examples
EOF
  else
    cat > "$PROJECT_ROOT/.ai.md" << 'EOF'
# 🤖 AI Development Context

## 📊 Quick Status
<!-- GIT-HOOK:START -->
Last Analysis: Never
Score: ? (?/100) | Files: ? | Lines: ?
Top Issues: N/A
<!-- GIT-HOOK:END -->

## 🎯 Current Focus
**Active**: Initial setup
**Next**: TBD
**Blocker**: None

## 📅 Session Log
<!-- GIT-LOG:START -->
<!-- GIT-LOG:END -->
EOF
  fi
  echo "✅ Created $PROJECT_ROOT/.ai.md"
else
  echo "✅ .ai.md already exists at project root"
fi

# Update .gitignore (at root)
echo "📝 Updating .gitignore..."
GITIGNORE="$PROJECT_ROOT/.gitignore"
for pattern in ".ai.md.backup" ".ai.md.tmp" ".ai.md.new" ".ai-backups/" ".skip-ai-hook"; do
  grep -q "^$pattern$" "$GITIGNORE" 2>/dev/null || echo "$pattern" >> "$GITIGNORE"
done

# Check Git hook
if [ -f "$PROJECT_ROOT/.husky/prepare-commit-msg" ]; then
  echo "✅ Git hook found"
  [ ! -x "$PROJECT_ROOT/.husky/prepare-commit-msg" ] && chmod +x "$PROJECT_ROOT/.husky/prepare-commit-msg"
else
  echo "⚠️  Git hook not found at .husky/prepare-commit-msg"
  echo "   The AI analysis won't work automatically without it"
fi

# Instructions
echo "
╔════════════════════════════════════════════════════════════╗
║          ✅ Git AI System installed successfully!          ║
╚════════════════════════════════════════════════════════════╝

📚 COMMANDS AVAILABLE:

  git ai \"message\"
    → Commits with 'ai:' prefix, triggers analysis
    → Example: git ai \"feat: add user authentication\"
    
  git ai-status
    → Updates project metrics in .ai.md
    → Run this to refresh your code quality score
    
  git ai-task \"description\"  
    → Adds a TODO to your current focus in .ai.md
    → Example: git ai-task \"refactor parser.ts\"
    
  git ai-log
    → Shows your development session history
    → Displays last 50 commits from .ai.md

🔧 CONFIGURATION OPTIONS:

  SKIP_AI_HOOK=true git commit -m \"quick fix\"
    → Skips AI analysis for one commit
    
  touch .skip-ai-hook
    → Disables AI hook until you: rm .skip-ai-hook
    
  Edit .ai.md directly
    → Update focus, milestones, or context manually

📖 GETTING STARTED:
  1. Test the system:
     git ai-status

  2. Make your first AI commit:
     git add .
     git ai \"initial commit with AI context\"

  3. View your progress:
     git ai-log

⚠️  REQUIREMENTS:
  - jq must be installed (you have it ✓)
  - npx/npm must be available
  - InsightCode CLI should be installed
  - Run commands from project root with .ai.md

🔗 MORE INFO:
  - See .ai.md for full project context
  - Check docs/ for detailed documentation
  - The git hook is at .husky/prepare-commit-msg
"