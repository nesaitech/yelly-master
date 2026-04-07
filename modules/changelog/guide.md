# Changelog & Release Notes

Generate accurate, well-categorized changelogs and human-readable release notes from git history. Follow Keep a Changelog format and Semantic Versioning to communicate changes clearly to both developers and users.

## Steps

1. **Identify the last release.** Find the most recent git tag (e.g., `v1.2.0`). If no tags exist, use the initial commit as the baseline. This defines the range of commits to analyze.

2. **Collect commits since the last release.** Pull all commits between the last tag and HEAD. Include commit messages, authors, and associated PR numbers or issue references where available.

3. **Categorize changes.** Parse commits using Conventional Commits prefixes where present (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `perf:`, `ci:`). For non-conventional commits, infer category from the diff content and message.

4. **Identify breaking changes.** Look for `BREAKING CHANGE:` footers, `feat!:` or `fix!:` prefixes, and commits that remove or rename public APIs. Breaking changes require a major version bump and prominent placement in the changelog.

5. **Generate the changelog entry.** Format in Keep a Changelog style with sections: Added, Changed, Deprecated, Removed, Fixed, Security. Each entry should be a concise, human-readable sentence with a PR/issue reference.

6. **Determine the version bump.** Apply Semantic Versioning rules: breaking changes bump major, new features bump minor, bug fixes bump patch. If multiple categories are present, the highest-priority bump wins.

7. **Write release notes (optional).** For user-facing releases, translate the technical changelog into plain language. Group by user impact rather than code category. Lead with the most important changes.

8. **Suggest the git tag.** Propose the new version tag based on the calculated bump. Do not create the tag automatically unless configured to do so.

## Semantic Versioning Rules

- **Major (X.0.0):** Breaking changes — removed APIs, changed behavior, incompatible config.
- **Minor (x.Y.0):** New features that are backward-compatible.
- **Patch (x.y.Z):** Bug fixes, performance improvements, documentation updates.

## Principles

- Changelogs are for humans, not machines. Write entries a developer can scan in 10 seconds.
- Every user-visible change deserves a changelog entry. Internal refactors usually do not.
- Release notes and changelogs serve different audiences. The changelog is for developers; release notes are for users.
- Automate generation but always review before publishing. Automated tools miss nuance.
