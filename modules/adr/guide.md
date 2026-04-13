# ADR Module — Methodology Guide

Architecture Decision Records (ADRs) capture the *why* behind significant technical decisions in a structured, reviewable, immutable format. ADRs are written when the team reaches a decision worth remembering, and are updated only by superseding them with a new ADR.

This module follows Michael Nygard's classic ADR format. The goal is not bureaucracy — it is to give future developers (and your future self) the context that justified a decision so they can change it intentionally rather than accidentally.

## When to write an ADR

A decision is ADR-worthy if **at least one** is true:

1. It is **hard to reverse** — undoing it later costs days, not minutes.
2. It **affects multiple modules or teams** — changing it ripples through the codebase.
3. It **rules out alternatives the team seriously considered** — the decision is a fork in the road, not a default.
4. It **encodes a tradeoff** that a future reader could reasonably question.

If none of these apply, do not write an ADR. Code comments and PR descriptions are enough.

**Examples that deserve an ADR:**
- Choosing PostgreSQL over MongoDB for the primary data store
- Adopting Prisma over hand-rolled SQL
- Using a queue for async processing (which queue, with what guarantees)
- Splitting a monolith into two services

**Examples that do NOT deserve an ADR:**
- Renaming a function
- Adding a new endpoint that follows existing patterns
- Choosing between two equivalent libraries when no one cares

## Workflow

### Step 1: Confirm the decision is ADR-worthy

Walk through the four criteria above. If unclear, ask the user. Do not write an ADR for trivial choices.

### Step 2: Find the next ADR number

```bash
ls docs/8hour/adr/ 2>/dev/null | grep -E '^[0-9]+-' | sort -n | tail -1
```

The next ADR is `NNNN+1`, zero-padded to 4 digits.

### Step 3: Generate the ADR file

Use `templates/adr.md.tmpl` (from Plan 1). Fill the placeholders:
- `{{ADR_NUMBER}}` — zero-padded 4-digit number
- `{{TITLE}}` — short, present-tense, decision-statement form ("Use Postgres", not "Postgres or MongoDB")
- `{{DATE}}` — today's ISO date (YYYY-MM-DD)
- `{{CONTEXT}}` — what forces the decision exists; what are the constraints
- `{{DECISION}}` — what we are doing, in one paragraph
- `{{POSITIVE_CONSEQUENCE}}`, `{{NEGATIVE_CONSEQUENCE}}`, `{{NEUTRAL_CONSEQUENCE}}` — the tradeoffs we accept
- `{{ALTERNATIVE_TITLE}}`, `{{ALTERNATIVE_DESCRIPTION}}`, `{{ALTERNATIVE_REJECTION}}` — at least one rejected alternative with reasoning
- `{{SPEC_LINK}}`, `{{PR_LINK}}` — references back to the work that introduced the decision

Save as `docs/8hour/adr/NNNN-kebab-title.md`.

### Step 4: Update `8HOUR.md`

Add a one-line entry to the "Architecture Decisions (latest 5)" section using `lib/8hour-lead/8hour-md-updater.ts:replaceSection` with the section name `"architecture-decisions"`. Trim the list to the 5 most recent ADRs.

Append a one-line entry to "Decision Log (last 10)" via `appendToSection("decision-log", ...)`.

Stamp the frontmatter with `stampFrontmatter(content, { updated_by: "/8hour-lead adr", 8hour_lead_version })`.

### Step 5: Commit the ADR

```bash
git add docs/8hour/adr/NNNN-*.md 8HOUR.md
git commit -m "docs(adr): NNNN — <title>"
```

## Status lifecycle

ADRs progress through these statuses, recorded in the `status:` frontmatter:

- **proposed** — drafted but not yet approved by the team
- **accepted** — agreed and in effect
- **superseded-by-NNNN** — replaced by a later ADR (do NOT delete the original)
- **rejected** — considered but not adopted (kept for the record)
- **deprecated** — no longer relevant but not yet superseded

To supersede an ADR, write a new one and update the old one's `status:` and `superseded_by:` fields. Never edit the body of an accepted ADR — write a new one instead.

## What goes in each section

### Context
Forces in play, constraints, what the team had to balance. Two to four short paragraphs. Avoid jargon a future hire would not understand.

### Decision
A single paragraph. Active voice, present tense, declarative. "We use Postgres for primary storage." Not "We will probably use Postgres."

### Consequences
Honest. Include the negatives. If you cannot name a downside, you have not thought about it hard enough. List positive, negative, and neutral consequences separately.

### Alternatives Considered
At least one rejected alternative with the reasoning. This is what makes an ADR valuable — anyone can see what the decision was, but only an ADR records what was rejected and why.

## Anti-patterns

- **One-line ADRs.** If the context fits in one line, you do not need an ADR.
- **Editing accepted ADRs.** Once accepted, write a new ADR and supersede.
- **Decision without alternatives.** No alternatives means no decision was actually made.
- **No consequences section.** Every decision has tradeoffs. List them.
- **ADRs as task tickets.** ADRs record decisions, not work items. Use the issue tracker for work.

## Cross-module references

- `templates/adr.md.tmpl` — the file format
- `lib/8hour-lead/8hour-md-updater.ts` — how `8HOUR.md` is updated
- `modules/risk` — risks identified during ADR consideration may go to the risk register
- `modules/estimate` — significant ADRs often warrant a fresh estimate of the affected work
