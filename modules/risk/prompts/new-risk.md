# New Risk

## Step 1: Gather the inputs

Ask the user (one question at a time, only what is missing):

- **Title** — short, present-tense statement (e.g., "Stripe webhook duplication")
- **Description** — the conditional statement: "If <X> happens, then <Y>."
- **Category** — technical, schedule, scope, team, external, security
- **Impact (1-5)** — how bad is Y if it happens?
- **Probability (1-5)** — how likely is X in the next 90 days?
- **Owner** — single named person
- **Mitigation** — what reduces I or P
- **Contingency** — what limits damage if it happens
- **Due date** — when the mitigation is in place

Do NOT proceed if **owner**, **mitigation**, or **contingency** is empty for any risk with severity ≥7. These are required.

## Step 2: Compute severity

`severity = impact × probability`. Categorize:

- 1-6: Low
- 7-12: Medium
- 13-19: High
- 20-25: Critical

If severity ≥20, warn the user that this risk will block deploys until mitigated.

## Step 3: Append to active register

Open `docs/8hour/risks/active.md` (create with a one-line header if missing). Append a new H2 block using `templates/risk.md.tmpl`. Generate a unique `risk_id` from date + slug: `risk-YYYY-MM-DD-<slug>`.

## Step 4: Update 8HOUR.md

- Re-read `active.md`, sort all risks by severity descending, take the top 5
- `replaceSection("top-risks", <top 5 formatted>)`
- `appendToSection("decision-log", "- YYYY-MM-DD — Risk added: <title> (severity <S>)")`
- `stampFrontmatter(content, { updated_by: "/8hour-lead risk", 8hour_lead_version })`

## Step 5: Commit

```bash
git add docs/8hour/risks/active.md 8HOUR.md
git commit -m "docs(risk): add <title> (severity <S>)"
```

## Step 6: Report

Tell the user:
- The new risk's severity score and category
- Whether it now appears in the top 5 (8HOUR.md)
- The owner and due date
- Whether the deploy gate is now blocking (severity ≥20)
