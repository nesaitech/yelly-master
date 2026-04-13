# yelly-lead Plan 2 — 4 Modules Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the 4 yelly-lead modules (`adr`, `debt`, `estimate`, `risk`) — each with `guide.md`, `patterns.md`, `config.yaml`, `prompts/*`, `hooks/*` — following the same structure as the 19 existing modules under `modules/`.

**Architecture:** Content-heavy plan. Each module is a self-contained directory with methodology guide + reference patterns + scenario prompts + permissions config + bash hooks. Modules are loaded on-demand by the `/yelly-lead` mega-skill (Plan 3) and may cross-reference Plan 1's library code (e.g., `lib/yelly-lead/yelly-md-updater.ts`) and templates (`templates/adr.md.tmpl`).

**Tech Stack:** Markdown (guides, patterns, prompts), YAML (config), Bash (hooks). One vitest static test enforces directory structure.

**Spec reference:** `docs/superpowers/specs/2026-04-13-yelly-lead-mvp-design.md` §6 (Module Specifications).

**Dependencies:** Plan 1 must be merged or executed on the same branch — modules reference `lib/yelly-lead/*` and `templates/*` produced by Plan 1.

---

## File Structure

### New files (29 total)

```
modules/adr/
├── guide.md
├── patterns.md
├── config.yaml
├── prompts/
│   ├── new-adr.md
│   └── supersede-adr.md
└── hooks/
    ├── pre.sh
    └── post.sh

modules/debt/
├── guide.md
├── patterns.md
├── config.yaml
├── prompts/
│   ├── scan.md
│   └── prioritize.md
└── hooks/
    ├── pre.sh
    └── post.sh

modules/estimate/
├── guide.md
├── patterns.md
├── config.yaml
├── prompts/
│   ├── new-feature.md
│   └── close-estimate.md
└── hooks/
    ├── pre.sh
    └── post.sh

modules/risk/
├── guide.md
├── patterns.md
├── config.yaml
├── prompts/
│   ├── new-risk.md
│   └── deploy-gate.md
└── hooks/
    ├── pre.sh
    └── post.sh

test/static/yelly-lead-modules.test.ts
```

### Modified files

None.

---

## Task 1: Static test for module structure

**Files:**
- Create: `test/static/yelly-lead-modules.test.ts`

- [ ] **Step 1: Create the test file**

```typescript
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";

const ROOT = join(import.meta.dirname, "..", "..");
const MODULES = join(ROOT, "modules");

const YELLY_LEAD_MODULES = ["adr", "debt", "estimate", "risk"];

const REQUIRED_FILES = [
  "guide.md",
  "patterns.md",
  "config.yaml",
  "prompts",
  "hooks/pre.sh",
  "hooks/post.sh",
];

const REQUIRED_CONFIG_KEYS = ["permissions"];

describe.each(YELLY_LEAD_MODULES)("module %s", (mod) => {
  const dir = join(MODULES, mod);

  it("directory exists", () => {
    expect(existsSync(dir)).toBe(true);
  });

  for (const file of REQUIRED_FILES) {
    it(`has ${file}`, () => {
      expect(existsSync(join(dir, file))).toBe(true);
    });
  }

  it("config.yaml has required keys", () => {
    const configPath = join(dir, "config.yaml");
    if (!existsSync(configPath)) return;
    const parsed = yaml.load(readFileSync(configPath, "utf-8")) as Record<
      string,
      unknown
    >;
    for (const key of REQUIRED_CONFIG_KEYS) {
      expect(parsed).toHaveProperty(key);
    }
  });

  it("guide.md has a title heading", () => {
    const guidePath = join(dir, "guide.md");
    if (!existsSync(guidePath)) return;
    const content = readFileSync(guidePath, "utf-8");
    expect(content).toMatch(/^#\s+\S/m);
  });

  it("guide.md is non-trivial (>50 lines)", () => {
    const guidePath = join(dir, "guide.md");
    if (!existsSync(guidePath)) return;
    const lines = readFileSync(guidePath, "utf-8").split("\n").length;
    expect(lines).toBeGreaterThan(50);
  });

  it("hooks are executable bash", () => {
    for (const hook of ["hooks/pre.sh", "hooks/post.sh"]) {
      const path = join(dir, hook);
      if (!existsSync(path)) continue;
      const content = readFileSync(path, "utf-8");
      expect(content).toMatch(/^#!.*bash/);
    }
  });
});
```

- [ ] **Step 2: Run test (expected to fail until modules exist)**

Run: `npx vitest run test/static/yelly-lead-modules.test.ts`
Expected: FAIL — "directory exists" fails for all 4 modules.

- [ ] **Step 3: Commit the test (failing — TDD red)**

```bash
git add test/static/yelly-lead-modules.test.ts
git commit -m "test(yelly-lead): add module structure test (red — modules pending)"
```

---

## Task 2: ADR module

The simplest module — Nygard format is well-defined, minimal cross-module dependencies.

**Files:**
- Create: `modules/adr/guide.md`
- Create: `modules/adr/patterns.md`
- Create: `modules/adr/config.yaml`
- Create: `modules/adr/prompts/new-adr.md`
- Create: `modules/adr/prompts/supersede-adr.md`
- Create: `modules/adr/hooks/pre.sh`
- Create: `modules/adr/hooks/post.sh`

- [ ] **Step 1: Create `modules/adr/guide.md`**

