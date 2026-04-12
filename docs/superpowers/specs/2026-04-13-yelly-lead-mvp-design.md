---
title: yelly-lead MVP — Tech Lead Mega-Skill
date: 2026-04-13
author: /yelly-lead brainstorming session
status: approved
phase: 0 (MVP)
target_version: 0.2.0
supersedes: none
related:
  - modules/plan/guide.md (will delegate in Phase 1)
---

# yelly-lead MVP — Tech Lead Mega-Skill

## 1. Summary

Add a fifth mega-skill `/yelly-lead` to yelly-master, providing tech lead capabilities
that are currently missing: rigorous time estimation, risk management, architecture
decision records, and technical debt prioritization. Phase 0 (MVP) ships 4 modules.
Phase 1 (later) adds `requirements`, `api-design`, `data-model`.

The MVP introduces a project-level context file (`YELLY.md` at root) that captures
project state and prevents context loss across AI sessions — inspired by superpowers'
spec/plan persistence pattern.

## 2. Motivation

The existing 4 mega-skills cover engineering (yelly-code), operations (yelly-ops),
quality (yelly-quality), and team (yelly-team). A tech lead needs **strategic**
capabilities beyond these: deciding what is worth building, estimating time honestly,
tracking risks, recording architectural decisions, and prioritizing technical debt.

Today these responsibilities are either absent or buried as prompts inside other
modules (e.g., `plan/prompts/api-design.md`). Without first-class support, tech leads
using yelly-master must invent their own process each session, and lose context
between sessions.

## 3. Goals

- Ship 4 new modules (`estimate`, `risk`, `adr`, `debt`) as a new mega-skill `/yelly-lead`
- Introduce `YELLY.md` (project root) as a durable, git-tracked project context file
- Introduce `docs/yelly/` as a directory for append-only artifacts
- Enable session continuity — a new AI session reads `YELLY.md` at start
- Integrate with existing mega-skills via cross-module loading (no duplication)
- Match existing module structure and quality bar (~200 lines guide, ~150 lines patterns)

## 4. Non-Goals (Phase 0)

- `requirements`, `api-design`, `data-model` modules — defer to Phase 1
- Refactor of `plan/guide.md` to delegate Phase 1 functionality — defer to Phase 1
- Automated telemetry / network calls — all data stays local
- Team-wide collaboration features (e.g., multi-user editing UI)
- Integration with specific issue trackers beyond best-effort CLI detection (gh, jira CLI)
- GUI / dashboard / web interface
- Phase 1 Next.js / Vercel documentation sites (out of scope)

## 5. Architecture

### 5.1 Mega-skill layout

```
skills/yelly-lead/
├── SKILL.md.tmpl              # Routing + permission pre-flight
└── SKILL.md                   # Generated per host

modules/
├── estimate/                  # 3-point, PERT, planning poker, calibration
├── risk/                      # Register, matrix, mitigation, integration hooks
├── adr/                       # Nygard format, NNNN sequential naming
└── debt/                      # Methodology + hybrid export (issue tracker or local)
```

### 5.2 Project-level artifacts

```
<project-root>/
├── YELLY.md                   # Project state snapshot (always current, git-tracked, ≤400 lines)
└── docs/yelly/
    ├── adr/
    │   ├── 0001-use-postgres.md
    │   └── 0002-queue-library.md
    ├── estimates/
    │   └── 2026-04-13-checkout-flow.md
    ├── risks/
    │   ├── active.md
    │   └── archive/
    │       └── 2026-04.md
    ├── debt/
    │   └── register.md        # Only when no issue tracker detected
    └── decisions/
        └── archive.md         # Decision Log rotation target
```

Hidden internal state:

```
<project-root>/.yelly/
├── history/
│   └── estimates.jsonl        # Append-only estimate accuracy tracking
├── cache/
│   └── issue-tracker.json     # Detected tracker config
└── state.lock                 # Mutex for concurrent updates
```

