# Debt Module — Methodology Guide

Technical debt is the gap between the codebase you have and the codebase you would write today. This module helps a tech lead identify, classify, and prioritize debt without duplicating the team's issue tracker.

The core principle is **single source of truth**. If the team uses GitHub Issues, Jira, or Linear, debt items live there — this module just helps surface, classify, and prioritize them. If the team has no tracker, the module falls back to a local `docs/yelly/debt/register.md`.

## When to scan for debt

- After a major release, when the team has bandwidth to plan
- During retrospectives, to surface recurring pain points
- Before estimating a large feature, to know what blockers exist
- When onboarding a new engineer, to give them the honest map

Do NOT run debt scans during a crunch — debt awareness without time to act creates demoralization, not progress.

## Workflow

### Step 1: Detect the issue tracker

Use `lib/yelly-lead/tracker-detect.ts:detectTracker(projectDir)`. The function returns:

- `type: "github" | "gitlab" | "jira" | "linear" | "none"`
- `cliAvailable: boolean`

Behavior:
- `type === "none"` OR `cliAvailable === false` → use local fallback
- `type === "github"` AND `cliAvailable` → use `gh issue create` to file findings
- `type === "gitlab"` AND `cliAvailable` → use `glab issue create`
- `type === "jira" / "linear"` AND `cliAvailable` → use respective CLI

The user can override with `config/yelly-lead.yaml: debt.export_to_tracker: never|always|auto`. Default is `auto`.

### Step 2: Scan sources

Look in **all** of the following:

1. **Code comments:** `grep -RIn 'TODO\|FIXME\|HACK\|XXX' src/ lib/ app/`
2. **Health module report:** if `modules/health` has produced a report, read it for complexity hotspots, churn, low coverage
3. **Test gaps:** files in `src/` or `lib/` with no matching test file
4. **Stale dependencies:** `npm outdated --json`, `pip list --outdated`, etc., depending on language
5. **Long files:** any source file over 500 lines is a debt candidate
6. **Duplication:** if a duplication detector is configured, read its output

### Step 3: Classify

Each debt item gets one of these categories:

| Category | What it covers |
|---|---|
| `maintainability` | Long files, tangled responsibilities, missing abstractions |
| `reliability` | Missing error handling, race conditions, fragile retries |
| `security` | Outdated deps with CVEs, missing input validation, weak auth |
| `performance` | Known-slow paths, missing indices, N+1 queries |
| `test-coverage` | Untested business logic, brittle tests, missing integration coverage |

If an item fits multiple categories, pick the most actionable one.

### Step 4: Prioritize

Score each item with three factors (each 1-5):

- **Cost (C):** how many days to fix?
- **Risk (R):** how likely is it to bite us in the next 90 days?
- **Blocker (B):** does it block other planned work? (1 = no, 5 = blocks Q2 roadmap)

**Priority score:** `(R + B) / C` — favors high-impact, low-cost items.

Sort descending. The top 5 by score go in `YELLY.md` Tech Debt section.

### Step 5: Export

**If tracker detected and CLI available:**

```bash
gh issue create --title "[debt] <short>" --body "$(cat <<'BODY'
**Category:** <category>
**Cost:** <C>d
**Risk:** <R>/5
**Blocker:** <B>/5
**Priority score:** <score>

<long description>
BODY
)" --label "tech-debt,<category>"
```

**If no tracker:**

Write to `docs/yelly/debt/register.md`. Use a stable section per item (so re-runs can update without duplicating). Format:

```markdown
## DEBT-<id>: <title>

- **Category:** <category>
- **Cost:** <C>d  |  **Risk:** <R>/5  |  **Blocker:** <B>/5  |  **Score:** <score>
- **Status:** open | done

### Description
<long description>

### Suggested approach
<one paragraph>

### Resolution (filled when closed)
_pending_
```

### Step 6: Update YELLY.md

- `replaceSection(content, "tech-debt", <top 5 formatted>)`
- `appendToSection(content, "decision-log", "- YYYY-MM-DD — Debt scan: <N> items found, <K> in top 5")`
- `stampFrontmatter(content, { updated_by: "/yelly-lead debt", yelly_lead_version })`

### Step 7: Commit

```bash
git add YELLY.md docs/yelly/debt/register.md
git commit -m "chore(debt): scan — <N> items, top <K> surfaced"
```

## Closing debt

When a debt item is fixed:

- **If exported to tracker:** close the issue via the tracker's normal workflow. The next debt scan will pick up the change.
- **If local register:** mark the item's `status:` as `done`, fill in the `Resolution` block.

Closed items drop out of the top 5 automatically on the next scan.

## Anti-patterns

- **Filing debt without a fix path.** Every debt item needs at least a "suggested approach". Naming a problem without proposing a direction is grumbling, not debt management.
- **Top 100 debt lists.** Top 5 only. If something is not in the top 5, it is not urgent. The list re-ranks every scan.
- **Treating all TODOs as debt.** Some `TODO` comments mark intentional incomplete work in flight. Filter to TODOs older than 30 days, or with no associated PR.
- **Counting the absence of features as debt.** Missing features go in the product backlog, not the debt register.

## Cross-module references

- `lib/yelly-lead/tracker-detect.ts` — issue tracker detection
- `modules/health` — provides complexity / churn / coverage reports as input
- `modules/refactor` — the methodology to *fix* debt items (this module identifies them)
- `modules/risk` — high-risk debt items may also warrant a risk register entry