```markdown
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
ls docs/yelly/adr/ 2>/dev/null | grep -E '^[0-9]+-' | sort -n | tail -1
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

Save as `docs/yelly/adr/NNNN-kebab-title.md`.

### Step 4: Update `YELLY.md`

Add a one-line entry to the "Architecture Decisions (latest 5)" section using `lib/yelly-lead/yelly-md-updater.ts:replaceSection` with the section name `"architecture-decisions"`. Trim the list to the 5 most recent ADRs.

Append a one-line entry to "Decision Log (last 10)" via `appendToSection("decision-log", ...)`.

Stamp the frontmatter with `stampFrontmatter(content, { updated_by: "/yelly-lead adr", yelly_lead_version })`.

### Step 5: Commit the ADR

```bash
git add docs/yelly/adr/NNNN-*.md YELLY.md
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
- `lib/yelly-lead/yelly-md-updater.ts` — how `YELLY.md` is updated
- `modules/risk` — risks identified during ADR consideration may go to the risk register
- `modules/estimate` — significant ADRs often warrant a fresh estimate of the affected work
```

- [ ] **Step 2: Create `modules/adr/patterns.md`**

```markdown
# ADR Module — Reference Patterns

A catalog of common ADR types with templates and examples.

---

## Pattern: Build vs Buy

When deciding whether to build a capability in-house or adopt a third-party solution.

**Context section should cover:**
- What capability is needed and why
- Cost of building (engineering time, ongoing maintenance)
- Cost of buying (license, integration effort, vendor risk)
- Strategic value of owning the capability

**Decision form:** "We adopt <vendor> for <capability>" or "We build <capability> in-house."

**Required alternatives:** at least one of the unchosen options, with cost comparison.

---

## Pattern: Framework or Library Choice

When picking among multiple libraries that solve the same problem.

**Context section should cover:**
- The problem and constraints (size, ecosystem, team familiarity)
- Specific deal-breakers (license, SSR support, bundle size, etc.)

**Decision form:** "We use <library> for <purpose>."

**Alternatives:** the top 2-3 contenders with specific reasons for rejection (not "less popular").

---

## Pattern: Data Model Decision

When choosing a database, schema strategy, or data architecture.

**Context section should cover:**
- Read/write patterns (ratio, peak load)
- Consistency requirements (strong vs eventual)
- Query complexity (analytical vs transactional)
- Operational constraints (managed service availability, team skills)

**Decision form:** "We store <data> in <database> using <schema strategy>."

**Common neutral consequence:** vendor lock-in is rarely worth fighting in the early phase.

---

## Pattern: Architectural Boundary

When deciding how to split a monolith, where to draw service boundaries, or which module owns a capability.

**Context section should cover:**
- Why the current boundary is wrong (or why a new one is needed)
- What the new boundary protects against
- The cost of getting the boundary wrong

**Decision form:** "<Module A> owns <capability>. <Module B> consumes <capability> via <interface>."

**Required alternatives:** at least one alternative split, with a concrete scenario showing why it is worse.

---

## Pattern: Process Decision

When deciding how the team will work — branching strategy, code review process, deployment frequency.

**Context section should cover:**
- The problem the current process causes
- Constraints (team size, geography, compliance)

**Decision form:** "We <do this> for <reason>. The <person/role> is responsible."

**Common pitfall:** process ADRs that nobody reads. Keep them short and post the link in the team channel.

---

## Anti-pattern: "Status quo" ADRs

Do NOT write an ADR to document something that was never a decision. ADRs record forks in the road, not defaults. If everyone always knew we would use TypeScript, there is no ADR to write.

## Status field reference

```yaml
status: proposed              # drafted, awaiting review
status: accepted              # agreed and active
status: superseded-by-0007    # replaced; original kept for history
status: rejected              # considered, not adopted
status: deprecated            # no longer relevant; rarely used directly
```

When an ADR is superseded, also update `superseded_by:` in the original's frontmatter.
```

- [ ] **Step 3: Create `modules/adr/config.yaml`**

```yaml
detail_level: high
format: nygard
numbering: sequential-padded-4
latest_in_yelly_md: 5
require_alternatives: true
permissions:
  tools:
    - Read
    - Grep
    - Glob
    - Bash
    - Edit
    - Write
  bash_commands:
    - "git log *"
    - "git diff *"
    - "ls docs/yelly/adr/*"
  file_access:
    read: "**/*"
    write: "docs/yelly/adr/**/*"
    write_extra:
      - "YELLY.md"
  dangerous: []
```

- [ ] **Step 4: Create `modules/adr/prompts/new-adr.md`**

```markdown
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
ls docs/yelly/adr/ 2>/dev/null | grep -E '^[0-9]+-' | sort -n | tail -1
```

If the directory is empty, start at `0001`. Otherwise the next number is `last + 1`, zero-padded to 4 digits.

## Step 4: Render and save

Use `templates/adr.md.tmpl`. Substitute every `{{PLACEHOLDER}}` with the gathered inputs. Save to `docs/yelly/adr/NNNN-kebab-title.md`.

## Step 5: Update YELLY.md

- `replaceSection(content, "architecture-decisions", <new latest 5>)`
- `appendToSection(content, "decision-log", "- YYYY-MM-DD — Recorded ADR-NNNN: <title>")`
- `stampFrontmatter(content, { updated_by: "/yelly-lead adr", yelly_lead_version })`

## Step 6: Commit

```bash
git add docs/yelly/adr/NNNN-*.md YELLY.md
git commit -m "docs(adr): NNNN — <title>"
```

Report the ADR number and the file path.
```

- [ ] **Step 5: Create `modules/adr/prompts/supersede-adr.md`**

```markdown
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

## Step 4: Update YELLY.md

The "Architecture Decisions (latest 5)" section should now show the NEW ADR. The superseded ADR no longer counts as "latest" unless it is among the 5 most recent by date.

Append to Decision Log:
`- YYYY-MM-DD — ADR-0007 supersedes ADR-0003 (<short reason>)`

## Step 5: Commit

```bash
git add docs/yelly/adr/0007-*.md docs/yelly/adr/0003-*.md YELLY.md
git commit -m "docs(adr): 0007 supersedes 0003 — <title>"
```

Report both ADR numbers in the final summary.
```

