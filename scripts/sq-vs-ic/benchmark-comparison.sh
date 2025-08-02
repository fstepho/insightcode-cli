#!/bin/bash

# InsightCode vs SonarQube - Complete Benchmark Script

echo "🔬 INSIGHTCODE VS SONARQUBE COMPLETE BENCHMARK"
echo "=============================================="
echo ""

# Root setup
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BENCHMARK_DIR="$ROOT_DIR/benchmark-projects"
RESULTS_DIR="$(dirname "$(dirname "$ROOT_DIR")")/benchmarks/sq-vs-ic"

# Configuration
SONAR_HOST="http://localhost:9000"
SONAR_TOKEN="sqa_4522d8b0e6b04f2a4251121f0a0b39b2bb77e1f2"

PROJECTS=("chalk" "express" "uuid" "lodash" "eslint" "jest" "vue" "angular" "typescript")

# Harmonized exclusion patterns for both tools
EXCLUSION_PATTERNS=(
    "**/node_modules/**"
    "**/dist/**"
    "**/build/**"
    "**/coverage/**"
    "**/test/**"
    "**/tests/**"
    "**/__tests__/**"
    "**/*.test.js"
    "**/*.test.ts"
    "**/*.spec.js"
    "**/*.spec.ts"
    "**/examples/**"
    "**/demo/**"
    "**/docs/**"
    "**/vendor/**"
    "**/*.min.js"
    "**/*.min.css"
    "**/fixtures/**"
    "**/mocks/**"
    "**/*.d.ts"
)

# Generate exclusion regex from patterns for file filtering
generate_exclusion_regex() {
    echo "(node_modules|/dist/|/build/|/coverage/|/test/|/tests/|/__tests__/|\.test\.|\.spec\.|/examples/|/demo/|/docs/|/vendor/|\.min\.|/fixtures/|/mocks/|\.d\.ts)"
}

EXCLUSION_REGEX=$(generate_exclusion_regex)

# Required tools and version collection
echo "🔍 Checking tool versions..."
for tool in jq curl insightcode sonar-scanner; do
    if ! command -v "$tool" >/dev/null 2>&1; then
        echo "❌ Required tool '$tool' is not installed or not in PATH."
        exit 1
    fi
done

# Collect tool versions
INSIGHTCODE_VERSION=$(insightcode --version 2>/dev/null | head -1 || echo "Unknown")
SONAR_SCANNER_VERSION=$(sonar-scanner --version 2>/dev/null | head -1 | sed 's/^/SonarScanner /' || echo "Unknown")
JQ_VERSION=$(jq --version 2>/dev/null || echo "Unknown")
CURL_VERSION=$(curl --version 2>/dev/null | head -1 || echo "Unknown")

echo "✅ InsightCode: $INSIGHTCODE_VERSION"
echo "✅ SonarScanner: $SONAR_SCANNER_VERSION"
echo "✅ jq: $JQ_VERSION"
echo "✅ curl: $CURL_VERSION"

# Create results directory
mkdir -p "$RESULTS_DIR" || {
  echo "❌ Cannot create results directory: $RESULTS_DIR"
  exit 1
}

# Create details subdirectory for detailed files
mkdir -p "$RESULTS_DIR/details" || {
  echo "❌ Cannot create details directory: $RESULTS_DIR/details"
  exit 1
}

# Function to determine source directory for a project
get_sources_directory() {
    local project=$1
    local path=$2
    
    # Same logic as SonarQube source detection
    local sources="."
    [ -d "$path/src" ] && sources="src"
    [ -d "$path/source" ] && sources="source"
    [[ "$project" =~ ^(angular|vue|jest)$ ]] && sources="packages"
    [ -d "$path/lib" ] && sources="lib"
    
    echo "$sources"
}

# Function to wait for SonarQube analysis completion
wait_for_sonarqube_analysis() {
    local project_key=$1
    local max_wait_time=${2:-600}  # Default 10 minutes timeout
    local check_interval=10        # Check every 10 seconds
    local elapsed_time=0
    
    echo "   ⏳ Waiting for SonarQube analysis to complete..."
    
    while [ $elapsed_time -lt $max_wait_time ]; do
        # Get the latest task for this component
        local task_response=$(curl -s "$SONAR_HOST/api/ce/component?component=$project_key" \
            -H "Authorization: Bearer $SONAR_TOKEN")
        
        if [ $? -ne 0 ]; then
            echo "   ❌ Failed to check analysis status"
            return 1
        fi
        
        # Check if we have any tasks
        local task_count=$(echo "$task_response" | jq -r '.queue | length' 2>/dev/null)
        if [ "$task_count" = "null" ] || [ "$task_count" = "0" ]; then
            # No tasks in queue, check current task
            local current_task=$(echo "$task_response" | jq -r '.current // empty' 2>/dev/null)
            if [ -z "$current_task" ] || [ "$current_task" = "null" ]; then
                echo "   ✅ Analysis completed (no active tasks)"
                return 0
            fi
            
            local task_status=$(echo "$current_task" | jq -r '.status' 2>/dev/null)
        else
            # Get the most recent task from queue
            local latest_task=$(echo "$task_response" | jq -r '.queue[0]' 2>/dev/null)
            local task_status=$(echo "$latest_task" | jq -r '.status' 2>/dev/null)
        fi
        
        case "$task_status" in
            "SUCCESS")
                echo "   ✅ Analysis completed successfully"
                return 0
                ;;
            "FAILED" | "CANCELED")
                echo "   ❌ Analysis failed or was canceled (status: $task_status)"
                return 1
                ;;
            "PENDING" | "IN_PROGRESS")
                echo "   🔄 Analysis in progress (status: $task_status) - ${elapsed_time}s elapsed"
                ;;
            *)
                echo "   ❓ Unknown status: $task_status - continuing to wait"
                ;;
        esac
        
        sleep $check_interval
        elapsed_time=$((elapsed_time + check_interval))
    done
    
    echo "   ⏰ Timeout reached (${max_wait_time}s) - analysis may still be running"
    return 1
}

