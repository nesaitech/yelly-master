# Changelog & Release Notes Patterns

## Keep a Changelog Format

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.3.0] - 2025-04-01

### Added
- User export endpoint for bulk data download (#234)
- Rate limiting middleware with configurable thresholds (#241)

### Changed
- Default pagination limit increased from 20 to 50 (#238)

### Fixed
- Race condition in concurrent database writes (#221)
- Memory leak in WebSocket connection handler (#229)

### Security
- Upgrade `jsonwebtoken` to 9.0.2 to address CVE-2023-XXXXX (#245)

## [1.2.1] - 2025-03-15

### Fixed
- Incorrect timezone handling in scheduled jobs (#218)
```

## Conventional Commits

### Prefixes and Their Meanings
| Prefix | Category | Version Bump |
|--------|----------|-------------|
| `feat:` | Added | Minor |
| `fix:` | Fixed | Patch |
| `docs:` | Documentation | Patch |
| `chore:` | Maintenance | None |
| `refactor:` | Changed | None |
| `test:` | Testing | None |
| `perf:` | Performance | Patch |
| `ci:` | CI/CD | None |
| `feat!:` | Breaking | Major |
| `fix!:` | Breaking fix | Major |

### Examples
```
feat: add user export endpoint
fix: resolve race condition in database writes
docs: update API reference for v1.3
chore: upgrade dependencies
refactor!: rename UserService to AccountService
```

## SemVer Decision Matrix

| Change Type | Example | Bump |
|-------------|---------|------|
| Remove a public API | Delete an endpoint | Major |
| Change return type | Object shape changes | Major |
| Rename a function | `getUser` -> `fetchUser` | Major |
| Add a new endpoint | New GET /api/exports | Minor |
| Add optional parameter | New query param with default | Minor |
| Fix incorrect behavior | Wrong status code returned | Patch |
| Performance improvement | Faster query execution | Patch |
| Internal refactor | Restructure modules | None |
| Update dev dependency | Bump eslint version | None |

## Release Notes vs Changelog Distinction

### Changelog (for developers)
```markdown
### Fixed
- Fix race condition in `DatabasePool.acquire()` when concurrent
  connections exceed `maxPoolSize` (#221)
```

### Release Notes (for users)
```markdown
### Bug Fixes
- Fixed an issue where simultaneous requests could occasionally
  fail with a "connection unavailable" error. This primarily
  affected high-traffic deployments.
```

### Key Differences
- **Audience**: Changelog targets developers; release notes target end users.
- **Language**: Changelog uses technical terms; release notes use plain language.
- **Scope**: Changelog includes all changes; release notes only include user-visible ones.
- **References**: Changelog links to PRs/issues; release notes may link to docs.

## Automated Changelog Generation

### From Git Log
```bash
# Get commits since last tag
git log $(git describe --tags --abbrev=0)..HEAD --oneline

# Get commits grouped by conventional commit type
git log $(git describe --tags --abbrev=0)..HEAD --format="%s" | grep "^feat:" 
git log $(git describe --tags --abbrev=0)..HEAD --format="%s" | grep "^fix:"
```

### Automation Checklist
1. Parse commit messages for conventional commit prefixes
2. Group by category (Added, Fixed, Changed, etc.)
3. Extract PR numbers and issue references
4. Detect breaking changes from `!` suffix or `BREAKING CHANGE` footer
5. Calculate version bump from highest-priority category
6. Generate formatted markdown entry
7. Prepend to CHANGELOG.md under `[Unreleased]` or new version heading