- [ ] **Step 6: Create `modules/adr/hooks/pre.sh`**

```bash
#!/bin/bash
# Pre-adr: list existing ADRs so the AI knows the next number.
ls docs/yelly/adr/ 2>/dev/null || true
```

- [ ] **Step 7: Create `modules/adr/hooks/post.sh`**

```bash
#!/bin/bash
# Post-adr: validate the latest ADR has all required Nygard sections.
latest=$(ls -t docs/yelly/adr/*.md 2>/dev/null | head -1)
if [ -z "$latest" ]; then
  exit 0
fi
for section in "## Status" "## Context" "## Decision" "## Consequences" "## Alternatives Considered"; do
  if ! grep -q "^$section" "$latest"; then
    echo "WARN: $latest missing section: $section" >&2
  fi
done
exit 0
```

- [ ] **Step 8: Make hooks executable**

```bash
chmod +x modules/adr/hooks/pre.sh modules/adr/hooks/post.sh
```

- [ ] **Step 9: Run module structure test**

Run: `npx vitest run test/static/yelly-lead-modules.test.ts`
Expected: tests for module `adr` should now pass; tests for `debt`, `estimate`, `risk` still fail.

- [ ] **Step 10: Commit**

```bash
git add modules/adr/
git commit -m "feat(yelly-lead): add adr module (Nygard ADRs with supersede flow)"
```

---

## Task 3: Debt module

Hybrid: detects an issue tracker via `lib/yelly-lead/tracker-detect.ts` and exports findings to it; falls back to a local `docs/yelly/debt/register.md` when no tracker is available.

**Files:**
- Create: `modules/debt/guide.md`
- Create: `modules/debt/patterns.md`
- Create: `modules/debt/config.yaml`
- Create: `modules/debt/prompts/scan.md`
- Create: `modules/debt/prompts/prioritize.md`
- Create: `modules/debt/hooks/pre.sh`
- Create: `modules/debt/hooks/post.sh`

- [ ] **Step 1: Create `modules/debt/guide.md`**

```markdown
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
gh issue create --title "[debt] <short>" --body "$(cat <<'EOF'
**Category:** <category>
**Cost:** <C>d
**Risk:** <R>/5
**Blocker:** <B>/5
**Priority score:** <score>

<long description>
EOF
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
git add YELLY.md docs/yelly/debt/register.md  # only if local fallback was used
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
```

- [ ] **Step 2: Create `modules/debt/patterns.md`**

```markdown
# Debt Module — Reference Patterns

Common debt categories with detection heuristics and prioritization hints.

---

## SQALE-inspired classification

The SQALE method (Software Quality Assessment based on Lifecycle Expectations) classifies debt by what quality dimension is degraded. We use a simplified five-category version:

| Category | Detection signal | Why it matters |
|---|---|---|
| `maintainability` | files >500 LOC, cyclomatic complexity >20, deep nesting | Slows every future change |
| `reliability` | missing error handling, untested retries, race conditions | Surfaces as production incidents |
| `security` | known CVEs, missing input validation, weak crypto | One bad bug can leak data |
| `performance` | known-slow endpoints, N+1 queries, missing caches | Degrades user experience |
| `test-coverage` | files with no test sibling, mutation score <60% | Slows every refactor |

---

## Prudent vs Reckless debt

From Martin Fowler's debt quadrant — used to decide whether to forgive a debt item or punish it.

|              | Deliberate              | Inadvertent                       |
|---|---|---|
| **Prudent**  | "Ship now, fix in 2 weeks" | "Now we know how it should be"  |
| **Reckless** | "We do not have time for tests" | "What is layering?"          |

- **Prudent + Deliberate:** acceptable. Track the followup, ship.
- **Prudent + Inadvertent:** the most common kind. Refactor when convenient.
- **Reckless + Deliberate:** do NOT accept. Push back at decision time.
- **Reckless + Inadvertent:** training opportunity. Pair-program to fix.

When prioritizing, reckless items get a +1 risk bump.

---

## Cost estimation heuristics

Rough mapping from observable signals to days-to-fix:

| Signal | Typical cost |
|---|---|
| Single function, well-tested module | 0.5d |
| Single file, untested | 1-2d |
| Multi-file refactor in one module | 3-5d |
| Cross-module API change | 5-10d |
| Database migration with downtime risk | 5-15d (plus risk premium) |
| Strangler-fig replacement of a subsystem | 2-8 weeks |

Use these as a starting point; the actual estimate should come from the `estimate` module.

---

## Risk scoring heuristic

```
R = 1 + (production_incidents_last_quarter * 1.5)
  + (touched_in_last_10_PRs ? 1 : 0)
  + (security_or_reliability_category ? 1 : 0)
```

Cap at 5. This favors items that are both visible in the change pattern AND known-fragile.

---

## Top-5 selection rule

After scoring, pick the top 5 by `(R + B) / C`. If two items tie, prefer the one with the lower cost — it ships faster and frees capacity for the next round.

The top 5 are NOT a roadmap. They are a *current attention* list. Re-rank every scan.

---

## When to file an issue vs add to local register

| Situation | Action |
|---|---|
| Team uses GitHub Issues actively | File via `gh issue create` |
| Team uses Jira but not the CLI | File via the local register; user manually copies later |
| Personal project, no team | Local register |
| OSS contribution scan | Local register; submit upstream PRs separately |

The fallback is never the *best* state — push the team toward consolidating in their tracker over time.

---

## Anti-pattern: the perpetual debt list

A debt register that grows monotonically is a confession that debt is being filed but not paid. After every quarter, **at least one** of the top 5 must be closed before the next scan. If not, the team is in debt-management failure and the situation should be raised in the next retrospective.
```

