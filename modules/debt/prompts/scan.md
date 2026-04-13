# Debt Scan

Run a full project debt scan and surface the top 5.

## Step 1: Detect tracker

Call `detectTracker(projectDir)` from `lib/8hour-lead/tracker-detect.ts`. Note the type and CLI availability. Read the user's preference from `config/8hour-lead.yaml: debt.export_to_tracker`.

Decision matrix:

| Preference | Tracker detected | CLI available | Action |
|---|---|---|---|
| `auto` | yes | yes | Export to tracker |
| `auto` | yes | no | Local fallback + warn user |
| `auto` | no | — | Local fallback |
| `always` | yes | yes | Export to tracker |
| `always` | otherwise | — | Error: cannot export |
| `never` | — | — | Local fallback |

## Step 2: Scan all sources

Run, in parallel where possible:
- `grep -RInE 'TODO\|FIXME\|HACK\|XXX' src/ lib/ app/ --include='*.ts' --include='*.js' --include='*.py' --include='*.go'`
- Read any existing `health` module output (if present)
- `find src/ lib/ -type f -name '*.ts' -o -name '*.py' | xargs wc -l | sort -n | tail -20` for large files
- `npm outdated --json 2>/dev/null` (or pip/cargo equivalent)

Aggregate into a candidate list (id, title, source, raw context).

## Step 3: Classify and score

For each candidate:
- Pick a category from the 5
- Score Cost (C), Risk (R), Blocker (B) per the guide
- Compute `score = (R + B) / C`

Sort descending. Trim to the top 20.

## Step 4: Export

Apply the action from Step 1's matrix. For tracker export, file each top-20 item as a separate issue with the standard body format from the guide. For local fallback, write all 20 to `docs/8hour/debt/register.md` (idempotent: stable IDs).

## Step 5: Update 8HOUR.md

Surface the top 5 in the `tech-debt` section of `8HOUR.md`. Format each as:

```
1. **<title>** — score <s>, cost <C>d, category <category>
   <one-line description>
```

Append to Decision Log: `- YYYY-MM-DD — Debt scan: <N candidates>, top 5 surfaced`.

Stamp frontmatter.

## Step 6: Report to user

Show the top 5 with priority scores. Tell the user how many candidates were found, where they were exported (tracker URL or local file), and the next step (`/8hour-lead debt prioritize` to rebalance later).
