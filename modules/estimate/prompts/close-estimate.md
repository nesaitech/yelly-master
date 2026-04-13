# Close an Estimate

Use when a feature has shipped and you want to record the actual time taken.

## Step 1: Identify the estimate

Ask the user for the estimate ID (e.g., `est-2026-04-12`) or topic name. Find the matching file in `docs/8hour/estimates/`.

## Step 2: Ask for the actual

How many days did the work actually take? Round to the nearest 0.5 day.

## Step 3: Compute the error

`error = actual - P50`. Compute as a signed value (positive = took longer than P50). Also compute the ratio `actual / P50`.

## Step 4: Update the estimate file

Edit the Closure section of the estimate document:
- `Actual days: <actual>`
- `Error vs P50: <signed error>d (<ratio>×)`
- `Calibration note: <one sentence about why it differed>`

Set the frontmatter `status: closed`.

## Step 5: Append to history

Add a line to `.8hour/history/estimates.jsonl`:

```json
{"id":"<id>","topic":"<topic>","estimated":<P50>,"actual":<actual>,"error":<error>,"date":"YYYY-MM-DD"}
```

Make sure `.8hour/history/` exists; create it if not. Make sure `.8hour/` is in `.gitignore`.

## Step 6: Update 8HOUR.md

- Remove the entry from `active-work`
- `appendToSection("decision-log", "- YYYY-MM-DD — Closed <id>: actual <actual>d (P50 was <P50>d)")`
- Stamp.

## Step 7: Commit

```bash
git add docs/8hour/estimates/<file>.md 8HOUR.md
git commit -m "docs(estimate): close <id> — actual <actual>d"
```

## Step 8: Report calibration impact

After appending the new data point, recompute the bias factor over the last 10 entries. Report the new bias to the user — this is the immediate feedback loop that makes the next estimate more accurate.
