# Estimate Module — Methodology Guide

Engineering estimates are notoriously bad. This module gives a tech lead a *defensible*, *calibrated* process — not because the math is magic, but because explicit decomposition + 3-point ranges + historical bias correction beat gut-feeling ranges by a wide margin.

The goal is **honest** estimates with **stated confidence**, not optimistic estimates that protect a deadline.

## When to use this module

- When a stakeholder asks "how long?" for a feature
- Before committing to a release date
- When prioritizing — `score = value / effort` requires knowing effort
- When detecting feasibility — if the estimate is 10× longer than the budget, surface it early

Do NOT use for trivial tasks (<1 day). Gut feel is fine for those.

## Workflow

### Step 1: Decompose

Break the work into leaf tasks of **at most 1 day** each. If a task is bigger, split it. Decomposition is the single largest source of estimate error — work that is "one big thing" almost never matches its estimate.

For each leaf task, write a one-line description. Save them in a numbered list.

### Step 2: 3-point estimate per task

For each leaf task, ask:
- **Optimistic (O):** if everything goes right, how long?
- **Most Likely (M):** if the day is normal, how long?
- **Pessimistic (P):** if reasonable problems appear (without a major incident), how long?

P should be 2-4× O for typical tasks. If the spread is much larger, the task is poorly understood and needs more decomposition.

### Step 3: PERT calculation per task

For each task, compute:

- **Expected (E):** `E = (O + 4M + P) / 6`
- **Standard deviation (σ):** `σ = (P - O) / 6`

### Step 4: Aggregate

Sum the per-task expectations and variances:

- `E_total = sum(E_i)`
- `σ_total = sqrt(sum(σ_i^2))`  ← variances add, not standard deviations

Translate to confidence intervals (assuming roughly normal distribution):

- **P50:** `E_total`
- **P80:** `E_total + σ_total`
- **P95:** `E_total + 2 * σ_total`

### Step 5: Risk adjustment

Cross-reference the `risk` module. If any active risks affect the work, multiply by a risk factor (default `1.2`, configurable). Document the multiplier and reason.

### Step 6: Historical calibration

Read `.8hour/history/estimates.jsonl` (append-only, one JSON object per closed estimate). Each line is shaped like:

```json
{"id":"est-2026-04-12","topic":"checkout flow","estimated":8,"actual":11,"date":"2026-04-12"}
```

Compute the historical bias: `bias = mean(actual / estimated)` over the last 10 closed estimates. If `bias > 1.0`, multiply the current estimate by `bias`. If there are fewer than 5 data points, do not apply correction (warn the user instead).

### Step 7: Output

Use `templates/estimate.md.tmpl` (from Plan 1). Fill the placeholders:
- Decomposition table
- PERT calculation
- Risk adjustment line
- Final estimate with confidence and bias note
- Assumptions

Save to `docs/8hour/estimates/YYYY-MM-DD-<topic>.md`.

### Step 8: Update 8HOUR.md

- `replaceSection("active-work", <updated bullet list including this estimate>)`
- `appendToSection("decision-log", "- YYYY-MM-DD — Estimated <topic>: <P50>d (P80 <P80>d)")`
- `stampFrontmatter(content, { updated_by: "/8hour-lead estimate", 8hour_lead_version })`

### Step 9: Commit

```bash
git add docs/8hour/estimates/<file>.md 8HOUR.md
git commit -m "docs(estimate): <topic> — <P50>d (P80 <P80>d)"
```

## Closing an estimate

When the work ships, run `/8hour-lead estimate --close <id>`. The module:

1. Reads the estimate file, asks for `actual` days
2. Computes `error = actual - P50`
3. Updates the estimate file's "Closure" section
4. Appends a line to `.8hour/history/estimates.jsonl`
5. Updates the 8HOUR.md Decision Log: `- YYYY-MM-DD — Closed estimate <id>: actual <actual>d, error <error>d`

This is what builds the calibration data set. **Without closing estimates, calibration cannot improve.**

## Anti-patterns

- **Single-point estimates.** "Two weeks" is a wish, not an estimate. Always give a range.
- **Optimistic O.** O is "everything went right and the work was easier than expected." If you cannot imagine that, your O is wrong.
- **Hiding the bias multiplier.** If history says you take 1.4× your estimates, write `1.4×` on the estimate document. Hiding it does not make the team faster.
- **Not closing estimates.** Without actual data, calibration is impossible. Close every estimate, even when the actual is wildly off — *especially* then.

## Cross-module references

- `templates/estimate.md.tmpl` — output format
- `modules/risk` — supplies the risk factor
- `modules/plan` — large estimates often warrant decomposition into sub-projects (use `plan` for that)
- `lib/8hour-lead/8hour-md-updater.ts` — for 8HOUR.md updates