- [ ] **Step 3: Create `modules/debt/config.yaml`**

```yaml
detail_level: high
export_to_tracker: auto         # auto | always | never
categories:
  - maintainability
  - reliability
  - security
  - performance
  - test-coverage
top_n_in_yelly_md: 5
permissions:
  tools:
    - Read
    - Grep
    - Glob
    - Bash
    - Edit
    - Write
  bash_commands:
    - "gh issue *"
    - "glab issue *"
    - "jira issue *"
    - "linear issue *"
    - "git log *"
    - "git blame *"
    - "npm outdated *"
    - "grep -RIn TODO *"
  file_access:
    read: "**/*"
    write: "docs/yelly/debt/**/*"
    write_extra:
      - "YELLY.md"
  dangerous: []
```

- [ ] **Step 4: Create `modules/debt/prompts/scan.md`**

```markdown
# Debt Scan

Run a full project debt scan and surface the top 5.

## Step 1: Detect tracker

Call `detectTracker(projectDir)` from `lib/yelly-lead/tracker-detect.ts`. Note the type and CLI availability. Read the user's preference from `config/yelly-lead.yaml: debt.export_to_tracker`.

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

Apply the action from Step 1's matrix. For tracker export, file each top-20 item as a separate issue with the standard body format from the guide. For local fallback, write all 20 to `docs/yelly/debt/register.md` (idempotent: stable IDs).

## Step 5: Update YELLY.md

Surface the top 5 in the `tech-debt` section of `YELLY.md`. Format each as:

```
1. **<title>** — score <s>, cost <C>d, category <category>
   <one-line description>
```

Append to Decision Log: `- YYYY-MM-DD — Debt scan: <N candidates>, top 5 surfaced`.

Stamp frontmatter.

## Step 6: Report to user

Show the top 5 with priority scores. Tell the user how many candidates were found, where they were exported (tracker URL or local file), and the next step (`/yelly-lead debt prioritize` to rebalance later).
```

- [ ] **Step 5: Create `modules/debt/prompts/prioritize.md`**

```markdown
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
```

- [ ] **Step 6: Create `modules/debt/hooks/pre.sh`**

```bash
#!/bin/bash
# Pre-debt: detect tracker presence (informational; library does the real detection).
if [ -d ".github" ]; then echo "tracker-hint: github"; fi
if [ -f ".gitlab-ci.yml" ]; then echo "tracker-hint: gitlab"; fi
exit 0
```

- [ ] **Step 7: Create `modules/debt/hooks/post.sh`**

```bash
#!/bin/bash
# Post-debt: warn if the local register has grown beyond a sane size.
if [ -f "docs/yelly/debt/register.md" ]; then
  lines=$(wc -l < "docs/yelly/debt/register.md")
  if [ "$lines" -gt 800 ]; then
    echo "WARN: docs/yelly/debt/register.md has $lines lines — consider closing some items" >&2
  fi
fi
exit 0
```

- [ ] **Step 8: Make hooks executable**

```bash
chmod +x modules/debt/hooks/pre.sh modules/debt/hooks/post.sh
```

- [ ] **Step 9: Run module structure test**

Run: `npx vitest run test/static/yelly-lead-modules.test.ts`
Expected: `adr` and `debt` tests pass.

- [ ] **Step 10: Commit**

```bash
git add modules/debt/
git commit -m "feat(yelly-lead): add debt module (hybrid tracker export + fallback register)"
```

---

## Task 4: Estimate module

PERT-based, with calibration history in `.yelly/history/estimates.jsonl`.

**Files:**
- Create: `modules/estimate/guide.md`
- Create: `modules/estimate/patterns.md`
- Create: `modules/estimate/config.yaml`
- Create: `modules/estimate/prompts/new-feature.md`
- Create: `modules/estimate/prompts/close-estimate.md`
- Create: `modules/estimate/hooks/pre.sh`
- Create: `modules/estimate/hooks/post.sh`

- [ ] **Step 1: Create `modules/estimate/guide.md`**

```markdown
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

Read `.yelly/history/estimates.jsonl` (append-only, one JSON object per closed estimate). Each line is shaped like:

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

Save to `docs/yelly/estimates/YYYY-MM-DD-<topic>.md`.

### Step 8: Update YELLY.md

- `replaceSection("active-work", <updated bullet list including this estimate>)`
- `appendToSection("decision-log", "- YYYY-MM-DD — Estimated <topic>: <P50>d (P80 <P80>d)")`
- `stampFrontmatter(content, { updated_by: "/yelly-lead estimate", yelly_lead_version })`

### Step 9: Commit

```bash
git add docs/yelly/estimates/<file>.md YELLY.md
git commit -m "docs(estimate): <topic> — <P50>d (P80 <P80>d)"
```

## Closing an estimate

When the work ships, run `/yelly-lead estimate --close <id>`. The module:

1. Reads the estimate file, asks for `actual` days
2. Computes `error = actual - P50`
3. Updates the estimate file's "Closure" section
4. Appends a line to `.yelly/history/estimates.jsonl`
5. Updates the YELLY.md Decision Log: `- YYYY-MM-DD — Closed estimate <id>: actual <actual>d, error <error>d`

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
- `lib/yelly-lead/yelly-md-updater.ts` — for YELLY.md updates
```

- [ ] **Step 2: Create `modules/estimate/patterns.md`**