# InsightCode Analysis
analyze_with_insightcode() {
    local project=$1
    local path=$2
    echo "📊 InsightCode analysis of $project..."

    # Use the same source directory logic as SonarQube
    local sources=$(get_sources_directory "$project" "$path")
    
    if [ ! -d "$path/$sources" ]; then
        echo "   ⚠️  Cannot access $path/$sources"
        return 1
    fi

    local start_time=$(python3 -c "import time; print(int(time.time() * 1000))")
    pushd "$path" > /dev/null || return 1
    
    # Debug: Log the actual path being analyzed and count files
    echo "   🔍 InsightCode analyzing: $(pwd)"
    echo "   📁 Source directory: $sources (aligned with SonarQube)"
    
    # Count and catalog files that will be analyzed with detailed breakdown
    local all_files=$(find "$sources" -type f 2>/dev/null | wc -l)
    local js_files=$(find "$sources" \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \) -not -name "*.d.ts" 2>/dev/null | wc -l)
    
    # Apply proper exclusion filtering using the same patterns as the tools
    find "$sources" \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \) -not -name "*.d.ts" 2>/dev/null > "/tmp/all_js_files.txt"
    local js_files_filtered=$(grep -v -E "$EXCLUSION_REGEX" "/tmp/all_js_files.txt" 2>/dev/null | wc -l)
    
    local config_files=$(find "$sources" -name "*.json" -o -name "*.yaml" -o -name "*.yml" -o -name "*.xml" -o -name "*.ini" -o -name "*.conf" 2>/dev/null | wc -l)
    local generated_files=$(find "$sources" -name "*.d.ts" -o -name "*.map" -o -name "*.generated.*" 2>/dev/null | wc -l)
    
    echo "   📊 File analysis breakdown:"
    echo "     - Total files: $all_files"
    echo "     - JS/TS files (all): $js_files"
    echo "     - JS/TS files (filtered): $js_files_filtered"
    echo "     - Config files: $config_files"
    echo "     - Generated files: $generated_files"
    
    # Save detailed file lists for debugging
    find "$sources" \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \) -not -name "*.d.ts" 2>/dev/null | sort > "$RESULTS_DIR/details/${project}-insightcode-all-js-files.txt"
    grep -v -E "$EXCLUSION_REGEX" "/tmp/all_js_files.txt" 2>/dev/null | sort > "$RESULTS_DIR/details/${project}-insightcode-filtered-files.txt"
    
    echo "$(pwd)" > "$RESULTS_DIR/details/${project}-insightcode-path.txt"
    echo "$sources" > "$RESULTS_DIR/details/${project}-insightcode-sources.txt"
    echo "$js_files_filtered" > "$RESULTS_DIR/details/${project}-insightcode-filecount.txt"
    
    # Build exclusion arguments for InsightCode
    local exclude_args=""
    for pattern in "${EXCLUSION_PATTERNS[@]}"; do
        exclude_args="$exclude_args --exclude \"$pattern\""
    done
    
    # Log exclusions being applied
    echo "   🚫 Applying harmonized exclusions: ${#EXCLUSION_PATTERNS[@]} patterns"
    printf '%s\n' "${EXCLUSION_PATTERNS[@]}" > "$RESULTS_DIR/details/${project}-insightcode-exclusions.txt"
    
    # Configuration: --production mode with strict duplication detection and harmonized exclusions
    eval "insightcode \"$sources\" --production --format=json --strict-duplication $exclude_args > \"$RESULTS_DIR/details/${project}-insightcode.json\" 2>\"$RESULTS_DIR/details/${project}-insightcode-error.log\""
    popd > /dev/null
    local end_time=$(python3 -c "import time; print(int(time.time() * 1000))")
    local duration=$((end_time - start_time))

    local result_file="$RESULTS_DIR/details/${project}-insightcode.json"
    local error_file="$RESULTS_DIR/details/${project}-insightcode-error.log"
    
    if [ -s "$result_file" ]; then
        local grade=$(jq -r '.overview.grade // "N/A"' "$result_file")
        local score=$(jq -r '.overview.scores.overall // "N/A"' "$result_file")
        local files=$(jq -r '.overview.statistics.totalFiles // "0"' "$result_file")
        local loc=$(jq -r '.overview.statistics.totalLOC // "0"' "$result_file")
        echo "   ✅ Grade: $grade ($score/100) - $files files, $loc LOC (${duration}ms)"
        echo "$duration" > "$RESULTS_DIR/details/${project}-insightcode-time.txt"
        return 0
    else
        echo "   ❌ InsightCode analysis failed"
        if [ -s "$error_file" ]; then
            echo "      Error details:"
            head -3 "$error_file" | sed 's/^/      /'
        fi
        return 1
    fi
}

