# Writing User-Facing Release Notes

Transform the technical changelog into release notes that users and stakeholders can understand.

## Process

1. **Start from the changelog.** Read the generated changelog entry for this version.

2. **Filter for user-visible changes.** Remove:
   - Internal refactors with no behavior change
   - CI/CD changes
   - Dev dependency updates
   - Test-only changes

3. **Rewrite in plain language.** For each remaining item:
   - Replace technical jargon with user-facing descriptions
   - Explain the impact: what can users do now that they couldn't before?
   - For bug fixes: describe the symptom that was fixed, not the root cause

4. **Organize by impact.** Group changes into:
   - Highlights (the 1-3 most important changes, with detail)
   - Improvements (smaller enhancements)
   - Bug Fixes (user-visible fixes)
   - Breaking Changes (with migration instructions)

5. **Add context where helpful.** Link to documentation for new features. Provide before/after examples for behavior changes.

## Output Format

```markdown
# Release Notes: v[X.Y.Z]

## Highlights

### [Feature Name]
[2-3 sentence description of what it does and why it matters]

## Improvements
- [Plain-language description of enhancement]

## Bug Fixes
- Fixed an issue where [user-visible symptom]

## Breaking Changes
- [What changed and how to migrate]
```

## Guidelines

- Write for someone who uses the product but does not read the source code.
- Lead with the most exciting or impactful change.
- Keep it concise — if the full changelog exists, link to it for details.
- Include a thank-you to contributors if it is an open source project.