```markdown
# Estimate Module — Reference Patterns

---

## Reference Class Forecasting

When you have very few data points for the *exact* feature being estimated, find the closest **reference class** — a category of similar past work — and use its average outcome instead.

**Example:** estimating a Stripe integration. Reference class = "third-party API integration with webhook handling." If the team has done 3 of those, averaging 6 days each, start at 6 ± 2 days. Then layer in this feature's specific complexities.

This is the single most reliable estimate adjustment.

---

## Cone of Uncertainty

Estimate ranges should narrow as work progresses, not stay fixed.

| Phase | Uncertainty |
|---|---|
| Pre-spec | 4× (P95 / P50) |
| Spec done | 2× |
| Plan done | 1.5× |
| Implementation midway | 1.2× |
| Last 10% | 1.05× |

If your range is still 4× wide after the plan is written, the plan is not good enough.

---

## Planning Poker (multi-engineer estimates)

When the team is more than one person:

1. Each engineer privately writes O/M/P
2. Reveal simultaneously
3. The two outliers explain their reasoning
4. Re-vote

If two estimates differ by more than 3×, they are estimating different things — clarify scope, do not average.

---

## PERT vs simple estimate

PERT (`E = (O + 4M + P) / 6`) gives slightly more weight to the most-likely case but still surfaces tail risk. It is a small refinement over `(O + M + P) / 3` but matters more for aggregation across many tasks because it propagates standard deviations correctly.

---

## Historical bias examples

| History | Bias (mean actual/estimated) | Calibration action |
|---|---|---|
| 10 estimates, mean 1.0 | none | apply no correction |
| 10 estimates, mean 1.4 | systematic underestimate | multiply current estimate by 1.4 |
| 10 estimates, std 0.3, mean 1.4 | predictable underestimate | apply 1.4× confidently |
| 10 estimates, std 1.2, mean 1.0 | random — no bias, but high variance | widen confidence interval, do not multiply |

The fix for **systematic** bias is multiplication. The fix for **random** variance is widening the interval.

---

## Aggregating variances

When summing N independent task estimates:

- `E_total = sum(E_i)`
- `σ_total = sqrt(sum(σ_i^2))`

Standard deviations do NOT add directly. Adding them produces overly wide intervals. Always sum variances and take the square root.

---

## Forty-percent buffer

If you do not have history data and cannot do reference class forecasting, **add 40% to the most-likely estimate** as a starting point. It is empirically close to the historical bias of new teams. Document this as `bias_correction: 1.4 (no history)` in the output.

---

## Anti-pattern: estimate-by-deadline

If a stakeholder says "we need this by Friday," that is a *constraint*, not an estimate. Estimate the work first, then compare to the constraint. Reporting "we estimate 9 days, the deadline is 5 days, here is what we cut" is honest. Reporting "5 days" is not.
```

- [ ] **Step 3: Create `modules/estimate/config.yaml`**

```yaml
detail_level: high
default_confidence: 0.8         # P80
risk_factor_default: 1.2
min_tasks_for_pert: 3
bias_correction: true
min_history_for_calibration: 5
permissions:
  tools:
    - Read
    - Grep
    - Glob
    - Bash
    - Edit
    - Write
  bash_commands:
    - "git log *"
  file_access:
    read: "**/*"
    write: "docs/yelly/estimates/**/*"
    write_extra:
      - "YELLY.md"
      - ".yelly/history/estimates.jsonl"
  dangerous: []
```

- [ ] **Step 4: Create `modules/estimate/prompts/new-feature.md`**

```markdown
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

Cross-load `modules/risk/guide.md`. Read `docs/yelly/risks/active.md` if it exists. If any active risks impact this work, apply the configured `risk_factor_default` (or a higher factor with explicit reason). Document the multiplier and reason.

## Step 6: Historical calibration

Read `.yelly/history/estimates.jsonl`. If ≥5 entries, compute `bias = mean(actual / estimated)` over the last 10. Apply if `bias != 1.0` (within 5%). If <5 entries, warn the user that calibration is not yet meaningful and propose a flat 40% buffer instead.

## Step 7: Render and save

Use `templates/estimate.md.tmpl`. Fill placeholders. Save to `docs/yelly/estimates/YYYY-MM-DD-<kebab-topic>.md`.

## Step 8: Update YELLY.md

`replaceSection("active-work", <bullet list>)` → add this estimate as a bullet linking to the file.
`appendToSection("decision-log", ...)`.
`stampFrontmatter(...)`.

## Step 9: Commit

```bash
git add docs/yelly/estimates/<file>.md YELLY.md
git commit -m "docs(estimate): <topic> — <P50>d (P80 <P80>d)"
```

## Step 10: Report

Show the user:
- Final estimate: P50, P80, P95
- Risk multiplier (if any) and reason
- Historical bias correction (if any)
- Reminder: close the estimate when the work ships, with `/yelly-lead estimate --close <id>`
```

- [ ] **Step 5: Create `modules/estimate/prompts/close-estimate.md`**

```markdown
# Close an Estimate

Use when a feature has shipped and you want to record the actual time taken.

## Step 1: Identify the estimate

Ask the user for the estimate ID (e.g., `est-2026-04-12`) or topic name. Find the matching file in `docs/yelly/estimates/`.

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

Add a line to `.yelly/history/estimates.jsonl`:

```json
{"id":"<id>","topic":"<topic>","estimated":<P50>,"actual":<actual>,"error":<error>,"date":"YYYY-MM-DD"}
```

Make sure `.yelly/history/` exists; create it if not. Make sure `.yelly/` is in `.gitignore`.

## Step 6: Update YELLY.md

- Remove the entry from `active-work`
- `appendToSection("decision-log", "- YYYY-MM-DD — Closed <id>: actual <actual>d (P50 was <P50>d)")`
- Stamp.

## Step 7: Commit

```bash
git add docs/yelly/estimates/<file>.md YELLY.md
git commit -m "docs(estimate): close <id> — actual <actual>d"
```

## Step 8: Report calibration impact

After appending the new data point, recompute the bias factor over the last 10 entries. Report the new bias to the user — this is the immediate feedback loop that makes the next estimate more accurate.
```