`.yelly/` is git-ignored by the bootstrap flow (adds to `.gitignore`).

### 5.3 Module structure (same as existing)

Each module contains:

```
modules/<name>/
├── guide.md                   # Methodology, ~200 lines
├── patterns.md                # Reference library, ~150 lines
├── config.yaml                # Permissions, detail_level, integrations
├── prompts/
│   ├── <primary-scenario>.md
│   └── <secondary-scenario>.md
└── hooks/
    ├── pre.sh                 # Load YELLY.md, detect tracker
    └── post.sh                # Update YELLY.md, append artifact
```

## 6. Module Specifications

### 6.1 `estimate`

**Purpose:** Produce honest, calibrated time estimates for features and projects.

**Methodology (guide.md outline):**
1. Scope decomposition — break into leaf tasks of ≤1 day
2. 3-point estimate — optimistic (O), most likely (M), pessimistic (P)
3. PERT formula — `E = (O + 4M + P) / 6`, `σ = (P - O) / 6`
4. Confidence interval — P50 (E), P80 (E + σ), P95 (E + 2σ)
5. Risk adjustment — multiply by risk factor from `risk` module
6. Historical calibration — load `.yelly/history/estimates.jsonl`, compute bias
7. Output — estimate document with range, confidence, assumptions, risks
8. Closure — when feature ships, user runs `/yelly-lead estimate --close <id>` to record actual

**Patterns (patterns.md):** planning poker, reference class forecasting, cone of uncertainty.

**Prompts:**
- `new-feature.md` — estimate a single feature
- `close-estimate.md` — record actual, update calibration

**Config defaults:**
```yaml
default_confidence: 0.8        # P80
risk_factor_default: 1.2
min_tasks_for_pert: 3
bias_correction: true          # use historical data
permissions:
  tools: [Read, Grep, Glob, Bash]
  file_access:
    read: ["**/*"]
    write: ["docs/yelly/estimates/**/*", "YELLY.md", ".yelly/history/**/*"]
```

### 6.2 `risk`

**Purpose:** Maintain a living risk register that integrates with existing workflows.

**Methodology (guide.md outline):**
1. Identify — technical, schedule, scope, team, external risks
2. Classify — impact (1-5) × probability (1-5) = severity (1-25)
3. Mitigate — for each risk: owner, mitigation, contingency, due date
4. Track — `docs/yelly/risks/active.md`, top 5 surface in `YELLY.md`
5. Integrate:
   - `deploy` pre-flight reads `active.md`, blocks on severity ≥20 without sign-off
   - `review` cross-references risks when diff touches listed files
   - `estimate` module consumes risk factor for adjustment
6. Archive — when closed, move to `docs/yelly/risks/archive/YYYY-MM.md` with outcome

**Patterns (patterns.md):** risk heatmap ASCII, STRIDE for security risks, standard mitigation templates.

**Prompts:**
- `new-risk.md` — add a risk to the register
- `deploy-gate.md` — pre-deploy risk review

**Config defaults:**
```yaml
severity_threshold_block: 20   # deploy gate threshold
severity_threshold_warn: 12
active_risks_in_yelly_md: 5
permissions:
  tools: [Read, Grep, Glob, Bash, Edit]
  file_access:
    read: ["**/*"]
    write: ["docs/yelly/risks/**/*", "YELLY.md"]
```

### 6.3 `adr`

**Purpose:** Record architecture decisions in a standard, reviewable format.

**Methodology (guide.md outline):**
1. Detect trigger — a decision is ADR-worthy when it (a) is hard to reverse, (b) affects multiple modules, (c) rules out alternatives the team considered
2. Use Nygard format — Title, Status, Context, Decision, Consequences, Alternatives Considered
3. Naming — `docs/yelly/adr/NNNN-kebab-title.md`, NNNN sequential zero-padded
4. Status lifecycle — proposed → accepted → superseded-by-NNNN / rejected / deprecated
5. Link — every ADR links back to the spec / PR that introduced it
6. Surface — latest 5 ADRs appear in `YELLY.md` Architecture Decisions section

