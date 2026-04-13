# Supersede an ADR

Use when a previous ADR is being replaced by a new decision.

## Step 1: Confirm the supersession is correct

A new ADR supersedes an old one when the new decision **overrides** the old. If the new decision is *additional* (not contradictory), write a new ADR without superseding.

Confirm with the user:
- Which ADR number is being superseded?
- Does the new decision contradict the old one, or add to it?

## Step 2: Write the new ADR

Follow `prompts/new-adr.md` to draft the replacement. In the new ADR's `## Status` section and frontmatter, note that it supersedes the old one:

```yaml
---
adr_number: 0007
status: accepted
supersedes: 0003
---
```

In the body's Status section: `Accepted — supersedes ADR-0003`.

## Step 3: Update the old ADR

Edit only the frontmatter and Status section of the old ADR — do NOT modify Context, Decision, Consequences, or Alternatives.

```yaml
---
adr_number: 0003
status: superseded-by-0007
superseded_by: 0007
---
```

Body Status section: `Superseded by ADR-0007 on YYYY-MM-DD.`

## Step 4: Update 8HOUR.md

The "Architecture Decisions (latest 5)" section should now show the NEW ADR. The superseded ADR no longer counts as "latest" unless it is among the 5 most recent by date.

Append to Decision Log:
`- YYYY-MM-DD — ADR-0007 supersedes ADR-0003 (<short reason>)`

## Step 5: Commit

```bash
git add docs/8hour/adr/0007-*.md docs/8hour/adr/0003-*.md 8HOUR.md
git commit -m "docs(adr): 0007 supersedes 0003 — <title>"
```

Report both ADR numbers in the final summary.