- [ ] **Step 6: Create `modules/estimate/hooks/pre.sh`**

```bash
#!/bin/bash
# Pre-estimate: ensure the history dir exists and show calibration data point count.
mkdir -p .yelly/history
if [ -f .yelly/history/estimates.jsonl ]; then
  count=$(wc -l < .yelly/history/estimates.jsonl)
  echo "calibration: $count past estimate(s) on file"
else
  echo "calibration: no history yet"
fi
exit 0
```

- [ ] **Step 7: Create `modules/estimate/hooks/post.sh`**

```bash
#!/bin/bash
# Post-estimate: warn if the latest estimate file is missing the closure section.
latest=$(ls -t docs/yelly/estimates/*.md 2>/dev/null | head -1)
if [ -z "$latest" ]; then
  exit 0
fi
if ! grep -q "## Closure" "$latest"; then
  echo "WARN: $latest missing Closure section" >&2
fi
exit 0
```

- [ ] **Step 8: Make hooks executable**

```bash
chmod +x modules/estimate/hooks/pre.sh modules/estimate/hooks/post.sh
```

- [ ] **Step 9: Run module structure test**

Run: `npx vitest run test/static/yelly-lead-modules.test.ts`
Expected: `adr`, `debt`, `estimate` tests pass; `risk` still fails.

- [ ] **Step 10: Commit**

```bash
git add modules/estimate/
git commit -m "feat(yelly-lead): add estimate module (PERT + historical calibration)"
```

---

## Task 5: Risk module

Risk register that integrates with deploy / review / estimate workflows.

**Files:**
- Create: `modules/risk/guide.md`
- Create: `modules/risk/patterns.md`
- Create: `modules/risk/config.yaml`
- Create: `modules/risk/prompts/new-risk.md`
- Create: `modules/risk/prompts/deploy-gate.md`
- Create: `modules/risk/hooks/pre.sh`
- Create: `modules/risk/hooks/post.sh`

- [ ] **Step 1: Create `modules/risk/guide.md`**

```markdown
# Risk Module — Methodology Guide

Risk management is the discipline of naming what could go wrong **before** it does, scoring it, mitigating what is mitigable, and accepting the rest with eyes open. The output is a *living* register — not a one-time exercise.

A risk register that nobody reads is worse than no register: it creates the illusion of preparedness. This module is built around making the register integrate with workflows that already exist (deploy, code review, estimate) so risks are surfaced where engineers already look.

## What counts as a risk

A risk has three properties:

1. **It has not happened yet.** (After it happens, it is an *incident*, not a risk.)
2. **It is uncertain.** (Certainties are *facts* — handle them in the plan.)
3. **It would matter if it happened.** (Trivial what-ifs are not risks.)

If any property is missing, do not file it as a risk.

## Workflow

### Step 1: Identify

Walk through these categories:

- **Technical:** scaling limits, third-party API failures, data corruption, race conditions
- **Schedule:** estimate slip, dependency delays, key-person availability
- **Scope:** moving requirements, undocumented assumptions, feature creep
- **Team:** burnout, knowledge silos, hiring gaps, churn
- **External:** regulatory changes, market shifts, supplier risk, vendor lock-in
- **Security:** new CVE in a dependency, weakened auth, data leak surface

For each candidate, write one sentence: "If <X> happens, then <Y>." If you cannot finish the sentence, it is not a risk yet.

### Step 2: Score

Each risk gets two scores, 1-5:

- **Impact (I):** how bad is Y? (1 = annoyance, 5 = company-ending)
- **Probability (P):** how likely is X in the next 90 days? (1 = remote, 5 = expected)

**Severity = I × P** (range 1-25).

| Severity | Interpretation | Action |
|---|---|---|
| 1-6 | Low | Note in register, no immediate action |
| 7-12 | Medium | Owner + due date for mitigation |
| 13-19 | High | Active mitigation, weekly review |
| 20-25 | Critical | Block dependent work until mitigated |

### Step 3: Mitigate

For each risk, name:

- **Owner** — single named person responsible (not "the team")
- **Mitigation** — what we do to reduce probability OR impact
- **Contingency** — what we do *if* it happens
- **Due date** — when the mitigation is in place

Mitigation reduces P or I. Contingency caps the damage if mitigation fails. Both are valuable; mitigation alone is not enough for high-severity risks.

### Step 4: Save

Write each risk to `docs/yelly/risks/active.md`, one risk per H2 section. Use `templates/risk.md.tmpl` from Plan 1 as the format.

### Step 5: Update YELLY.md

- `replaceSection("top-risks", <top 5 by severity, formatted>)`
- `appendToSection("decision-log", "- YYYY-MM-DD — Risk added: <title> (severity <S>)")`
- `stampFrontmatter(...)`

### Step 6: Commit

```bash
git add docs/yelly/risks/active.md YELLY.md
git commit -m "docs(risk): <action> — <title> (severity <S>)"
```

## Closing a risk

A risk closes when **either** condition holds:

1. The mitigation is complete and the residual severity is ≤6
2. The risk is confirmed as no longer applicable (e.g., the feature was cancelled)

Move closed risks from `active.md` to `docs/yelly/risks/archive/YYYY-MM.md`. Append the resolution note: what mitigation worked, what did not, what was learned. Closed risks are part of the team's memory.

## Integration with other modules

This is the part that makes a risk register useful instead of decorative.

### deploy gate

When the user invokes `/yelly-lead risk deploy-gate`, the module reads `active.md` and reports any risks with severity ≥`severity_threshold_block` (default 20). The deploy module's pre-flight should call this gate and refuse to deploy without an explicit override (`--accept-risk-<id>` per blocking risk).

### review

When the `review` module sees a PR diff that touches files mentioned in any active risk's "Description" or "Mitigation" section, it surfaces the risk in the review output.

### estimate

The `estimate` module's risk adjustment factor (default 1.2×) increases when active high-severity risks affect the estimated work. Use the configured `risk_factor_default` plus a per-risk multiplier when applicable.

These integrations are **best effort** in MVP — the risk module exposes the data, the other modules opt-in to consume it. Plan 3 wires up the actual gate.

## Anti-patterns

- **Risks without owners.** A risk owned by "the team" is owned by nobody. Always name a person.
- **Risks without contingencies.** Mitigation can fail. If the contingency section is blank, you are gambling.
- **Treating high-severity risks as decoration.** Critical risks should block work. If they do not, the team is not actually managing risk.
- **Mass-adding risks during a planning meeting and never updating them.** Risks must be reviewed weekly while active.

## Cross-module references

- `templates/risk.md.tmpl` — file format
- `lib/yelly-lead/yelly-md-updater.ts` — for YELLY.md updates
- `modules/deploy` — consumes the risk gate
- `modules/review` — consumes the risk-files mapping
- `modules/estimate` — consumes the risk adjustment factor
- `modules/security` — security risks can be filed here, with the security module supplying the technical detail
```