**Patterns (patterns.md):** Nygard template, MADR alternative, common decision types (build vs buy, framework choice, data model).

**Prompts:**
- `new-adr.md` — create a new ADR
- `supersede-adr.md` — mark an ADR superseded, link forward

**Config defaults:**
```yaml
format: nygard                 # alternatives: madr
numbering: sequential-padded-4
latest_in_yelly_md: 5
permissions:
  tools: [Read, Grep, Glob, Bash, Edit]
  file_access:
    read: ["**/*"]
    write: ["docs/yelly/adr/**/*", "YELLY.md"]
```

### 6.4 `debt`

**Purpose:** Identify, classify, and prioritize technical debt without duplicating issue trackers.

**Methodology (guide.md outline):**
1. Detect tracker — check for `.github/`, Jira CLI, Linear CLI, GitLab; cache in `.yelly/cache/issue-tracker.json`
2. Scan sources — `yelly-quality/health` report, `TODO` / `FIXME` / `HACK` comments, complexity hotspots
3. Classify — maintainability, reliability, security, performance, test coverage
4. Prioritize — cost (days to fix) × risk (probability of biting) × blocker (blocks other work?)
5. Export strategy:
   - If tracker detected → create issues via CLI, tag with `tech-debt` + category
   - If no tracker → write `docs/yelly/debt/register.md`
6. Surface — top 5 debt items (by priority × cost-to-fix ratio) in `YELLY.md`
7. Resolution — when debt item closed, remove from top 5 (auto from tracker, manual for local)

**Patterns (patterns.md):** SQALE model, prudent vs reckless debt matrix, payoff vs postpone heuristics.

**Prompts:**
- `scan.md` — full project debt scan
- `prioritize.md` — rebalance top 5

**Config defaults:**
```yaml
export_to_tracker: auto        # auto | always | never
categories: [maintainability, reliability, security, performance, test-coverage]
top_n_in_yelly_md: 5
permissions:
  tools: [Read, Grep, Glob, Bash, Edit]
  bash_commands:
    - "gh issue *"
    - "jira issue *"
    - "linear issue *"
  file_access:
    read: ["**/*"]
    write: ["docs/yelly/debt/**/*", "YELLY.md"]
```

## 7. `YELLY.md` Schema

Versioned frontmatter + structured sections. Max 400 lines enforced by post-hook.

```markdown
---
yelly_version: 1
yelly_lead_version: 0.2.0
last_updated: 2026-04-13T14:23:00Z
last_updated_by: /yelly-lead estimate
schema: project-state
---

# YELLY — Project Tech Lead Context

> Auto-generated by /yelly-lead. Do not edit manually except for pinned notes.
> Regenerate with `yelly-lead-sync`.

## Project Snapshot
- **Stack:** <detected>
- **Phase:** <from bootstrap prompt>
- **Team:** <size>
- **Current focus:** <one line>

## Active Work
<links to latest specs/plans/estimates in progress, bullet list>

## Architecture Decisions (latest 5)
<links to adr/NNNN-*.md, one line each>

## Top Risks (live, top 5 by severity)
<numbered list with severity score, mitigation status, owner>

## Tech Debt (top 5)
<numbered list with cost-to-fix and impact>

## Decision Log (last 10)
<date — decision — reasoning, one line each>

## Open Questions
<bullet list, manually curated>

## Pinned Notes
<free-form, preserved across regeneration>
```

**Merge strategy:**
- `Decision Log`, `Open Questions`, `Pinned Notes` → append-only, merge-friendly
- `Project Snapshot`, `Top Risks`, `Tech Debt`, `Active Work`, `Architecture Decisions` → last-write-wins (rewritten each update)
- Post-hook performs `git pull --rebase` if tree clean before writing; if tree dirty → skip rebase, warn user

