# README Update Checklist

Use this checklist after shipping a feature, changing configuration, or modifying the public API.

## Pre-Update

1. Read the current README end-to-end. Note anything that feels stale.
2. Run `git diff $(git describe --tags --abbrev=0)..HEAD -- README.md` to see what has already been updated.
3. Run `git log --oneline $(git describe --tags --abbrev=0)..HEAD` to see what shipped since the last release.

## Sections to Verify

- [ ] **Project description** — Does the one-liner still accurately describe the project?
- [ ] **Badges** — Are CI, coverage, and version badges pointing to correct URLs?
- [ ] **Installation** — Do the install commands work with the current package version?
- [ ] **Quick Start** — Does the quick start example run without errors on a fresh clone?
- [ ] **API Reference** — Are all public functions/endpoints documented? Any new ones missing?
- [ ] **Configuration** — Are all config options listed? Any new defaults changed?
- [ ] **Environment Variables** — Are all required env vars documented with descriptions?
- [ ] **Contributing** — Is the development setup guide still accurate?
- [ ] **License** — Correct and present?

## Post-Update

1. Run any code examples in the README to verify they still work.
2. Check that relative links (e.g., to CONTRIBUTING.md) resolve correctly.
3. Preview the rendered markdown before committing.