# SonarQube Analysis
analyze_with_sonarqube() {
    local project=$1
    local path=$2
    echo "📊 SonarQube analysis of $project..."

    local sources="."
    [ -d "$path/src" ] && sources="src"
    [ -d "$path/source" ] && sources="source"
    [[ "$project" =~ ^(angular|vue|jest)$ ]] && sources="packages"
    [ -d "$path/lib" ] && sources="lib"

    if [ ! -d "$path" ]; then
        echo "   ⚠️  Project path not found: $path"
        return 1
    fi

    local start_time=$(python3 -c "import time; print(int(time.time() * 1000))")
    # Use the same source directory logic as InsightCode
    local sources=$(get_sources_directory "$project" "$path")

    pushd "$path" > /dev/null || return 1
    
    # Debug: Log the actual path and sources being analyzed
    echo "   🔍 SonarQube analyzing: $(pwd)"
    echo "   📁 Sources directory: $sources (aligned with InsightCode)"
    
    # Count and catalog files with detailed breakdown (same logic as InsightCode)
    local sq_all_files=$(find "$sources" -type f 2>/dev/null | wc -l)
    local sq_js_files_all=$(find "$sources" \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \) -not -name "*.d.ts" 2>/dev/null | wc -l)
    
    # Apply proper exclusion filtering using the same patterns as the tools
    find "$sources" \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \) -not -name "*.d.ts" 2>/dev/null > "/tmp/sq_all_js_files.txt"
    local sq_js_files=$(grep -v -E "$EXCLUSION_REGEX" "/tmp/sq_all_js_files.txt" 2>/dev/null | wc -l)
    
    local sq_config_files=$(find "$sources" -name "*.json" -o -name "*.yaml" -o -name "*.yml" -o -name "*.xml" -o -name "*.ini" -o -name "*.conf" 2>/dev/null | wc -l)
    local sq_generated_files=$(find "$sources" -name "*.d.ts" -o -name "*.map" -o -name "*.generated.*" 2>/dev/null | wc -l)
    
    echo "   📊 File analysis breakdown:"
    echo "     - Total files in $sources: $sq_all_files"
    echo "     - JS/TS files (all): $sq_js_files_all"
    echo "     - JS/TS files (filtered): $sq_js_files"
    echo "     - Config files: $sq_config_files"
    echo "     - Generated files: $sq_generated_files"
    
    # Save detailed file lists for debugging
    find "$sources" \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \) -not -name "*.d.ts" 2>/dev/null | sort > "$RESULTS_DIR/details/${project}-sonarqube-all-js-files.txt"
    grep -v -E "$EXCLUSION_REGEX" "/tmp/sq_all_js_files.txt" 2>/dev/null | sort > "$RESULTS_DIR/details/${project}-sonarqube-filtered-files.txt"
    
    echo "$(pwd)" > "$RESULTS_DIR/details/${project}-sonarqube-path.txt"
    echo "$sources" > "$RESULTS_DIR/details/${project}-sonarqube-sources.txt"
    echo "$sq_js_files" > "$RESULTS_DIR/details/${project}-sonarqube-filecount.txt"
    
    # Build harmonized exclusions string for SonarQube
    local sonar_exclusions=""
    for pattern in "${EXCLUSION_PATTERNS[@]}"; do
        if [ -z "$sonar_exclusions" ]; then
            sonar_exclusions="$pattern"
        else
            sonar_exclusions="$sonar_exclusions,$pattern"
        fi
    done
    
    # Log exclusions being applied
    echo "   🚫 Applying harmonized exclusions: ${#EXCLUSION_PATTERNS[@]} patterns"
    printf '%s\n' "${EXCLUSION_PATTERNS[@]}" > "$RESULTS_DIR/details/${project}-sonarqube-exclusions.txt"
    
    cat > sonar-project.properties <<EOF
