Execute NPM publication workflow for version $ARGUMENTS:
1. Verify all tests pass
2. Check self-analysis score is acceptable
3. Update version in package.json
4. Update CHANGELOG.md
5. Build the project
6. Create git tag
7. Publish to NPM (dry-run first)
8. Update docs/AI_CONTEXT.md with new version