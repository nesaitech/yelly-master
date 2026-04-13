# Rebalance Debt Top 5

Use when the user wants to re-prioritize the existing debt list (e.g., after closing items, after a new initiative, or before a planning meeting).

## Step 1: Load current state

- Read `YELLY.md` Tech Debt section to see the current top 5
- Detect the tracker. If exported, fetch all open `tech-debt` labeled issues. If local, read `docs/yelly/debt/register.md`.

## Step 2: Re-score in light of new context

Ask the user (one question at a time, only what is missing):
- Has any planned work changed that affects Blocker (B) scores?
- Have any items been silently fixed and need closing?
- Is there a new constraint (deadline, hire, dependency upgrade) that changes Risk (R) scores?

Update C/R/B for items that changed. Recompute `score = (R + B) / C`.

## Step 3: Re-rank

Sort. New top 5 may differ. Note items that dropped out (so the user knows why).

## Step 4: Update YELLY.md

`replaceSection("tech-debt", <new top 5>)`. Append a Decision Log entry: `- YYYY-MM-DD — Debt re-prioritized: <added>, <dropped>`. Stamp.

## Step 5: Report

Show the diff: items added to top 5, items dropped, items re-scored. No commits to issue tracker (that is a separate close action).