sonar.projectKey=$project
sonar.projectName=$project
sonar.sources=$sources
sonar.exclusions=$sonar_exclusions
sonar.sourceEncoding=UTF-8
sonar.javascript.lcov.reportPaths=coverage/lcov.info
EOF

    sonar-scanner \
        -Dsonar.host.url=$SONAR_HOST \
        -Dsonar.token=$SONAR_TOKEN \
        > "$RESULTS_DIR/details/${project}-sonarqube-scanner.log" 2>&1

    if [ $? -ne 0 ]; then
        echo "   ❌ Scanner failed"
        echo "   📋 Scanner logs saved to: details/${project}-sonarqube-scanner.log"
        if [ -f "$RESULTS_DIR/details/${project}-sonarqube-scanner.log" ]; then
            echo "   🔍 Last few lines of scanner output:"
            tail -5 "$RESULTS_DIR/details/${project}-sonarqube-scanner.log" | sed 's/^/      /'
        fi
        popd > /dev/null
        return 1
    else
        echo "   📋 Scanner logs saved to: details/${project}-sonarqube-scanner.log"
    fi

    popd > /dev/null
    
    # Wait for analysis to complete using intelligent polling
    local wait_timeout=600  # 10 minutes for large projects
    [[ "$project" =~ ^(angular|typescript|eslint)$ ]] && wait_timeout=1200  # 20 minutes for very large projects
    
    if ! wait_for_sonarqube_analysis "$project" $wait_timeout; then
        echo "   ❌ SonarQube analysis timed out or failed"
        return 1
    fi

    local result_file="$RESULTS_DIR/details/${project}-sonarqube.json"
    curl -s "$SONAR_HOST/api/measures/component?component=$project&metricKeys=complexity,duplicated_lines_density,sqale_rating,sqale_index,reliability_rating,security_rating,coverage,ncloc,code_smells,bugs,vulnerabilities,files" \
        -H "Authorization: Bearer $SONAR_TOKEN" \
        > "$result_file"
    
    local end_time=$(python3 -c "import time; print(int(time.time() * 1000))")
    local duration=$((end_time - start_time))

    # Validate that we got valid metrics data
    if ! jq -e '.component.measures' "$result_file" >/dev/null 2>&1; then
        echo "   ❌ Invalid SonarQube response or metrics not yet available"
        # Try one more time after additional wait for edge cases
        echo "   🔄 Retrying metrics retrieval in 30 seconds..."
        sleep 30
        curl -s "$SONAR_HOST/api/measures/component?component=$project&metricKeys=complexity,duplicated_lines_density,sqale_rating,sqale_index,reliability_rating,security_rating,coverage,ncloc,code_smells,bugs,vulnerabilities,files" \
            -H "Authorization: Bearer $SONAR_TOKEN" \
            > "$result_file"
        
        if ! jq -e '.component.measures' "$result_file" >/dev/null 2>&1; then
            echo "   ❌ SonarQube metrics still not available after retry"
            return 1
        fi
    fi

    local complexity=$(jq -r '.component.measures[] | select(.metric=="complexity") | .value' "$result_file")
    local ncloc=$(jq -r '.component.measures[] | select(.metric=="ncloc") | .value' "$result_file")
    local files=$(jq -r '.component.measures[] | select(.metric=="files") | .value' "$result_file")
    local rating=$(jq -r '.component.measures[] | select(.metric=="sqale_rating") | .value' "$result_file")
    case ${rating%.*} in
        1) grade="A" ;; 2) grade="B" ;; 3) grade="C" ;; 4) grade="D" ;; 5) grade="E" ;; *) grade="N/A" ;;
    esac

    echo "   ✅ Grade: $grade - Complexity: $complexity, LOC: $ncloc, Files: $files (${duration}ms)"
    echo "   🌐 Dashboard: $SONAR_HOST/dashboard?id=$project"
    echo "$duration" > "$RESULTS_DIR/details/${project}-sonarqube-time.txt"
    return 0
}

# Benchmark main
echo "🚀 Starting benchmark..."
echo ""

IC_SUCCESS=0
IC_FAIL=0
SQ_SUCCESS=0
SQ_FAIL=0
START_TIME=$(date +%s)

for project in "${PROJECTS[@]}"; do
    project_path="$BENCHMARK_DIR/$project"
    if [ -d "$project_path" ]; then
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📦 Project: $project"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        if analyze_with_insightcode "$project" "$project_path"; then
            ((IC_SUCCESS++))
        else
            ((IC_FAIL++))
        fi

        echo ""

        if analyze_with_sonarqube "$project" "$project_path"; then
            ((SQ_SUCCESS++))
        else
            ((SQ_FAIL++))
        fi
    else
        echo "⚠️  Project $project not found in $BENCHMARK_DIR"
    fi
