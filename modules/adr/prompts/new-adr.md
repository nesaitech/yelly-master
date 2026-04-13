# New ADR

Use this prompt when the user asks to record a new architecture decision.

## Step 1: Confirm ADR-worthiness

Walk through the four criteria from the guide:
1. Hard to reverse?
2. Affects multiple modules or teams?
3. Rules out alternatives that were seriously considered?
4. Encodes a tradeoff a future reader could question?

If none apply, propose recording the decision in the PR description or a code comment instead.

## Step 2: Gather inputs

Ask the user (one question at a time, only what is missing):

- **Title** — short, decision-statement form ("Use Postgres", not "Database choice").
- **Context** — what forces are in play? What constraints exist?
- **Decision** — what is the team doing?
- **Tradeoffs** — name at least one positive and one negative consequence.
- **Alternatives** — what else was considered? Why was it rejected?
- **References** — link to spec, PR, or design doc if any.

## Step 3: Find the next ADR number

```bash
ls docs/8hour/adr/ 2>/dev/null | grep -E '^[0-9]+-' | sort -n | tail -1
```

If the directory is empty, start at `0001`. Otherwise the next number is `last + 1`, zero-padded to 4 digits.

## Step 4: Render and save

Use `templates/adr.md.tmpl`. Substitute every `{{PLACEHOLDER}}` with the gathered inputs. Save to `docs/8hour/adr/NNNN-kebab-title.md`.

## Step 5: Update 8HOUR.md

- `replaceSection(content, "architecture-decisions", <new latest 5>)`
- `appendToSection(content, "decision-log", "- YYYY-MM-DD — Recorded ADR-NNNN: <title>")`
- `stampFrontmatter(content, { updated_by: "/8hour-lead adr", 8hour_lead_version })`

## Step 6: Commit

```bash
git add docs/8hour/adr/NNNN-*.md 8HOUR.md
git commit -m "docs(adr): NNNN — <title>"
```

Report the ADR number and the file path.
