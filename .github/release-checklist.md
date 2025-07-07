# Release Checklist

- [ ] Update version in package.json
- [ ] Update CHANGELOG.md with release date
- [ ] Run tests: `npm test`
- [ ] Build: `npm run build`
- [ ] Commit changes: `git commit -am "chore: Release v0.X.X"`
- [ ] Create git tag: `git tag v0.X.X`
- [ ] Push changes: `git push && git push --tags`
- [ ] Publish to NPM: `npm publish`
- [ ] Create GitHub release
- [ ] Update .ai.md status