done

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
TOTAL=${#PROJECTS[@]}
[ $TOTAL -eq 0 ] && TOTAL=1

# Generate report
REPORT_FILE="$RESULTS_DIR/comparison-report.md"
echo ""
echo "📊 GENERATING COMPARISON REPORT..."
echo ""

{
echo "# InsightCode vs SonarQube Comparison Report"
echo ""
echo "**Date:** $(date)"
echo "**Duration:** ${DURATION}s"
echo ""
echo "## Tool Versions & Configuration"
echo "| Tool | Version | Configuration |"
echo "|------|---------|---------------|"
echo "| InsightCode | $INSIGHTCODE_VERSION | Production mode, strict duplication detection |"
echo "| SonarScanner | $SONAR_SCANNER_VERSION | Default configuration with JS/TS rules |"
echo "| jq | $JQ_VERSION | JSON processing |"
echo "| curl | $CURL_VERSION | API communication |"
echo ""
echo "### Analysis Configuration Details"
echo "- **InsightCode**: \`--production --format=json --strict-duplication --exclude [patterns]\`"
echo "- **SonarQube**: \`sonar.exclusions=[patterns]\` in project properties"
echo "- **Source Alignment**: Both tools analyze identical source directories"
echo "- **Harmonized Exclusions**: ${#EXCLUSION_PATTERNS[@]} identical exclusion patterns applied to both tools"
echo ""
echo "## Success Rate"
echo "| Tool | Success | Failures | Success Rate |"
echo "|------|---------|----------|--------------|"
echo "| InsightCode | $IC_SUCCESS | $IC_FAIL | $((IC_SUCCESS * 100 / TOTAL))% |"
echo "| SonarQube   | $SQ_SUCCESS | $SQ_FAIL | $((SQ_SUCCESS * 100 / TOTAL))% |"
echo ""
echo "## Project Summary"
echo "| Project | IC Grade | IC Overall Score | IC Files | IC LOC | IC Total Complexity | IC Complexity/KLOC | SQ Grade* | SQ Files | SQ LOC | SQ Total Complexity | SQ Complexity/KLOC | IC Time | SQ Time | Duplication (IC/SQ) |"
echo "|---------|----------|------------------|----------|--------|---------------------|-------------------|-----------|----------|--------|---------------------|-------------------|---------|---------|---------------------|"
for project in "${PROJECTS[@]}"; do
    icf="$RESULTS_DIR/details/${project}-insightcode.json"
    sqf="$RESULTS_DIR/details/${project}-sonarqube.json"
    ic_time_file="$RESULTS_DIR/details/${project}-insightcode-time.txt"
    sq_time_file="$RESULTS_DIR/details/${project}-sonarqube-time.txt"

    if [ -s "$icf" ]; then
        ic_grade=$(jq -r '.overview.grade // "N/A"' "$icf")
        ic_score=$(jq -r '.overview.scores.overall // "N/A"' "$icf")
        ic_files=$(jq -r '.overview.statistics.totalFiles // "0"' "$icf")
        ic_avg_complexity=$(jq -r '.overview.statistics.avgComplexity // "0"' "$icf")
        ic_loc=$(jq -r '.overview.statistics.totalLOC // "0"' "$icf")
        ic_dup=$(jq -r '.overview.statistics.avgDuplicationRatio // "0"' "$icf")
        # Calculer complexité totale (avg * files) pour comparaison avec SonarQube
        if [ "$ic_avg_complexity" != "N/A" ] && [ "$ic_files" != "0" ]; then
            ic_total_complexity=$(echo "scale=0; $ic_avg_complexity * $ic_files" | bc -l 2>/dev/null || echo "N/A")
        else
            ic_total_complexity="N/A"
        fi
        # Calculer complexité par KLOC (total / (LOC/1000))
        if [ "$ic_loc" != "0" ] && [ "$ic_total_complexity" != "N/A" ]; then
            ic_complexity_kloc=$(echo "scale=1; $ic_total_complexity / ($ic_loc / 1000)" | bc -l 2>/dev/null || echo "N/A")
        else
            ic_complexity_kloc="N/A"
        fi
    else
        ic_grade="❌"; ic_score="N/A"; ic_files="N/A"; ic_complexity_kloc="N/A"; ic_loc="N/A"; ic_dup="N/A"
    fi

    if [ -s "$sqf" ] && jq -e '.component.measures' "$sqf" >/dev/null 2>&1; then
        # Extract all SonarQube ratings and metrics
        sq_maintainability=$(jq -r '.component.measures[] | select(.metric=="sqale_rating") | .value' "$sqf")
        sq_reliability=$(jq -r '.component.measures[] | select(.metric=="reliability_rating") | .value' "$sqf")
        sq_security=$(jq -r '.component.measures[] | select(.metric=="security_rating") | .value' "$sqf")
        sq_tech_debt=$(jq -r '.component.measures[] | select(.metric=="sqale_index") | .value' "$sqf")
        sq_bugs=$(jq -r '.component.measures[] | select(.metric=="bugs") | .value' "$sqf")
        sq_code_smells=$(jq -r '.component.measures[] | select(.metric=="code_smells") | .value' "$sqf")
        sq_vulnerabilities=$(jq -r '.component.measures[] | select(.metric=="vulnerabilities") | .value' "$sqf")
        sq_coverage=$(jq -r '.component.measures[] | select(.metric=="coverage") | .value' "$sqf")
        
        # Convert primary maintainability rating to grade
        case ${sq_maintainability%.*} in
            1) sq_grade="A" ;;
            2) sq_grade="B" ;;
            3) sq_grade="C" ;;
            4) sq_grade="D" ;;
            5) sq_grade="E" ;;
            *) sq_grade="N/A" ;;
        esac
        
        # Get basic SonarQube metrics (no composite scoring)
        sq_loc=$(jq -r '.component.measures[] | select(.metric=="ncloc") | .value' "$sqf")
        sq_dup=$(jq -r '.component.measures[] | select(.metric=="duplicated_lines_density") | .value' "$sqf")
        
        sq_complexity=$(jq -r '.component.measures[] | select(.metric=="complexity") | .value' "$sqf")
        sq_files=$(jq -r '.component.measures[] | select(.metric=="files") | .value' "$sqf")
        
        # Calculate complexity per KLOC
        if [ "$sq_loc" != "0" ] && [ "$sq_complexity" != "null" ] && [ "$sq_complexity" != "N/A" ]; then
            sq_complexity_kloc=$(echo "scale=1; $sq_complexity / ($sq_loc / 1000)" | bc -l 2>/dev/null || echo "N/A")
        else
            sq_complexity_kloc="N/A"
        fi
    else
        sq_grade="❌"; sq_files="N/A"; sq_complexity_kloc="N/A"; sq_loc="N/A"; sq_dup="N/A"
    fi

    # Temps d'analyse
    ic_time=$([ -f "$ic_time_file" ] && cat "$ic_time_file" || echo "N/A")
    sq_time=$([ -f "$sq_time_file" ] && cat "$sq_time_file" || echo "N/A")

    echo "| $project | $ic_grade | $ic_score | $ic_files | $ic_loc | $ic_total_complexity | $ic_complexity_kloc | $sq_grade | $sq_files | $sq_loc | $sq_complexity | $sq_complexity_kloc | ${ic_time}ms | ${sq_time}ms | ${ic_dup}% / ${sq_dup}% |"
