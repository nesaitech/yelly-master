# Post-Release Retrospective

Analyze the full development cycle of a release: from the previous tag to the current one.

## Data Collection

1. Identify the release range: `git describe --tags --abbrev=0` for current, and the tag before it.
2. Run `git log --oneline [prev-tag]..[current-tag]` for all commits in the release.
3. Run `git diff --stat [prev-tag]..[current-tag]` for scope of changes.
4. Check the release timeline: how long between tags?

## Output Format

```markdown
# Release Retro: [version]

## Release Summary
- Version: [X.Y.Z]
- Release date: [date]
- Development period: [N days]
- Total commits: [N]
- Contributors: [N]

## What Shipped
### Features
- [Feature description] (#PR)

### Bug Fixes
- [Fix description] (#PR)

### Other
- [Refactors, docs, chores]

## Release Health
- Time from code freeze to release: [N hours/days]
- Hotfixes required after release: [N]
- Rollback needed: [yes/no]

## What Went Well
- [Observation]

## What Didn't Go Well
- [Observation]

## Action Items for Next Release
- [ ] [Action] — Owner: @person
```

## Guidelines

- Compare this release against the previous one. Is the team shipping faster, slower, or the same?
- If hotfixes were needed, trace them to root cause: was it insufficient testing, missed edge case, or environment difference?
- Propose process improvements that would have caught issues earlier.
