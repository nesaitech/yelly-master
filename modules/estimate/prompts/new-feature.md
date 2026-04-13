# Estimate a Feature

## Step 1: Gather the inputs

Ask the user (one question at a time, only what is missing):

- **Topic** — short name of the feature
- **Scope** — what is in, what is out
- **Constraints** — any deadlines, dependencies, team availability

## Step 2: Decompose

Break into leaf tasks ≤1 day each. Show the list to the user for confirmation BEFORE estimating. If the user says the decomposition is wrong, fix it before continuing.

## Step 3: 3-point estimate per task

For each task, ask the user (or propose, if you have enough context) O/M/P. Validate that P ≥ M ≥ O and that P is at most ~4× O (a wider spread means the task needs more decomposition).

## Step 4: PERT and aggregate

Compute E and σ per task. Sum into `E_total` and `σ_total = sqrt(sum(σ_i^2))`. Compute P50/P80/P95.

## Step 5: Risk adjustment

Cross-load `modules/risk/guide.md`. Read `docs/8hour/risks/active.md` if it exists. If any active risks impact this work, apply the configured `risk_factor_default` (or a higher factor with explicit reason). Document the multiplier and reason.

## Step 6: Historical calibration

Read `.8hour/history/estimates.jsonl`. If ≥5 entries, compute `bias = mean(actual / estimated)` over the last 10. Apply if `bias != 1.0` (within 5%). If <5 entries, warn the user that calibration is not yet meaningful and propose a flat 40% buffer instead.

## Step 7: Render and save

Use `templates/estimate.md.tmpl`. Fill placeholders. Save to `docs/8hour/estimates/YYYY-MM-DD-<kebab-topic>.md`.

## Step 8: Update 8HOUR.md

`replaceSection("active-work", <bullet list>)` → add this estimate as a bullet linking to the file.
`appendToSection("decision-log", ...)`.
`stampFrontmatter(...)`.

## Step 9: Commit

```bash
git add docs/8hour/estimates/<file>.md 8HOUR.md
git commit -m "docs(estimate): <topic> — <P50>d (P80 <P80>d)"
```

## Step 10: Report

Show the user:
- Final estimate: P50, P80, P95
- Risk multiplier (if any) and reason
- Historical bias correction (if any)
- Reminder: close the estimate when the work ships, with `/8hour-lead estimate --close <id>`