done
echo ""
echo "*SQ Grade = Maintainability Rating only (sqale_rating), not a composite quality score"
echo ""
echo "## LOC Discrepancy Deep Dive"
echo "| Project | Sources Dir | IC All Files | IC JS Files | SQ All Files | SQ JS Files | IC LOC | SQ LOC | LOC Diff | % Diff | Issue Type |"
echo "|---------|-------------|--------------|-------------|--------------|-------------|--------|--------|----------|--------|------------|"
for project in "${PROJECTS[@]}"; do
    icf="$RESULTS_DIR/details/${project}-insightcode.json"
    sqf="$RESULTS_DIR/details/${project}-sonarqube.json"
    ic_sources_file="$RESULTS_DIR/details/${project}-insightcode-sources.txt"
    sq_sources_file="$RESULTS_DIR/details/${project}-sonarqube-sources.txt"
    ic_all_files_list="$RESULTS_DIR/details/${project}-insightcode-all-js-files.txt"
    sq_all_files_list="$RESULTS_DIR/details/${project}-sonarqube-all-js-files.txt"
    ic_filtered_files_list="$RESULTS_DIR/details/${project}-insightcode-filtered-files.txt"
    sq_filtered_files_list="$RESULTS_DIR/details/${project}-sonarqube-filtered-files.txt"

    ic_sources=$([ -f "$ic_sources_file" ] && cat "$ic_sources_file" || "N/A")
    sq_sources=$([ -f "$sq_sources_file" ] && cat "$sq_sources_file" || "N/A")
    
    # Count files from saved lists
    ic_all_files=$([ -f "$ic_all_files_list" ] && wc -l < "$ic_all_files_list" || "N/A")
    sq_all_files=$([ -f "$sq_all_files_list" ] && wc -l < "$sq_all_files_list" || "N/A")
    ic_js_files=$([ -f "$ic_filtered_files_list" ] && wc -l < "$ic_filtered_files_list" || "N/A")
    sq_js_files=$([ -f "$sq_filtered_files_list" ] && wc -l < "$sq_filtered_files_list" || "N/A")
    
    # Validation: sources should be identical
    if [ "$ic_sources" = "$sq_sources" ]; then
        sources_status="✅ $ic_sources"
    else
        sources_status="❌ IC:$ic_sources≠SQ:$sq_sources"
    fi
    
    ic_loc=$([ -s "$icf" ] && jq -r '.overview.statistics.totalLOC // "0"' "$icf" || echo "0")
    sq_loc=$([ -s "$sqf" ] && jq -r '.component.measures[] | select(.metric=="ncloc") | .value' "$sqf" || echo "0")
    
    if [ "$ic_loc" != "0" ] && [ "$sq_loc" != "0" ] && [ "$ic_loc" != "N/A" ] && [ "$sq_loc" != "N/A" ]; then
        loc_diff=$((ic_loc - sq_loc))
        if [ "$sq_loc" != "0" ]; then
            pct_diff=$(echo "scale=1; ($loc_diff * 100) / $sq_loc" | bc -l 2>/dev/null || echo "N/A")
        else
            pct_diff="N/A"
        fi
        
        # Diagnose issue type based on differences (consider both percentage and absolute values)
        # Get absolute value of loc_diff for comparison
        abs_loc_diff=${loc_diff#-}
        
        # Major: >50% difference OR >10,000 lines difference
        if [ "${pct_diff%.*}" -gt 50 ] 2>/dev/null || [ "${pct_diff%.*}" -lt -50 ] 2>/dev/null || [ "$abs_loc_diff" -gt 10000 ] 2>/dev/null; then
            issue_type="🔴 Major LOC counting difference"
        # Significant: ≥20% difference OR >1,000 lines difference
        elif [ "${pct_diff%.*}" -ge 20 ] 2>/dev/null || [ "${pct_diff%.*}" -le -20 ] 2>/dev/null || [ "$abs_loc_diff" -gt 1000 ] 2>/dev/null; then
            issue_type="🟡 Significant LOC difference"
        # Moderate: ≥5% difference OR >100 lines difference
        elif [ "${pct_diff%.*}" -ge 5 ] 2>/dev/null || [ "${pct_diff%.*}" -le -5 ] 2>/dev/null || [ "$abs_loc_diff" -gt 100 ] 2>/dev/null; then
            issue_type="🟠 Moderate LOC difference"
        elif [ "$ic_all_files" != "$sq_all_files" ] && [ "$ic_all_files" != "N/A" ] && [ "$sq_all_files" != "N/A" ]; then
            if [ $((ic_all_files - sq_all_files)) -gt 100 ]; then
                issue_type="🔴 IC sees many more files"
            elif [ $((sq_all_files - ic_all_files)) -gt 100 ]; then
                issue_type="🔴 SQ sees many more files"
            else
                issue_type="🟡 Different file discovery"
            fi
        elif [ "$ic_js_files" != "$sq_js_files" ] && [ "$ic_js_files" != "N/A" ] && [ "$sq_js_files" != "N/A" ]; then
            issue_type="🟡 JS/TS file filtering differs"
        else
            issue_type="🟢 Minor difference (<5%)"
        fi
    else
        loc_diff="N/A"
        pct_diff="N/A"
        issue_type="❓ Missing data"
    fi
    
    echo "| $project | $sources_status | $ic_all_files | $ic_js_files | $sq_all_files | $sq_js_files | $ic_loc | $sq_loc | $loc_diff | ${pct_diff}% | $issue_type |"
done
echo ""
echo "## Comparative Metrics Analysis"
echo ""
echo "⚠️ **Scoring Incompatibility Notice**"
echo "- **InsightCode**: Holistic architectural quality (0-100 scale, composite score)"
echo "- **SonarQube**: No native overall score; grades shown are Maintainability Rating only"
echo "- SonarQube has 3 separate ratings: Reliability, Security, Maintainability (each A-E)"
echo "- Use relative metrics (/KLOC) for meaningful cross-tool analysis"
echo ""
echo "| Project | IC Overall | SQ Bugs/KLOC | SQ Smells/KLOC | SQ Complexity/KLOC | SQ Debt/KLOC |"
echo "|---------|------------|--------------|----------------|-------------------|---------------|"
for project in "${PROJECTS[@]}"; do
    icf="$RESULTS_DIR/details/${project}-insightcode.json"
    sqf="$RESULTS_DIR/details/${project}-sonarqube.json"
    
    ic_overall=$([ -s "$icf" ] && jq -r '.overview.scores.overall // "N/A"' "$icf" || echo "N/A")
    
    if [ -s "$sqf" ] && jq -e '.component.measures' "$sqf" >/dev/null 2>&1; then
        sq_loc=$(jq -r '.component.measures[] | select(.metric=="ncloc") | .value' "$sqf" 2>/dev/null || echo "0")
        bugs=$(jq -r '.component.measures[] | select(.metric=="bugs") | .value' "$sqf" 2>/dev/null || echo "0")
        smells=$(jq -r '.component.measures[] | select(.metric=="code_smells") | .value' "$sqf" 2>/dev/null || echo "0")
        complexity=$(jq -r '.component.measures[] | select(.metric=="complexity") | .value' "$sqf" 2>/dev/null || echo "0")
        debt=$(jq -r '.component.measures[] | select(.metric=="sqale_index") | .value' "$sqf" 2>/dev/null || echo "0")
        
        if [ "$sq_loc" != "0" ] && [ "$sq_loc" != "null" ]; then
            bugs_kloc=$(echo "scale=1; ($bugs * 1000) / $sq_loc" | bc -l 2>/dev/null || echo "N/A")
            smells_kloc=$(echo "scale=1; ($smells * 1000) / $sq_loc" | bc -l 2>/dev/null || echo "N/A")
            complexity_kloc=$(echo "scale=1; ($complexity * 1000) / $sq_loc" | bc -l 2>/dev/null || echo "N/A")
            debt_kloc=$(echo "scale=1; ($debt * 1000) / $sq_loc" | bc -l 2>/dev/null || echo "N/A")
        else
            bugs_kloc="N/A"
            smells_kloc="N/A"
            complexity_kloc="N/A"
            debt_kloc="N/A"
        fi
    else
        bugs_kloc="N/A"
        smells_kloc="N/A"
        complexity_kloc="N/A"
        debt_kloc="N/A"
    fi
    
    echo "| $project | $ic_overall | $bugs_kloc | $smells_kloc | $complexity_kloc | ${debt_kloc} min |"
done

echo ""
echo "## Performance Summary"
echo "| Tool | Avg Analysis Time | Total Files Analyzed | Avg Files/Second |"
echo "|------|------------------|---------------------|------------------|"
# Calculer les moyennes de performance
ic_total_time=0
ic_total_files=0
sq_total_time=0
sq_total_files=0
ic_count=0
sq_count=0

for project in "${PROJECTS[@]}"; do
    ic_time_file="$RESULTS_DIR/details/${project}-insightcode-time.txt"
    sq_time_file="$RESULTS_DIR/details/${project}-sonarqube-time.txt"
    icf="$RESULTS_DIR/details/${project}-insightcode.json"
    sqf="$RESULTS_DIR/details/${project}-sonarqube.json"
    
    if [ -f "$ic_time_file" ] && [ -s "$icf" ]; then
        time=$(cat "$ic_time_file")
        files=$(jq -r '.overview.statistics.totalFiles // "0"' "$icf")
        ic_total_time=$((ic_total_time + time))
        ic_total_files=$((ic_total_files + files))
        ic_count=$((ic_count + 1))
    fi
    
    if [ -f "$sq_time_file" ] && [ -s "$sqf" ]; then
        time=$(cat "$sq_time_file")
        files=$(jq -r '.component.measures[] | select(.metric=="files") | .value' "$sqf")
        if [ "$files" != "null" ] && [ "$files" != "" ]; then
            sq_total_time=$((sq_total_time + time))
            sq_total_files=$((sq_total_files + files))
            sq_count=$((sq_count + 1))
        fi
    fi
done

if [ $ic_count -gt 0 ]; then
    ic_avg_time=$((ic_total_time / ic_count))
    ic_files_per_sec=$(echo "scale=1; $ic_total_files * 1000 / $ic_total_time" | bc -l 2>/dev/null || echo "N/A")
    echo "| InsightCode | ${ic_avg_time}ms | $ic_total_files | $ic_files_per_sec |"
else
    echo "| InsightCode | N/A | N/A | N/A |"
fi

if [ $sq_count -gt 0 ]; then
    sq_avg_time=$((sq_total_time / sq_count))
    sq_files_per_sec=$(echo "scale=1; $sq_total_files * 1000 / $sq_total_time" | bc -l 2>/dev/null || echo "N/A")
    echo "| SonarQube | ${sq_avg_time}ms | $sq_total_files | $sq_files_per_sec |"
else
    echo "| SonarQube | N/A | N/A | N/A |"
fi

echo ""
echo "## Notes"
echo "- **Complexity/KLOC**: Normalized complexity metric per 1000 lines of code for better comparison"
echo "- **InsightCode**: Shows total complexity (avgComplexity × totalFiles) for direct comparison"
echo "  - Configuration: Production mode with strict duplication detection"
echo "  - Mode: \`--production --format=json --strict-duplication\`"
echo "  - Scoring: Uses native overall score (0-100) from analysis results"
echo "- **SonarQube**: Uses total complexity, normalized by lines of code"
echo "  - Version: $SONAR_SCANNER_VERSION"
echo "  - Default JavaScript/TypeScript quality profile"
echo "  - Metrics: Raw compliance metrics (bugs, smells, debt) normalized per KLOC"
echo "- **Analysis Time**: Includes setup, scanning, intelligent polling, and result processing time"
echo "- **Duplication Detection**: Different algorithms - InsightCode uses strict mode, SonarQube uses default"
echo "- **LOC Calculation**: May vary depending on exclusion rules and language detection"
echo "- **Grading Criteria**: Not equivalent between tools (different scales and weightings)"
echo "- **Exclusions**: Both tools exclude test files, node_modules, dist, coverage directories"
echo ""
echo "## LOC Discrepancy Analysis & Debugging Files"
echo ""
echo "**Generated debugging files for each project (in details/ directory):**"
echo "- \`details/{project}-insightcode-all-js-files.txt\`: All JS/TS files found by InsightCode"
echo "- \`details/{project}-sonarqube-all-js-files.txt\`: All JS/TS files found by SonarQube"  
echo "- \`details/{project}-insightcode-filtered-files.txt\`: Files after exclusion filtering (IC)"
echo "- \`details/{project}-sonarqube-filtered-files.txt\`: Files after exclusion filtering (SQ)"
echo "- \`details/{project}-insightcode-error.log\`: InsightCode analysis error output (if any)"
echo "- \`details/{project}-sonarqube-scanner.log\`: SonarQube scanner complete output and warnings"
echo ""
echo "**Major LOC differences detected - possible causes:**"
echo "1. **Different source directories**: Check if both tools analyze the same base path"
echo "2. **File discovery logic**: Different algorithms for finding JS/TS files"
echo "3. **Exclusion effectiveness**: Patterns may work differently between tools"
echo "4. **Generated files**: .d.ts, .map files included/excluded differently"
echo "5. **Language detection**: Different criteria for counting TypeScript vs JavaScript"
echo "6. **Comment/blank line counting**: Different LOC calculation methodologies"
echo "7. **Symlinks/duplicates**: Different handling of linked or duplicated files"
echo ""
echo "## Methodology Comparison"
echo ""
echo "### InsightCode (Holistic Architecture Analysis)"
echo "- **Overall Score**: Native metric from analysis results (0-100)"
echo "- **Components**: Weighted combination of complexity, duplication, and maintainability"
echo "- **Grade Mapping**: A=90-100, B=80-89, C=70-79, D=60-69, F=0-59"
echo "- **Focus**: Architectural quality and code structure"
echo ""
echo "### SonarQube (Rule Compliance Metrics)"
echo "- **Bugs/KLOC**: Number of reliability issues per 1000 lines of code"
echo "- **Code Smells/KLOC**: Maintainability issues per 1000 lines of code"  
echo "- **Complexity/KLOC**: Cyclomatic complexity per 1000 lines of code"
echo "- **Technical Debt/KLOC**: Estimated time to fix issues (minutes per 1000 lines)"
echo "- **Focus**: Rule adherence and immediate code quality issues"
echo ""
echo "### Why Scores Are Not Directly Comparable"
echo "- **Different Philosophies**: IC measures architectural health vs SQ measures rule compliance"
echo "- **Different Scales**: IC uses composite 0-100 scale vs SQ uses individual metrics"
echo "- **Different Priorities**: IC focuses on maintainability vs SQ focuses on defect prevention"
echo ""
echo "## Complexity Comparison Methodology"
echo "**InsightCode Total Complexity** = avgComplexity × totalFiles"
echo "**SonarQube Total Complexity** = Direct total from API"
echo ""
echo "This provides a fair comparison since both represent the total cyclomatic complexity of the analyzed codebase."
echo ""
echo "## SonarQube Analysis Reliability Improvements"
echo ""
echo "**Intelligent Analysis Polling:**"
echo "- Replaces fixed 15-second wait with dynamic task status monitoring"
echo "- Uses \`/api/ce/component\` API to track analysis completion"
echo "- Adaptive timeouts: 10min (standard), 20min (angular/typescript/eslint)"
echo "- Robust error handling with automatic retry mechanism"
echo ""
echo "**Recommended actions:**"
echo "- Review the 'LOC Analysis & Path Debugging' table above"
echo "- Verify that both tools analyze the same source directories"
echo "- Consider aligning source paths for more accurate comparison"
} > "$REPORT_FILE"

echo "✅ Benchmark finished!"
echo "📄 Report: $REPORT_FILE"
echo ""
echo "Quick Results:"
grep -A 20 "| Project" "$REPORT_FILE" | head -15
