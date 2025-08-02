# InsightCode vs SonarQube Comparison Guide

## 🚀 Quick Installation

### 1. Prerequisites
- Node.js 18+
- Docker
- Git
- jq (for JSON analysis)

```bash
# Install jq (if needed)
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# Windows (via Chocolatey)
choco install jq
```

### 2. SonarQube Installation

```bash
# Start SonarQube with Docker
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest

# Wait for SonarQube to start (~2 minutes)
# Access http://localhost:9000
# Default login: admin/admin
```

### 3. SonarQube Configuration

1. Create an authentication token:
   - Go to: My Account > Security > Generate Tokens
   - Name: "InsightCode Comparison"
   - Type: "User Token"
   - Copy the generated token

2. Install SonarScanner:
```bash
npm install -g sonar-scanner
```

### 4. InsightCode Installation

```bash
npm install -g insightcode-cli
```

## 📊 Running the Comparison

### Step 1: Prepare Scripts

```bash
# Create working directory
mkdir insightcode-vs-sonarqube
cd insightcode-vs-sonarqube

# Copy scripts from artifacts
# - benchmark-comparison.sh
# - analyze-benchmark-results.js
# - sonar-project.properties

# Make scripts executable
chmod +x benchmark-comparison.sh
chmod +x analyze-benchmark-results.js
```

### Step 2: Configure Token

Edit `benchmark-comparison.sh` and replace:
```bash
SONAR_TOKEN="YOUR_TOKEN_HERE"
```

### Step 3: Run Comparison

```bash
# Execute full benchmark (~30 minutes)
./benchmark-comparison.sh

# Analyze results
node analyze-benchmark-results.js
```

## 📈 Interpreting Results

### Key Metrics

| Metric | InsightCode | SonarQube | Interpretation |
|--------|-------------|-----------|----------------|
| **Score** | 0-100 with A-F grades | A-E ratings | InsightCode more granular |
| **Complexity** | Average per file | Total project | Different approaches |
| **Duplication** | Identical blocks | Similar tokens | SonarQube more sensitive |
| **Performance** | 0.3-52s per project | 4-101s per project | InsightCode 2-3x faster |

### Typical Divergence Cases

1. **Lodash**: 
   - InsightCode: Grade A (100/100) - Improved analysis
   - SonarQube: Grade A
   - Note: Previous architectural penalties resolved

2. **Small projects** (Chalk, UUID):
   - InsightCode: ~0% duplication (strict mode)
   - SonarQube: 0% duplication
   - Reason: High-quality, non-duplicated codebases

3. **TypeScript**:
   - InsightCode: Grade C (complexity/size impact)
   - SonarQube: Grade A (maintainability focus)
   - Reason: Different weighting of architectural vs rule compliance

## 🛠️ Troubleshooting

### Issue: SonarQube won't start
```bash
# Check logs
docker logs sonarqube

# Common solution: increase memory
docker run -d --name sonarqube \
  -p 9000:9000 \
  -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true \
  sonarqube:latest
```

### Issue: SonarQube authentication error
```bash
# Verify token
curl -u YOUR_TOKEN: http://localhost:9000/api/authentication/validate
```

### Issue: Projects too large for analysis
```bash
# For TypeScript/Angular, analyze only certain folders
# Modify in benchmark-comparison.sh:
analyze_path="$path/src"  # instead of entire project
```

## 📋 Expected Results

### Grade Distribution (InsightCode Benchmark)
- **Grade A**: ~44% (Express, Chalk, UUID, Lodash)
- **Grade B**: ~33% (Angular, Jest, ESLint)
- **Grade C**: ~22% (Vue, TypeScript)
- **Grade D**: ~0% (No projects in current benchmark)

### Typical Analysis Times
- **InsightCode**: 0.3-52 seconds per project (varies by size)
  - Small projects (Chalk, Express, UUID, Lodash): <1s
  - Medium projects (ESLint, Jest, Vue): 2-3s
  - Large projects (Angular, TypeScript): 15-52s
- **SonarQube**: 4-101 seconds per project
  - Small projects: 4-5s
  - Medium projects: 16-31s
  - Large projects: 79-101s

### Duplication Differences
- **InsightCode**: Average ~0.02% (strict production mode)
- **SonarQube**: Generally higher (0-5.8%, project dependent)

## 🎯 Usage Recommendations

### Use InsightCode for:
- ✅ Fast feedback during development
- ✅ TypeScript maintainability analysis
- ✅ Architectural hotspot identification
- ✅ Time-constrained CI/CD

### Use SonarQube for:
- ✅ Complete multi-language analysis
- ✅ Bug and vulnerability detection
- ✅ Technical debt tracking over time
- ✅ Enterprise standards compliance

## 📚 Additional Resources

- [InsightCode Documentation](https://github.com/fstepho/insightcode-cli)
- [SonarQube Documentation](https://docs.sonarqube.org/)
- [InsightCode Original Benchmark](./benchmarks/README.md)