- [ ] **Step 2: Create `modules/risk/patterns.md`**

```markdown
# Risk Module — Reference Patterns

---

## Risk heatmap (ASCII)

Quick visualization of the register, severity = impact × probability.

```
              Probability →
            1     2     3     4     5
        +-----+-----+-----+-----+-----+
      1 |  1  |  2  |  3  |  4  |  5  |
        +-----+-----+-----+-----+-----+
      2 |  2  |  4  |  6  |  8  | 10  |
        +-----+-----+-----+-----+-----+
Imp 3 |  3  |  6  |  9  | 12  | 15  |
        +-----+-----+-----+-----+-----+
      4 |  4  |  8  | 12  | 16  | 20  |
        +-----+-----+-----+-----+-----+
      5 |  5  | 10  | 15  | 20  | 25  |
        +-----+-----+-----+-----+-----+

  1-6:   Low
  7-12:  Medium
  13-19: High
  20-25: Critical
```

---

## STRIDE for security risks

When categorizing security risks, use STRIDE (from Microsoft):

| Letter | Threat | Example |
|---|---|---|
| S | Spoofing | impersonation, session hijacking |
| T | Tampering | data integrity attacks |
| R | Repudiation | "I did not do that" with no audit trail |
| I | Information disclosure | leakage, side-channel |
| D | Denial of service | flooding, resource exhaustion |
| E | Elevation of privilege | privilege escalation |

Each category has its own typical mitigations. Cross-reference `modules/security/guide.md` for technical detail.

---

## Standard mitigation patterns

| Risk type | Mitigation pattern |
|---|---|
| Third-party API failure | Circuit breaker + cached fallback |
| Database migration | Reversible migration + dry-run on staging copy |
| Estimate slip | Time-box + early warning at 50% / 75% / 90% of estimate |
| Key-person dependency | Pairing + documented runbook |
| Data corruption | Daily backup + restore drill |
| Vendor lock-in | Abstraction layer + documented exit path |
| Scope creep | Written acceptance criteria + change-control gate |

---

## When to elevate a risk

Promote severity when **any** of these signal:

- The mitigation has been pending past its due date
- A near-miss occurred (the risk almost materialized)
- An external change made the trigger more likely (new regulation, vendor pricing, etc.)
- A senior team member loses confidence in the mitigation

Demote severity ONLY when the mitigation is verified in production AND a review interval has passed.

---

## Anti-pattern: severity-by-vibe

Severity must be I × P, not "feels critical." If you are tempted to score 5×5=25 because it feels right, slow down: rate I and P separately, justify each in one sentence, then multiply. This forces the explicit thinking that separates risk management from anxiety.

---

## Owner reassignment rule

If a risk owner changes role, leaves the team, or is unavailable for >1 week, the risk **must** be reassigned within 48 hours. An ownerless risk has no defense and rotates to "no owner — escalate" within the next review cycle.
```

- [ ] **Step 3: Create `modules/risk/config.yaml`**

```yaml
detail_level: high
severity_threshold_block: 20
severity_threshold_warn: 12
active_risks_in_yelly_md: 5
review_interval_days: 7
permissions:
  tools:
    - Read
    - Grep
    - Glob
    - Bash
    - Edit
    - Write
  bash_commands:
    - "git log *"
    - "git diff *"
  file_access:
    read: "**/*"
    write: "docs/yelly/risks/**/*"
    write_extra:
      - "YELLY.md"
  dangerous: []
```

- [ ] **Step 4: Create `modules/risk/prompts/new-risk.md`**

```markdown
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

Open `docs/yelly/risks/active.md` (create with a one-line header if missing). Append a new H2 block using `templates/risk.md.tmpl`. Generate a unique `risk_id` from date + slug: `risk-YYYY-MM-DD-<slug>`.

## Step 4: Update YELLY.md

- Re-read `active.md`, sort all risks by severity descending, take the top 5
- `replaceSection("top-risks", <top 5 formatted>)`
- `appendToSection("decision-log", "- YYYY-MM-DD — Risk added: <title> (severity <S>)")`
- `stampFrontmatter(content, { updated_by: "/yelly-lead risk", yelly_lead_version })`

## Step 5: Commit

```bash
git add docs/yelly/risks/active.md YELLY.md
git commit -m "docs(risk): add <title> (severity <S>)"
```

## Step 6: Report

Tell the user:
- The new risk's severity score and category
- Whether it now appears in the top 5 (YELLY.md)
- The owner and due date
- Whether the deploy gate is now blocking (severity ≥20)
```

- [ ] **Step 5: Create `modules/risk/prompts/deploy-gate.md`**