**Version field maintenance:** `yelly_lead_version` in frontmatter is sourced from the root `VERSION` file at each update. Migration script (`migrations/v0.X.Y-*.ts`) runs automatically when the parsed `yelly_lead_version` is behind the installed version.

## 8. Bootstrap Flow (first-run)

When `/yelly-lead` runs and `YELLY.md` does not exist:

1. **Detect** — scan `package.json` / `go.mod` / `requirements.txt` / `Cargo.toml` for stack
2. **Read README** — extract project name, description, badges
3. **Scan git** — commit count, contributor count (proxy for team size), last commit date
4. **Prompt user** — 3 questions max:
   - Current project phase? (idea / MVP / beta / production / maintenance)
   - Current focus? (one sentence)
   - Team size override? (default: detected)
5. **Generate** `YELLY.md` from `templates/YELLY.md.tmpl` with detected + answered values
6. **Scaffold** `docs/yelly/{adr,estimates,risks,decisions}/` with `.gitkeep` placeholders
7. **Add** `.yelly/` to `.gitignore` if not present
8. **Commit** — message: `chore(yelly): initialize project tech lead context`
9. **Report** — show user what was created and how to invoke modules

Bootstrap lives in `lib/yelly-lead/bootstrap.ts`, called from SKILL.md routing when `YELLY.md` missing.

## 9. Session Continuation Protocol

Every `/yelly-lead` invocation follows this order:

1. **Check `YELLY.md`** — if missing → trigger bootstrap
2. **Read `YELLY.md`** — load full content into context
3. **Parse frontmatter** — verify `yelly_version` is current, else run migration
4. **Route** — match request to module based on routing table
5. **Load module** — `guide.md` always, `patterns.md` + prompt if relevant
6. **Execute** — perform task, possibly cross-load other modules
7. **Update** — post-hook writes back to `YELLY.md` + appends to `docs/yelly/*`
8. **Validate** — post-hook checks `YELLY.md` size ≤400 lines. If over: rotate oldest half of `Decision Log` entries into `docs/yelly/decisions/archive.md`; archive resolved items from `Top Risks` / `Tech Debt` into respective archive files.

**Cross-mega-skill loading path:** Since `yelly-lead` modules need to read guides from other mega-skills, use the shared `{{MODULES_ROOT}}` template variable (already populated by setup script). All modules live under one `modules/` tree regardless of which mega-skill exposes them, so paths are resolved as `{{MODULES_ROOT}}/<module-name>/guide.md`.

**CLAUDE.md injection — host compatibility:**
- Claude Code: append `@YELLY.md` line to `~/.claude/CLAUDE.md` if exists, else prompt user to create one
- Codex / Cursor / Windsurf / Kiro: append to respective instructions file per host config
- If the target instructions file does not exist: create a minimal one referencing only `YELLY.md`
- All injection operations are idempotent (check existing line before appending)
- Setup script records injections in `~/.yelly-master/injections.log` so uninstall can reverse them

## 10. Cross-Mega-Skill Integration

`yelly-lead` modules **consume** data from existing mega-skills via cross-module loading:

| From | Data | Used by | Purpose |
|------|------|---------|---------|
| `yelly-quality/health` | complexity, churn, coverage | `debt` | Candidate detection |
| `yelly-code/review` | PR history, diff stats | `estimate`, `risk` | Velocity, hotspots |
| `yelly-ops/deploy` | release log, rollback rate | `risk` | Production stability signal |
| `yelly-team/retro` | action items, patterns | `debt`, YELLY.md open questions | Surface recurring issues |

No new code needed — existing `Read: modules/<other>/guide.md` pattern works.

## 11. CLI Tools

Three new binaries in `bin/`:

