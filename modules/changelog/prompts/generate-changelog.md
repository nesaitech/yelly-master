# Generating Changelog from Git History

Analyze commits since the last release and produce a formatted changelog entry.

## Process

1. **Find the last release tag.**
   ```bash
   git describe --tags --abbrev=0
   ```

2. **Collect commits since last tag.**
   ```bash
   git log $(git describe --tags --abbrev=0)..HEAD --format="%H %s" --reverse
   ```

3. **Categorize each commit.** Parse the conventional commit prefix. If no prefix, infer from the diff:
   - New files with new exports = Added
   - Modified existing behavior = Changed
   - Deleted code paths = Removed
   - Bug-related keywords (fix, resolve, patch) = Fixed
   - Security-related changes = Security

4. **Detect breaking changes.** Check for:
   - `!` after the commit type (e.g., `feat!:`)
   - `BREAKING CHANGE:` in the commit body
   - Removed public exports or changed function signatures

5. **Format the entry.** Use Keep a Changelog sections. Each line item should:
   - Start with a verb (Add, Fix, Change, Remove)
   - Be understandable without reading the code
   - Reference the PR or issue number

6. **Calculate version bump.**
   - Any breaking change = major bump
   - Any `feat:` without breaking = minor bump
   - Only `fix:`, `perf:`, `docs:` = patch bump

## Output

Prepend the new entry to CHANGELOG.md under a new version heading or under `[Unreleased]`.

## Guidelines

- Do not include merge commits or CI-only changes in the changelog.
- Group related commits into a single entry when they address the same feature.
- If the commit history is messy, prioritize clarity over completeness.