```markdown
# Deploy Risk Gate

Use before any deploy to surface risks that may block or warn.

## Step 1: Read active risks

Read `docs/yelly/risks/active.md`. Parse each H2 block; extract `severity`.

## Step 2: Classify

- Risks with severity ≥`severity_threshold_block` (default 20) → **BLOCKER**
- Risks with severity in [`severity_threshold_warn`, `severity_threshold_block` - 1] → **WARN**
- Lower → ignore for the gate

## Step 3: Report

If any **BLOCKER**:

```
🚫 Deploy blocked by 1+ critical risk(s):

1. <title> (severity <S>) — owner @<owner>, due <date>
   <mitigation status>

To override: pass --accept-risk-<id> for each risk above.
```

If only **WARN**:

```
⚠️  Deploy proceeding with 2 warning(s):

1. <title> (severity <S>) — owner @<owner>
2. <title> (severity <S>) — owner @<owner>
```

If neither:

```
✅ No blocking risks active. Proceed with deploy.
```

## Step 4: Return status to caller

This prompt does NOT actually block — it returns structured data the `deploy` module can act on. Exit code 0 = OK, 1 = WARN, 2 = BLOCKER. The deploy module decides what to do with the signal.

## Step 5: Update YELLY.md (optional)

If the gate was triggered (warn or blocker), append to Decision Log:
`- YYYY-MM-DD — Deploy gate: <STATUS> (<N> issues)`
```

- [ ] **Step 6: Create `modules/risk/hooks/pre.sh`**

```bash
#!/bin/bash
# Pre-risk: ensure risk dirs exist.
mkdir -p docs/yelly/risks/archive
if [ ! -f docs/yelly/risks/active.md ]; then
  echo "# Active Risk Register" > docs/yelly/risks/active.md
fi
exit 0
```

- [ ] **Step 7: Create `modules/risk/hooks/post.sh`**

```bash
#!/bin/bash
# Post-risk: count active risks, warn if any are ownerless.
if [ ! -f docs/yelly/risks/active.md ]; then
  exit 0
fi
total=$(grep -c '^## ' docs/yelly/risks/active.md || true)
ownerless=$(grep -c 'Owner: $\|owner: $\|Owner: TBD' docs/yelly/risks/active.md || true)
echo "risk register: $total active"
if [ "$ownerless" -gt 0 ]; then
  echo "WARN: $ownerless ownerless risk(s) — assign within 48h" >&2
fi
exit 0
```

- [ ] **Step 8: Make hooks executable**

```bash
chmod +x modules/risk/hooks/pre.sh modules/risk/hooks/post.sh
```

- [ ] **Step 9: Run module structure test (full pass expected)**

Run: `npx vitest run test/static/yelly-lead-modules.test.ts`
Expected: ALL 4 modules' tests pass.

- [ ] **Step 10: Commit**

```bash
git add modules/risk/
git commit -m "feat(yelly-lead): add risk module (severity register + deploy gate)"
```

---

## Task 6: Final verification

- [ ] **Step 1: Full test suite**

Run: `npm test`
Expected: all tests green. New count: `120 + N` where `N` is the number of yelly-lead-modules tests (roughly 32 — 8 checks × 4 modules).

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Inventory check**

Run:
```bash
ls modules/adr/ modules/debt/ modules/estimate/ modules/risk/
ls modules/adr/prompts/ modules/debt/prompts/ modules/estimate/prompts/ modules/risk/prompts/
ls modules/adr/hooks/ modules/debt/hooks/ modules/estimate/hooks/ modules/risk/hooks/
```

Each of the 4 modules should show:
- `config.yaml`, `guide.md`, `patterns.md`, `prompts/`, `hooks/`
- `prompts/`: 2 files
- `hooks/`: `pre.sh`, `post.sh` (both executable)

- [ ] **Step 4: Hook executability**

Run: `find modules/{adr,debt,estimate,risk}/hooks -name '*.sh' -not -perm -u+x`
Expected: empty output (no non-executable hooks).

- [ ] **Step 5: Git status + log**

Run: `git status && git log --oneline -8`
Expected: clean tree, recent commits show `test(yelly-lead): add module structure test (red...)`, then 4 `feat(yelly-lead): add <module> module ...` commits.

---

## Done Criteria (Plan 2)

- [x] 4 modules created with full structure (28 files)
- [x] Static test (`test/static/yelly-lead-modules.test.ts`) created and passing for all 4 modules
- [x] `npm test` and `npx tsc --noEmit` clean
- [x] All hooks executable (`chmod +x` confirmed)
- [x] 5 commits: 1 test commit (red), 4 module commits
- [x] No modifications to Plan 1 files
- [x] Each module's `guide.md` is non-trivial (>50 lines) and includes a title heading

## Not In Plan 2 (will come in Plan 3)

- `skills/yelly-lead/SKILL.md.tmpl` — the routing logic that loads these modules
- `bin/yelly-lead-sync`, `yelly-lead-validate`, `yelly-lead-stats` CLI tools
- `setup` script integration
- `gen-skills.js` 5-mega-skill support
- Integration tests + fixture project

## Self-Review

- **Spec coverage:** §6.1, §6.2, §6.3, §6.4 of the spec each have a Task with a guide that follows the spec's methodology outline. Templates from Plan 1 (`adr.md.tmpl`, `estimate.md.tmpl`, `risk.md.tmpl`) are referenced from the corresponding guides.
- **Placeholder scan:** No TBDs. Every guide.md, patterns.md, config.yaml, prompt, and hook has complete content.
- **Type consistency:** All references to library functions match Plan 1's exported API (`replaceSection`, `appendToSection`, `stampFrontmatter`, `detectTracker`).
- **Scope:** ~29 files, all additive, no Plan 1 modifications. 6 tasks, ~5 commits.