- **`yelly-lead-sync`** — regenerate `YELLY.md` from `docs/yelly/` sources (useful after manual edits or drift)
- **`yelly-lead-validate`** — check `YELLY.md` frontmatter, ADR filenames, orphan files in `docs/yelly/`
- **`yelly-lead-stats`** — compute estimate accuracy, risk closure rate, ADR count, debt burn-down

All three are thin TypeScript wrappers around `lib/yelly-lead/*` modules. Exposed via `package.json` scripts and `bin/` symlinks.

## 12. File Inventory

### New files

| Path | Purpose | Est. lines |
|------|---------|-----------:|
| `modules/estimate/guide.md` | methodology | 220 |
| `modules/estimate/patterns.md` | reference | 150 |
| `modules/estimate/config.yaml` | config | 25 |
| `modules/estimate/prompts/new-feature.md` | scenario | 60 |
| `modules/estimate/prompts/close-estimate.md` | scenario | 40 |
| `modules/estimate/hooks/pre.sh` | pre-hook | 15 |
| `modules/estimate/hooks/post.sh` | post-hook | 30 |
| `modules/risk/*` | same structure | ~500 total |
| `modules/adr/*` | same structure | ~500 total |
| `modules/debt/*` | same structure | ~500 total |
| `skills/yelly-lead/SKILL.md.tmpl` | mega-skill routing | 110 |
| `skills/yelly-lead/SKILL.md` | generated | - |
| `config/yelly-lead.yaml` | mega-skill defaults | 30 |
| `templates/YELLY.md.tmpl` | bootstrap template | 80 |
| `templates/adr.md.tmpl` | ADR template | 40 |
| `templates/estimate.md.tmpl` | estimate template | 30 |
| `templates/risk.md.tmpl` | risk entry template | 25 |
| `lib/yelly-lead/bootstrap.ts` | first-run logic | 200 |
| `lib/yelly-lead/yelly-md-updater.ts` | safe update + merge | 180 |
| `lib/yelly-lead/tracker-detect.ts` | issue tracker detection | 90 |
| `lib/yelly-lead/frontmatter.ts` | parse/write frontmatter | 70 |
| `bin/yelly-lead-sync` | CLI | 40 |
| `bin/yelly-lead-validate` | CLI | 50 |
| `bin/yelly-lead-stats` | CLI | 60 |
| `test/static/yelly-lead.test.ts` | structure tests | 80 |
| `test/unit/yelly-md-updater.test.ts` | unit tests | 120 |
| `test/unit/bootstrap.test.ts` | unit tests | 100 |
| `test/unit/frontmatter.test.ts` | unit tests | 60 |
| `test/integration/yelly-lead-routing.test.ts` | integration | 90 |
| `test/fixtures/yelly-lead-project/` | test fixture | - |
| `migrations/v0.2.0-yelly-lead.ts` | migration script | 50 |
| `docs/yelly-lead/OVERVIEW.md` | user guide | 150 |
| `docs/yelly-lead/YELLY_MD_SCHEMA.md` | schema spec | 100 |

### Modified files

| Path | Change |
|------|--------|
| `README.md` | Update architecture diagram, modules table, quick start |
| `CHANGELOG` | Add `feat(yelly-lead): add tech lead mega-skill (MVP)` |
| `setup` | Register `/yelly-lead` skill, add `@YELLY.md` to host CLAUDE.md |
| `scripts/gen-skills.js` | Support 5 mega-skills instead of 4 |
| `config/defaults.yaml` | Add yelly-lead defaults block |
| `VERSION` | Bump to 0.2.0 |
| `package.json` | Add new npm scripts for bin tools |
| `tsconfig.json` | Include new lib paths if needed |

### Total estimate

- **New files:** ~45
- **Modified files:** ~8
- **New code/content:** ~3500 lines (1400 guide content + 800 lib TS + 600 tests + 700 other)

## 13. Task Breakdown (for implementation plan)

High-level task order (details → writing-plans skill):

