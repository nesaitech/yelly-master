# 8hour-lead — User Guide

`/8hour-lead` is the tech-lead mega-skill. Use it to record architecture decisions, scan and prioritize technical debt, produce calibrated time estimates, and maintain a living risk register — all anchored in a per-project `8HOUR.md` context file.

## What it gives you

- **`adr`** — record architecture decisions in Nygard format
- **`debt`** — scan for tech debt, classify, prioritize, optionally export to your issue tracker
- **`estimate`** — produce PERT-based 3-point estimates with historical bias correction
- **`risk`** — maintain a severity-scored risk register with optional deploy gate

All four modules write to two places:

1. **`8HOUR.md`** at the project root — a 200-400 line snapshot of project state, always current
2. **`docs/8hour/`** — durable artifacts (one ADR per file, one estimate per file, an active risk register, a closed risk archive)

`8HOUR.md` is git-tracked and team-visible. Sections are delimited by HTML comment markers so updates are idempotent. The Decision Log is append-only; everything else is regenerated when the underlying artifacts change.

## First-run bootstrap

The first time you invoke `/8hour-lead` in a project, the bootstrap flow runs:

1. Detects your stack (Node / Python / Go / Rust + frameworks + databases)
2. Reads your README and git history (commits, contributors)
3. Asks you three questions: phase (idea / MVP / beta / production / maintenance), current focus, team size
4. Generates `8HOUR.md` from `templates/8HOUR.md.tmpl`
5. Scaffolds `docs/8hour/{adr,estimates,risks,decisions}/`
6. Adds `.8hour/` to `.gitignore`
7. Commits `chore(8hour): initialize project tech lead context`

You only do this once per project.

## Daily workflow

### Recording an ADR

```
/8hour-lead "we decided to use Postgres over MongoDB for the primary store"
```

The `adr` module asks for the rationale, alternatives, and consequences, finds the next ADR number (`0001`, `0002`, ...), writes the file to `docs/8hour/adr/NNNN-use-postgres.md` in Nygard format, and updates the Architecture Decisions section of `8HOUR.md`.

### Estimating a feature

```
/8hour-lead "estimate the checkout flow"
```

The `estimate` module decomposes the work into ≤1-day tasks, asks for 3-point estimates per task (Optimistic / Most Likely / Pessimistic), computes PERT (`E = (O + 4M + P) / 6`), aggregates variances, applies a risk multiplier, and corrects against historical bias from `.8hour/history/estimates.jsonl`. Output: a P50/P80/P95 estimate document in `docs/8hour/estimates/<date>-checkout-flow.md`.

When the work ships, close the estimate to feed the calibration loop:

```
/8hour-lead "close estimate est-2026-04-13 — actual was 11 days"
```

### Scanning tech debt

```
/8hour-lead "scan for tech debt"
```

The `debt` module greps for TODO/FIXME/HACK comments, reads any health module output, finds long files, checks stale dependencies, classifies each candidate (maintainability / reliability / security / performance / test-coverage), scores priority as `(risk + blocker) / cost`, and either exports to your issue tracker (gh / glab / jira / linear, auto-detected) or writes to `docs/8hour/debt/register.md` as a fallback.

### Tracking a risk

```
/8hour-lead "add a risk: Stripe webhook duplication"
```

The `risk` module asks for impact, probability, owner, mitigation, contingency, and due date. Computes severity as `impact × probability`. Severity ≥20 blocks deploys via the `risk deploy-gate` prompt. Top 5 risks surface in `8HOUR.md`.

## Session continuity

Every time you start a new AI session in the same project, the AI reads `8HOUR.md` first. Your project state — current phase, active work, latest ADRs, top risks — is restored without asking. This is the pattern that prevents context loss across sessions.

For Claude Code users, add `@8HOUR.md` to your `~/.claude/CLAUDE.md` so that even non-8hour-lead invocations have the context. (Other hosts: add the equivalent reference to your host instructions file.)

## CLI tools

```bash
npm run 8hour-lead-sync     # regenerate 8HOUR.md from docs/8hour/ artifacts
npm run 8hour-lead-validate # check 8HOUR.md schema, ADR filenames, 400-line cap
npm run 8hour-lead-stats    # show ADR count, active risks, estimate calibration bias
```

`8hour-lead-sync` is useful when you have manually edited an ADR or risk file and want `8HOUR.md` to pick up the change without invoking the AI. `8hour-lead-validate` runs in CI to catch schema drift. `8hour-lead-stats` is your report card.

## File layout

```
<your-project>/
├── 8HOUR.md                        # auto-generated, git-tracked, ≤400 lines
├── .8hour/                         # internal state, git-ignored
│   └── history/
│       └── estimates.jsonl         # estimate calibration data (append-only)
└── docs/8hour/
    ├── adr/
    │   ├── 0001-use-postgres.md
    │   └── 0002-stripe-over-paddle.md
    ├── estimates/
    │   └── 2026-04-13-checkout-flow.md
    ├── risks/
    │   ├── active.md
    │   └── archive/
    │       └── 2026-04.md
    ├── debt/
    │   └── register.md             # only when no issue tracker detected
    └── decisions/
        └── archive.md              # rotated old Decision Log entries
```

## Configuration

Defaults live in `config/defaults.yaml` and `config/8hour-lead.yaml`. User overrides go in `~/.8hour-master/config.yaml`:

```yaml
adr:
  format: nygard          # alternative: madr
  numbering: sequential-padded-4
  latest_in_8hour_md: 5

debt:
  export_to_tracker: auto # auto | always | never
  top_n_in_8hour_md: 5

estimate:
  default_confidence: 0.8
  risk_factor_default: 1.2
  bias_correction: true
  min_history_for_calibration: 5

risk:
  severity_threshold_block: 20
  severity_threshold_warn: 12
  active_risks_in_8hour_md: 5

8hour_lead:
  8hour_md:
    max_lines: 400
    decision_log_max_entries: 10
```

## What 8hour-lead does NOT do

- It does not replace your issue tracker. Debt items are exported to your tracker when one is detected.
- It does not estimate by itself. Decomposition + 3-point ranges + your judgment do the work; the math is just bookkeeping.
- It does not block deploys without explicit configuration. The `risk deploy-gate` prompt returns a status; the `deploy` module decides what to do with it.
- It is not a project management tool. It is a place to record decisions, risks, debt, and estimates so you can reason about them later.

## Phase 1 (later)

After MVP validation, three more modules are planned: `requirements` (user stories, acceptance criteria, PRD review), `api-design` (REST/GraphQL design, versioning, breaking changes), `data-model` (DB schema review, migration strategy). These will be promoted from prompts in the existing `plan` module.

## Where to file feedback

- Issues: `https://github.com/nesaitech/8hour-master/issues`
- Spec: `docs/superpowers/specs/2026-04-13-8hour-lead-mvp-design.md`