1. **Foundation** — lib/yelly-lead: frontmatter, bootstrap, updater, tracker-detect + unit tests
2. **Templates** — YELLY.md, adr, estimate, risk templates
3. **Module: adr** — simplest, good calibration baseline (Nygard well-defined)
4. **Module: debt** — hybrid tracker detection, export paths
5. **Module: estimate** — calibration history, PERT math
6. **Module: risk** — integration hooks with deploy/review
7. **Mega-skill: yelly-lead SKILL.md.tmpl** — routing, permission pre-flight, bootstrap trigger
8. **CLI tools** — sync, validate, stats
9. **Setup script integration** — register skill, update CLAUDE.md injection
10. **gen-skills.js** — 5 mega-skill support
11. **Migration script** — v0.2.0
12. **Tests** — static, integration, e2e on fixture project
13. **Docs** — README, CHANGELOG, OVERVIEW, SCHEMA
14. **Version bump + release notes**

## 14. Acceptance Criteria

The MVP ships when all of the following pass:

1. `npm test` passes — static, unit, integration suites green
2. `npx tsc --noEmit` passes
3. `./setup` registers `/yelly-lead` for Claude Code + Codex + Cursor + Windsurf + Kiro
4. First-run on a fresh test fixture generates `YELLY.md` + `docs/yelly/` skeleton + `.gitignore` entry
5. `/yelly-lead estimate <feature>` produces a document in `docs/yelly/estimates/` and updates `YELLY.md` Active Work section
6. `/yelly-lead adr "use Postgres"` creates `docs/yelly/adr/0001-use-postgres.md` in Nygard format and updates `YELLY.md` Architecture Decisions section
7. `/yelly-lead risk` updates `docs/yelly/risks/active.md` and `YELLY.md` Top Risks section
8. `/yelly-lead debt` either creates issues in detected tracker or writes `docs/yelly/debt/register.md`, and updates `YELLY.md` Tech Debt section
9. A new AI session (fresh Claude/Codex instance) automatically reads `YELLY.md` via CLAUDE.md injection and demonstrates retained context
10. `YELLY.md` stays under 400 lines after 20 simulated updates (governance test)
11. `yelly-lead-sync`, `yelly-lead-validate`, `yelly-lead-stats` CLI tools execute without error on fixture
12. `README.md`, `CHANGELOG`, `docs/yelly-lead/OVERVIEW.md`, `docs/yelly-lead/YELLY_MD_SCHEMA.md` all updated
13. `VERSION` bumped to 0.2.0
14. Migration script runs cleanly on an existing 0.1.x install

## 15. Open Questions

None blocking implementation. Items for Phase 1 consideration:

- **Historical data sharing** — should estimate calibration data be opt-in shareable across projects (same user)? Defer.
- **Multi-tech-lead coordination** — YELLY.md merge conflicts in teams >2 leads. Defer; observe real usage first.
- **`plan` module refactor** — `requirements` module (Phase 1) requires `plan/guide.md` Phase 1 to delegate. Design that refactor when Phase 1 starts, not now.
- **Risk integration with deploy** — the `risk` module guide describes a deploy pre-flight check, but the `deploy` module itself is unchanged in MVP. Document the integration as best-effort for MVP; formal `deploy` module update deferred.

## 16. Phase 1 (Out of Scope — Recorded for Continuity)

After MVP validation (expected after ~2 weeks of real usage):

- `requirements` module — user stories, Gherkin acceptance criteria, PRD review
- `api-design` module — promoted from `plan/prompts/api-design.md`
- `data-model` module — promoted from `plan/prompts/data-model.md`
- `plan/guide.md` refactor — Phase 1 delegates to `requirements`, Phase 4 delegates to `api-design` / `data-model`
- Potentially: `stakeholder`, `release`, `observability`, `incident`, `cost` — Sub-projects 2 and 3 from brainstorming
