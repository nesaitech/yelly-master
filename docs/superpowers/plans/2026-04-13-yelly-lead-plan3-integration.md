# yelly-lead Plan 3 — Mega-Skill Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Wire the 4 yelly-lead modules from Plan 2 into a usable mega-skill `/yelly-lead`. Add the routing template, the 3 CLI tools (`sync`, `validate`, `stats`), the lib code that backs them, the setup script registration, and integration tests that prove the full chain (bootstrap → module → YELLY.md update → CLI verification) works.

**Architecture:** The mega-skill template loads `YELLY.md` first, routes the user request to one of the 4 modules using a keyword table, and emits a permission pre-flight before doing any work. The CLI tools are thin wrappers around new functions in `lib/yelly-lead/` so the logic stays testable. The setup script picks up `yelly-lead` automatically once it is added to the `SKILLS` bash array.

**Tech Stack:** TypeScript (lib + bin), bash (setup), markdown (SKILL.md.tmpl), vitest (tests). No new runtime dependencies. `gen-skill-docs.ts` is **already** dynamic — it scans `skillsDir/*/SKILL.md.tmpl` — so no script change is needed; the new template is picked up automatically.

**Spec reference:** spec sections §5.1, §5.3, §9 (Session continuation), §11 (CLI tools), §12 (file rows for `skills/yelly-lead/*`, `bin/yelly-lead-*`).

**Dependencies:** Plan 1 (lib/yelly-lead/*) and Plan 2 (modules/{adr,debt,estimate,risk}/) must be in place on this branch.

---

## File Structure

### New files (12)

```
config/yelly-lead.yaml                   # mega-skill defaults block
skills/yelly-lead/SKILL.md.tmpl          # routing + permission pre-flight + bootstrap

lib/yelly-lead/validate.ts               # logic for yelly-lead-validate
lib/yelly-lead/stats.ts                  # logic for yelly-lead-stats
lib/yelly-lead/sync.ts                   # logic for yelly-lead-sync

bin/yelly-lead-validate.ts               # CLI wrapper
bin/yelly-lead-stats.ts                  # CLI wrapper
bin/yelly-lead-sync.ts                   # CLI wrapper

test/unit/yelly-lead/validate.test.ts
test/unit/yelly-lead/stats.test.ts
test/unit/yelly-lead/sync.test.ts
test/integration/yelly-lead-routing.test.ts
```

### Modified files (3)

```
config/defaults.yaml      # add adr, debt, estimate, risk default blocks
package.json              # add yelly-lead-sync, yelly-lead-validate, yelly-lead-stats npm scripts
setup                     # add "yelly-lead" to SKILLS array on line 147
```

---

## Public API Sketch

```typescript
// lib/yelly-lead/validate.ts
export interface ValidateResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}
export function validateProjectDir(projectDir: string): ValidateResult;

// lib/yelly-lead/stats.ts
export interface ProjectStats {
  adrCount: number;
  activeRiskCount: number;
  topRiskSeverity: number | null;
  estimateHistoryCount: number;
  estimateBias: number | null;       // mean(actual / estimated) over last 10
  yellyMdLines: number;
  yellyMdLastUpdated: string | null;
}
export function gatherStats(projectDir: string): ProjectStats;

// lib/yelly-lead/sync.ts
export interface SyncResult {
  yellyMdRewritten: boolean;
  sectionsTouched: string[];
}
// Re-render YELLY.md sections from durable artifacts (docs/yelly/adr/*.md, docs/yelly/risks/active.md, etc.)
export function syncYellyMd(projectDir: string, yellyLeadVersion: string): SyncResult;
```

---

## Task 1: config — defaults and yelly-lead.yaml

**Files:**
- Modify: `config/defaults.yaml`
- Create: `config/yelly-lead.yaml`

- [ ] **Step 1: Add yelly-lead module defaults to `config/defaults.yaml`**

Append at the end of the file:

```yaml

# yelly-lead modules
adr:
  format: nygard
  numbering: sequential-padded-4
  latest_in_yelly_md: 5
  require_alternatives: true

debt:
  export_to_tracker: auto
  top_n_in_yelly_md: 5

estimate:
  default_confidence: 0.8
  risk_factor_default: 1.2
  bias_correction: true
  min_history_for_calibration: 5

risk:
  severity_threshold_block: 20
  severity_threshold_warn: 12
  active_risks_in_yelly_md: 5
  review_interval_days: 7
```

- [ ] **Step 2: Create `config/yelly-lead.yaml`**

```yaml
# config/yelly-lead.yaml
# Mega-skill defaults for /yelly-lead. User overrides go to ~/.yelly-master/config.yaml
# under a yelly_lead: block.

yelly_lead:
  bootstrap:
    auto_inject_claude_md: true        # add @YELLY.md to host CLAUDE.md on first run
    create_gitignore_entry: true        # add .yelly/ to project .gitignore
  yelly_md:
    max_lines: 400
    decision_log_max_entries: 10
  artifacts_dir: docs/yelly
  state_dir: .yelly
  history_file: .yelly/history/estimates.jsonl
```

- [ ] **Step 3: Run static config schema test (existing)**

Run: `npx vitest run test/static/config-schema.test.ts`
Expected: PASS — adding new top-level keys does not break the existing schema test.

- [ ] **Step 4: Commit**

```bash
git add config/defaults.yaml config/yelly-lead.yaml
git commit -m "feat(yelly-lead): add defaults + yelly-lead.yaml mega-skill config"
```

---

## Task 2: skills/yelly-lead/SKILL.md.tmpl

**Files:**
- Create: `skills/yelly-lead/SKILL.md.tmpl`

- [ ] **Step 1: Create the template**

```markdown
---
name: yelly-lead
description: |
  Tech Lead Strategic Core — adr, debt, estimate, risk. Your strategic
  partner for architecture decisions, technical debt prioritization,
  honest time estimates, and risk management.
  Invoke with /yelly-lead or when user asks to estimate, decide
  architecture, track risk, or manage technical debt.
---

{{PREAMBLE}}

# yelly-lead — Tech Lead Strategic Core

You are an expert tech lead. When this skill is invoked, you operate from a *project state* anchored in the project's `YELLY.md` file. Read `YELLY.md` BEFORE doing anything else.

## Session Bootstrap (every invocation)

1. **Read `YELLY.md`** at the project root. Load full content into context.
2. If `YELLY.md` does **not** exist → trigger the bootstrap flow (see below).
3. Parse the frontmatter. If `yelly_version` is missing or older than the current schema, run the migration before proceeding.
4. Use the loaded context to inform every subsequent action — especially the Project Snapshot, Active Work, Top Risks, and Decision Log sections.

## Bootstrap Flow (first run on a project)

When `YELLY.md` is missing:

1. Detect the stack via `lib/yelly-lead/bootstrap.ts:gatherContext(projectDir)`.
2. Ask the user three questions, one at a time:
   - Current project phase? (idea / MVP / beta / production / maintenance)
   - Current focus? (one sentence)
   - Team size override? (default: detected count)
3. Render the initial `YELLY.md` via `renderYellyMdTemplate` from `templates/YELLY.md.tmpl`, passing the gathered context + answers.
4. Write `YELLY.md` to the project root.
5. Scaffold `docs/yelly/{adr,estimates,risks,decisions}/` with `.gitkeep` placeholders.
6. Append `.yelly/` to `.gitignore` (if not already present).
7. Commit with message `chore(yelly): initialize project tech lead context`.
8. Report the created file paths and the four available modules.

## Available Modules

| Module | When to use | Trigger keywords |
|--------|------------|-----------------|
| **adr** | User wants to record an architecture decision | adr, decision, architecture choice, rationale, decided to, choosing between, picked, pick |
| **debt** | User wants to scan, classify, or prioritize technical debt | debt, tech debt, refactor list, what needs cleanup, technical debt, scan debt, prioritize |
| **estimate** | User wants a time estimate for a feature or project | estimate, how long, time estimate, days, weeks, when can we ship, plan timeline, planning poker |
| **risk** | User wants to identify, score, or review project risks | risk, risks, what could go wrong, register, deploy gate, severity, mitigation |

## Permission Pre-Flight

**BEFORE doing ANY work**, you MUST:

1. Determine which module(s) will be needed based on the user's request
2. Read the permission config from each module:
   ```bash
   cat {{MODULES_ROOT}}/<module>/config.yaml
   ```
3. Aggregate all required permissions
4. Present to the user in ONE prompt:

```
🎯 yelly-lead: Preparing for [task description]

Module(s): [module names]

Permissions required:
  ✅ Read files: [scope]
  ✅ Search: grep, glob across codebase
  ✅ Edit files: [scope]
  ✅ Bash: [commands list]

Output paths:
  📄 YELLY.md (always)
  📄 docs/yelly/<artifact>/...

Grant all permissions? [Y/n]
```

5. WAIT for user approval before proceeding
6. If user denies any path → adjust workflow accordingly

## Routing Logic

1. Analyze the user's request
2. Match against trigger keywords in the table above
3. If **single module matches clearly** → load that module's guide:
   ```
   Read: {{MODULES_ROOT}}/<module>/guide.md
   ```
4. If **multiple modules match** (e.g., "estimate this risky feature") → load all matching modules in dependency order: risk → estimate → adr → debt
5. If **no clear match** → ask ONE clarifying question listing the four available modules
6. If **empty or vague request** → ask what they need help with

## Cross-Mega-Skill Loading

During execution, if you need data from another mega-skill, load its module guide directly:

- `Read: {{MODULES_ROOT}}/health/guide.md` — input for `debt` (complexity, churn)
- `Read: {{MODULES_ROOT}}/review/guide.md` — input for `risk` (PR hotspots)
- `Read: {{MODULES_ROOT}}/deploy/guide.md` — `risk deploy-gate` integrates here
- `Read: {{MODULES_ROOT}}/retro/guide.md` — input for `debt` (recurring pain points)

The `{{MODULES_ROOT}}` is the same shared directory regardless of which mega-skill exposes a module.

## YELLY.md Update Discipline

After completing any module workflow, you MUST update `YELLY.md` using `lib/yelly-lead/yelly-md-updater.ts`:

1. `replaceSection` for sections the module owns (e.g., adr → architecture-decisions)
2. `appendToSection` for the decision-log entry
3. `stampFrontmatter` with `updated_by: "/yelly-lead <module>"` and the current `yelly_lead_version`
4. Run `{{BIN_ROOT}}/yelly-lead-validate` to check the result is well-formed

If `YELLY.md` exceeds the configured `max_lines` (default 400), rotate the oldest half of the Decision Log entries into `docs/yelly/decisions/archive.md`.

## Module Guide Loading

When loading a module, read these files in order:
1. `{{MODULES_ROOT}}/<module>/guide.md` — main methodology (ALWAYS read)
2. `{{MODULES_ROOT}}/<module>/patterns.md` — reference patterns (read if relevant)
3. `{{MODULES_ROOT}}/<module>/prompts/<scenario>.md` — specific scenario (read if matches)

## Configuration

User config overrides defaults:
```bash
{{BIN_ROOT}}/yelly-config get yelly_lead.yelly_md.max_lines
{{BIN_ROOT}}/yelly-config get adr.format
```

## CLI Tools

- `{{BIN_ROOT}}/yelly-lead-sync` — regenerate `YELLY.md` from sources after manual edits
- `{{BIN_ROOT}}/yelly-lead-validate` — check `YELLY.md` schema, ADR filenames, orphan artifacts
- `{{BIN_ROOT}}/yelly-lead-stats` — show ADR count, risk closure rate, estimate calibration
```

- [ ] **Step 2: Type-check is N/A; verify file exists**

Run: `cat skills/yelly-lead/SKILL.md.tmpl | head -10`
Expected: shows the frontmatter `name: yelly-lead`.

- [ ] **Step 3: Verify gen-skill-docs picks it up**

Run:
```bash
npx vitest run test/unit/gen-skill-docs.test.ts
```
Expected: existing tests still pass (the function is generic and discovers any new template).

- [ ] **Step 4: Commit**

```bash
git add skills/yelly-lead/SKILL.md.tmpl
git commit -m "feat(yelly-lead): add /yelly-lead mega-skill template"
```

---

## Task 3: lib/yelly-lead/validate.ts and bin/yelly-lead-validate.ts

**Files:**
- Create: `lib/yelly-lead/validate.ts`
- Create: `bin/yelly-lead-validate.ts`
- Create: `test/unit/yelly-lead/validate.test.ts`

- [ ] **Step 1: Create the test file**

```typescript
import { describe, it, expect } from "vitest";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { validateProjectDir } from "../../../lib/yelly-lead/validate.js";

describe("validateProjectDir", () => {
  const tmp = join(tmpdir(), "yelly-validate-test-" + Date.now());

  it("ok=false when YELLY.md is missing", () => {
    const dir = join(tmp, "no-yelly");
    mkdirSync(dir, { recursive: true });
    const result = validateProjectDir(dir);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("YELLY.md"))).toBe(true);
    rmSync(tmp, { recursive: true, force: true });
  });

  it("ok=true for a minimal valid YELLY.md", () => {
    const dir = join(tmp, "valid");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "YELLY.md"),
      `---
yelly_version: 1
yelly_lead_version: 0.2.0
last_updated: 2026-04-13T00:00:00Z
last_updated_by: /yelly-lead bootstrap
schema: project-state
---

# YELLY

## Project Snapshot
<!-- yelly-lead: project-snapshot -->
- Project: x
<!-- /yelly-lead: project-snapshot -->
`,
    );
    const result = validateProjectDir(dir);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    rmSync(tmp, { recursive: true, force: true });
  });

  it("flags missing yelly_version", () => {
    const dir = join(tmp, "no-version");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "YELLY.md"), "---\nlast_updated: 2026-04-13T00:00:00Z\n---\n# YELLY\n");
    const result = validateProjectDir(dir);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("yelly_version"))).toBe(true);
    rmSync(tmp, { recursive: true, force: true });
  });

  it("flags ADR filename violations", () => {
    const dir = join(tmp, "bad-adr");
    mkdirSync(join(dir, "docs", "yelly", "adr"), { recursive: true });
    writeFileSync(
      join(dir, "YELLY.md"),
      "---\nyelly_version: 1\nyelly_lead_version: 0.2.0\nlast_updated: 2026-04-13T00:00:00Z\nlast_updated_by: x\nschema: project-state\n---\n# YELLY\n",
    );
    writeFileSync(join(dir, "docs/yelly/adr/not-numbered.md"), "# bad");
    writeFileSync(join(dir, "docs/yelly/adr/0001-good.md"), "# good");
    const result = validateProjectDir(dir);
    expect(result.warnings.some((w) => w.includes("not-numbered"))).toBe(true);
    rmSync(tmp, { recursive: true, force: true });
  });

  it("warns when YELLY.md exceeds 400 lines", () => {
    const dir = join(tmp, "huge");
    mkdirSync(dir, { recursive: true });
    const body = Array.from({ length: 500 }, (_, i) => `line ${i}`).join("\n");
    writeFileSync(
      join(dir, "YELLY.md"),
      `---\nyelly_version: 1\nyelly_lead_version: 0.2.0\nlast_updated: 2026-04-13T00:00:00Z\nlast_updated_by: x\nschema: project-state\n---\n${body}\n`,
    );
    const result = validateProjectDir(dir);
    expect(result.warnings.some((w) => w.includes("400"))).toBe(true);
    rmSync(tmp, { recursive: true, force: true });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/unit/yelly-lead/validate.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `lib/yelly-lead/validate.ts`**

```typescript
import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";
import { parseFrontmatter } from "./frontmatter.js";

export interface ValidateResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

const REQUIRED_FRONTMATTER_KEYS = [
  "yelly_version",
  "yelly_lead_version",
  "last_updated",
  "last_updated_by",
  "schema",
];

const ADR_FILENAME_RE = /^\d{4}-[a-z0-9-]+\.md$/;
const YELLY_MD_MAX_LINES = 400;

export function validateProjectDir(projectDir: string): ValidateResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const yellyPath = join(projectDir, "YELLY.md");
  if (!existsSync(yellyPath)) {
    errors.push(`YELLY.md not found at ${yellyPath}`);
    return { ok: false, errors, warnings };
  }

  const content = readFileSync(yellyPath, "utf-8");
  const { frontmatter } = parseFrontmatter(content);

  for (const key of REQUIRED_FRONTMATTER_KEYS) {
    if (!(key in frontmatter)) {
      errors.push(`YELLY.md frontmatter missing key: ${key}`);
    }
  }

  const lines = content.split("\n").length;
  if (lines > YELLY_MD_MAX_LINES) {
    warnings.push(
      `YELLY.md has ${lines} lines (over the 400 line soft cap — consider rotating Decision Log)`,
    );
  }

  const adrDir = join(projectDir, "docs", "yelly", "adr");
  if (existsSync(adrDir)) {
    for (const entry of readdirSync(adrDir)) {
      if (entry === ".gitkeep") continue;
      if (!entry.endsWith(".md")) continue;
      if (!ADR_FILENAME_RE.test(entry)) {
        warnings.push(
          `ADR filename does not match NNNN-kebab-title.md pattern: ${entry}`,
        );
      }
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/unit/yelly-lead/validate.test.ts`
Expected: PASS — all 5 tests green.

- [ ] **Step 5: Create `bin/yelly-lead-validate.ts`**

```typescript
import { validateProjectDir } from "../lib/yelly-lead/validate.js";

const projectDir = process.argv[2] ?? process.cwd();

const result = validateProjectDir(projectDir);

if (result.errors.length > 0) {
  console.error("ERRORS:");
  for (const e of result.errors) console.error(`  - ${e}`);
}
if (result.warnings.length > 0) {
  console.warn("WARNINGS:");
  for (const w of result.warnings) console.warn(`  - ${w}`);
}
if (result.ok && result.warnings.length === 0) {
  console.log("✅ YELLY.md and artifacts are valid.");
}

process.exit(result.ok ? 0 : 1);
```

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add lib/yelly-lead/validate.ts bin/yelly-lead-validate.ts test/unit/yelly-lead/validate.test.ts
git commit -m "feat(yelly-lead): add validate lib + CLI"
```

---

## Task 4: lib/yelly-lead/stats.ts and bin/yelly-lead-stats.ts

**Files:**
- Create: `lib/yelly-lead/stats.ts`
- Create: `bin/yelly-lead-stats.ts`
- Create: `test/unit/yelly-lead/stats.test.ts`

- [ ] **Step 1: Create the test file**

```typescript
import { describe, it, expect } from "vitest";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { gatherStats } from "../../../lib/yelly-lead/stats.js";

describe("gatherStats", () => {
  const tmp = join(tmpdir(), "yelly-stats-test-" + Date.now());

  it("returns zero counts for an empty project", () => {
    const dir = join(tmp, "empty");
    mkdirSync(dir, { recursive: true });
    const stats = gatherStats(dir);
    expect(stats.adrCount).toBe(0);
    expect(stats.activeRiskCount).toBe(0);
    expect(stats.estimateHistoryCount).toBe(0);
    expect(stats.yellyMdLines).toBe(0);
    expect(stats.yellyMdLastUpdated).toBeNull();
    rmSync(tmp, { recursive: true, force: true });
  });

  it("counts ADRs by filename pattern", () => {
    const dir = join(tmp, "with-adrs");
    mkdirSync(join(dir, "docs", "yelly", "adr"), { recursive: true });
    writeFileSync(join(dir, "docs/yelly/adr/0001-a.md"), "# 1");
    writeFileSync(join(dir, "docs/yelly/adr/0002-b.md"), "# 2");
    writeFileSync(join(dir, "docs/yelly/adr/notes.txt"), "ignored");
    const stats = gatherStats(dir);
    expect(stats.adrCount).toBe(2);
    rmSync(tmp, { recursive: true, force: true });
  });

  it("counts active risks by H2 header", () => {
    const dir = join(tmp, "with-risks");
    mkdirSync(join(dir, "docs", "yelly", "risks"), { recursive: true });
    writeFileSync(
      join(dir, "docs/yelly/risks/active.md"),
      "# Active Risks\n\n## Risk: A\n- Severity: 12\n\n## Risk: B\n- Severity: 6\n",
    );
    const stats = gatherStats(dir);
    expect(stats.activeRiskCount).toBe(2);
    expect(stats.topRiskSeverity).toBe(12);
    rmSync(tmp, { recursive: true, force: true });
  });

  it("computes estimate bias from history jsonl", () => {
    const dir = join(tmp, "with-history");
    mkdirSync(join(dir, ".yelly", "history"), { recursive: true });
    writeFileSync(
      join(dir, ".yelly/history/estimates.jsonl"),
      [
        '{"id":"a","topic":"x","estimated":4,"actual":5,"date":"2026-01-01"}',
        '{"id":"b","topic":"y","estimated":2,"actual":3,"date":"2026-01-15"}',
      ].join("\n") + "\n",
    );
    const stats = gatherStats(dir);
    expect(stats.estimateHistoryCount).toBe(2);
    // (5/4 + 3/2) / 2 = (1.25 + 1.5) / 2 = 1.375
    expect(stats.estimateBias).toBeCloseTo(1.375, 3);
    rmSync(tmp, { recursive: true, force: true });
  });

  it("reads YELLY.md line count and last_updated", () => {
    const dir = join(tmp, "with-yelly");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "YELLY.md"),
      `---\nyelly_version: 1\nyelly_lead_version: 0.2.0\nlast_updated: 2026-04-13T00:00:00Z\nlast_updated_by: x\nschema: project-state\n---\n\nbody1\nbody2\n`,
    );
    const stats = gatherStats(dir);
    expect(stats.yellyMdLines).toBeGreaterThan(0);
    expect(stats.yellyMdLastUpdated).toBe("2026-04-13T00:00:00Z");
    rmSync(tmp, { recursive: true, force: true });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/unit/yelly-lead/stats.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `lib/yelly-lead/stats.ts`**

```typescript
import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";
import { parseFrontmatter } from "./frontmatter.js";

export interface ProjectStats {
  adrCount: number;
  activeRiskCount: number;
  topRiskSeverity: number | null;
  estimateHistoryCount: number;
  estimateBias: number | null;
  yellyMdLines: number;
  yellyMdLastUpdated: string | null;
}

const ADR_FILENAME_RE = /^\d{4}-[a-z0-9-]+\.md$/;
const SEVERITY_LINE_RE = /Severity:\s*(\d+)/i;

function countAdrs(projectDir: string): number {
  const dir = join(projectDir, "docs", "yelly", "adr");
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).filter((f) => ADR_FILENAME_RE.test(f)).length;
}

function countActiveRisks(projectDir: string): {
  count: number;
  topSeverity: number | null;
} {
  const path = join(projectDir, "docs", "yelly", "risks", "active.md");
  if (!existsSync(path)) return { count: 0, topSeverity: null };
  const content = readFileSync(path, "utf-8");
  const headers = content.match(/^##\s+/gm);
  const count = headers ? headers.length : 0;
  let topSeverity: number | null = null;
  for (const match of content.matchAll(/Severity:\s*(\d+)/gi)) {
    const n = Number(match[1]);
    if (topSeverity === null || n > topSeverity) topSeverity = n;
  }
  return { count, topSeverity };
}

function readEstimateHistory(projectDir: string): {
  count: number;
  bias: number | null;
} {
  const path = join(projectDir, ".yelly", "history", "estimates.jsonl");
  if (!existsSync(path)) return { count: 0, bias: null };
  const lines = readFileSync(path, "utf-8")
    .split("\n")
    .filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { count: 0, bias: null };
  const last10 = lines.slice(-10);
  const ratios: number[] = [];
  for (const line of last10) {
    try {
      const obj = JSON.parse(line) as { estimated?: number; actual?: number };
      if (typeof obj.estimated === "number" && typeof obj.actual === "number" && obj.estimated > 0) {
        ratios.push(obj.actual / obj.estimated);
      }
    } catch {
      // skip malformed line
    }
  }
  const bias =
    ratios.length === 0 ? null : ratios.reduce((a, b) => a + b, 0) / ratios.length;
  return { count: lines.length, bias };
}

function readYellyMdInfo(projectDir: string): {
  lines: number;
  lastUpdated: string | null;
} {
  const path = join(projectDir, "YELLY.md");
  if (!existsSync(path)) return { lines: 0, lastUpdated: null };
  const content = readFileSync(path, "utf-8");
  const lines = content.split("\n").length;
  const { frontmatter } = parseFrontmatter(content);
  const lu = frontmatter["last_updated"];
  const lastUpdated = typeof lu === "string" ? lu : null;
  return { lines, lastUpdated };
}

export function gatherStats(projectDir: string): ProjectStats {
  const risks = countActiveRisks(projectDir);
  const history = readEstimateHistory(projectDir);
  const yellyInfo = readYellyMdInfo(projectDir);
  return {
    adrCount: countAdrs(projectDir),
    activeRiskCount: risks.count,
    topRiskSeverity: risks.topSeverity,
    estimateHistoryCount: history.count,
    estimateBias: history.bias,
    yellyMdLines: yellyInfo.lines,
    yellyMdLastUpdated: yellyInfo.lastUpdated,
  };
}

// Export for completeness; the SEVERITY_LINE_RE constant is reachable in case
// downstream code wants to reuse the same parsing rule.
export { SEVERITY_LINE_RE };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/unit/yelly-lead/stats.test.ts`
Expected: PASS — all 5 tests green.

- [ ] **Step 5: Create `bin/yelly-lead-stats.ts`**

```typescript
import { gatherStats } from "../lib/yelly-lead/stats.js";

const projectDir = process.argv[2] ?? process.cwd();
const stats = gatherStats(projectDir);

console.log("yelly-lead stats");
console.log("================");
console.log(`Project:              ${projectDir}`);
console.log(`YELLY.md lines:       ${stats.yellyMdLines}`);
console.log(`YELLY.md updated:     ${stats.yellyMdLastUpdated ?? "(missing)"}`);
console.log(`ADRs recorded:        ${stats.adrCount}`);
console.log(`Active risks:         ${stats.activeRiskCount}`);
console.log(`Top risk severity:    ${stats.topRiskSeverity ?? "(none)"}`);
console.log(`Estimate history:     ${stats.estimateHistoryCount} entries`);
console.log(
  `Estimate bias:        ${stats.estimateBias === null ? "(insufficient data)" : stats.estimateBias.toFixed(3)}`,
);
```

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add lib/yelly-lead/stats.ts bin/yelly-lead-stats.ts test/unit/yelly-lead/stats.test.ts
git commit -m "feat(yelly-lead): add stats lib + CLI"
```

---

## Task 5: lib/yelly-lead/sync.ts and bin/yelly-lead-sync.ts

The sync command rebuilds the dynamic sections of `YELLY.md` from the durable artifacts in `docs/yelly/`. It does NOT touch Pinned Notes or Decision Log (those are append-only or human-curated).

**Files:**
- Create: `lib/yelly-lead/sync.ts`
- Create: `bin/yelly-lead-sync.ts`
- Create: `test/unit/yelly-lead/sync.test.ts`

- [ ] **Step 1: Create the test file**

```typescript
import { describe, it, expect } from "vitest";
import { mkdirSync, rmSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { syncYellyMd } from "../../../lib/yelly-lead/sync.js";

const BASE_YELLY = `---
yelly_version: 1
yelly_lead_version: 0.2.0
last_updated: 2026-04-01T00:00:00Z
last_updated_by: bootstrap
schema: project-state
---

# YELLY

## Architecture Decisions (latest 5)
<!-- yelly-lead: architecture-decisions -->
_No ADRs recorded yet._
<!-- /yelly-lead: architecture-decisions -->

## Top Risks (live, top 5 by severity)
<!-- yelly-lead: top-risks -->
_No risks tracked yet._
<!-- /yelly-lead: top-risks -->
`;

describe("syncYellyMd", () => {
  const tmp = join(tmpdir(), "yelly-sync-test-" + Date.now());

  it("returns sectionsTouched=[] when no artifacts exist", () => {
    const dir = join(tmp, "empty");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "YELLY.md"), BASE_YELLY);
    const result = syncYellyMd(dir, "0.2.0");
    expect(result.yellyMdRewritten).toBe(true);
    expect(result.sectionsTouched).toEqual([]);
    rmSync(tmp, { recursive: true, force: true });
  });

  it("rewrites architecture-decisions from ADR files", () => {
    const dir = join(tmp, "with-adrs");
    mkdirSync(join(dir, "docs", "yelly", "adr"), { recursive: true });
    writeFileSync(join(dir, "YELLY.md"), BASE_YELLY);
    writeFileSync(
      join(dir, "docs/yelly/adr/0001-use-postgres.md"),
      "---\nadr_number: 1\ntitle: Use Postgres\nstatus: accepted\ndate: 2026-04-10\n---\n# x\n",
    );
    writeFileSync(
      join(dir, "docs/yelly/adr/0002-stripe.md"),
      "---\nadr_number: 2\ntitle: Stripe over Paddle\nstatus: accepted\ndate: 2026-04-12\n---\n# x\n",
    );
    const result = syncYellyMd(dir, "0.2.0");
    expect(result.sectionsTouched).toContain("architecture-decisions");
    const content = readFileSync(join(dir, "YELLY.md"), "utf-8");
    expect(content).toContain("ADR-0001");
    expect(content).toContain("ADR-0002");
    expect(content).toContain("Use Postgres");
    expect(content).not.toContain("_No ADRs recorded yet._");
    rmSync(tmp, { recursive: true, force: true });
  });

  it("rewrites top-risks from active.md", () => {
    const dir = join(tmp, "with-risks");
    mkdirSync(join(dir, "docs", "yelly", "risks"), { recursive: true });
    writeFileSync(join(dir, "YELLY.md"), BASE_YELLY);
    writeFileSync(
      join(dir, "docs/yelly/risks/active.md"),
      "# Active\n\n## Risk: Stripe webhook duplication\n- Severity: 16\n- Owner: alice\n\n## Risk: Migration downtime\n- Severity: 9\n- Owner: bob\n",
    );
    const result = syncYellyMd(dir, "0.2.0");
    expect(result.sectionsTouched).toContain("top-risks");
    const content = readFileSync(join(dir, "YELLY.md"), "utf-8");
    expect(content).toContain("Stripe webhook duplication");
    expect(content).toContain("16");
    rmSync(tmp, { recursive: true, force: true });
  });

  it("stamps frontmatter with new version and timestamp", () => {
    const dir = join(tmp, "stamp");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "YELLY.md"), BASE_YELLY);
    syncYellyMd(dir, "0.3.0");
    const content = readFileSync(join(dir, "YELLY.md"), "utf-8");
    expect(content).toContain("yelly_lead_version: 0.3.0");
    expect(content).toContain("last_updated_by: yelly-lead-sync");
    rmSync(tmp, { recursive: true, force: true });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/unit/yelly-lead/sync.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `lib/yelly-lead/sync.ts`**

```typescript
import { existsSync, readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";
import {
  replaceSection,
  stampFrontmatter,
  type SectionName,
} from "./yelly-md-updater.js";
import { parseFrontmatter } from "./frontmatter.js";

export interface SyncResult {
  yellyMdRewritten: boolean;
  sectionsTouched: string[];
}

const ADR_FILENAME_RE = /^(\d{4})-([a-z0-9-]+)\.md$/;

interface AdrEntry {
  number: string;
  title: string;
  date: string;
  status: string;
}

function readAdrs(projectDir: string): AdrEntry[] {
  const dir = join(projectDir, "docs", "yelly", "adr");
  if (!existsSync(dir)) return [];
  const entries: AdrEntry[] = [];
  for (const file of readdirSync(dir)) {
    const m = file.match(ADR_FILENAME_RE);
    if (!m) continue;
    const content = readFileSync(join(dir, file), "utf-8");
    const { frontmatter } = parseFrontmatter(content);
    entries.push({
      number: m[1],
      title:
        typeof frontmatter["title"] === "string"
          ? (frontmatter["title"] as string)
          : m[2].replace(/-/g, " "),
      date:
        typeof frontmatter["date"] === "string"
          ? (frontmatter["date"] as string)
          : "",
      status:
        typeof frontmatter["status"] === "string"
          ? (frontmatter["status"] as string)
          : "unknown",
    });
  }
  // Sort by ADR number descending; latest first
  entries.sort((a, b) => Number(b.number) - Number(a.number));
  return entries.slice(0, 5);
}

function formatAdrSection(entries: AdrEntry[]): string {
  if (entries.length === 0) return "_No ADRs recorded yet._";
  return entries
    .map((e) => `- ADR-${e.number}: ${e.title} — ${e.status}`)
    .join("\n");
}

interface RiskEntry {
  title: string;
  severity: number;
  owner: string;
}

function readActiveRisks(projectDir: string): RiskEntry[] {
  const path = join(projectDir, "docs", "yelly", "risks", "active.md");
  if (!existsSync(path)) return [];
  const content = readFileSync(path, "utf-8");
  const blocks = content.split(/^##\s+/m).slice(1);
  const risks: RiskEntry[] = [];
  for (const block of blocks) {
    const lines = block.split("\n");
    const title = (lines[0] || "")
      .replace(/^Risk:\s*/i, "")
      .trim();
    let severity = 0;
    let owner = "";
    for (const line of lines) {
      const sm = line.match(/Severity:\s*(\d+)/i);
      if (sm) severity = Number(sm[1]);
      const om = line.match(/Owner:\s*([^\s,]+)/i);
      if (om) owner = om[1];
    }
    if (title) risks.push({ title, severity, owner });
  }
  risks.sort((a, b) => b.severity - a.severity);
  return risks.slice(0, 5);
}

function formatRisksSection(entries: RiskEntry[]): string {
  if (entries.length === 0) return "_No risks tracked yet._";
  return entries
    .map(
      (e, i) =>
        `${i + 1}. **${e.title}** — severity ${e.severity}${e.owner ? ` (owner ${e.owner})` : ""}`,
    )
    .join("\n");
}

export function syncYellyMd(
  projectDir: string,
  yellyLeadVersion: string,
): SyncResult {
  const path = join(projectDir, "YELLY.md");
  if (!existsSync(path)) {
    return { yellyMdRewritten: false, sectionsTouched: [] };
  }
  let content = readFileSync(path, "utf-8");
  const sectionsTouched: string[] = [];

  const adrs = readAdrs(projectDir);
  if (adrs.length > 0) {
    content = replaceSection(content, "architecture-decisions", formatAdrSection(adrs));
    sectionsTouched.push("architecture-decisions");
  }

  const risks = readActiveRisks(projectDir);
  if (risks.length > 0) {
    content = replaceSection(content, "top-risks", formatRisksSection(risks));
    sectionsTouched.push("top-risks");
  }

  content = stampFrontmatter(content, {
    updated_by: "yelly-lead-sync",
    yelly_lead_version: yellyLeadVersion,
  });

  writeFileSync(path, content, "utf-8");
  return { yellyMdRewritten: true, sectionsTouched };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/unit/yelly-lead/sync.test.ts`
Expected: PASS — all 4 tests green.

- [ ] **Step 5: Create `bin/yelly-lead-sync.ts`**

```typescript
import { syncYellyMd } from "../lib/yelly-lead/sync.js";
import { readFileSync } from "fs";
import { join } from "path";

const projectDir = process.argv[2] ?? process.cwd();

let version = "0.0.0";
try {
  version = readFileSync(join(__dirname, "..", "VERSION"), "utf-8").trim();
} catch {
  // fall back to default
}

const result = syncYellyMd(projectDir, version);

if (!result.yellyMdRewritten) {
  console.error("YELLY.md not found at", projectDir);
  process.exit(1);
}

console.log(`✅ YELLY.md synced (${result.sectionsTouched.length} section(s) touched)`);
for (const s of result.sectionsTouched) {
  console.log(`  - ${s}`);
}
```

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: clean. Note: `__dirname` is not available under strict ESM in Node16 mode. If tsc complains, replace the version-loading block with:

```typescript
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

Use whichever the existing `bin/*.ts` files use as a precedent. If they do not load VERSION, simplify to a hard-coded fallback and read VERSION via a relative path from `process.cwd()` only.

- [ ] **Step 7: Commit**

```bash
git add lib/yelly-lead/sync.ts bin/yelly-lead-sync.ts test/unit/yelly-lead/sync.test.ts
git commit -m "feat(yelly-lead): add sync lib + CLI"
```

---

## Task 6: Wire bin tools and update setup script

**Files:**
- Modify: `package.json`
- Modify: `setup`

- [ ] **Step 1: Add npm scripts to `package.json`**

Insert three new entries in the `"scripts"` block (after the existing `yelly-repo-mode` line):

```json
"yelly-lead-sync": "node --loader ts-node/esm bin/yelly-lead-sync.ts",
"yelly-lead-validate": "node --loader ts-node/esm bin/yelly-lead-validate.ts",
"yelly-lead-stats": "node --loader ts-node/esm bin/yelly-lead-stats.ts",
```

- [ ] **Step 2: Verify the scripts run**

Run:
```bash
npm run yelly-lead-stats -- /tmp
npm run yelly-lead-validate -- /tmp || true
```

Expected: both commands execute without crashing. `yelly-lead-stats` prints zero counts. `yelly-lead-validate` reports "YELLY.md not found".

- [ ] **Step 3: Add `yelly-lead` to `setup` SKILLS array**

Edit `setup` line 147. Change:

```bash
SKILLS=("yelly-code" "yelly-ops" "yelly-quality" "yelly-team")
```

to:

```bash
SKILLS=("yelly-code" "yelly-ops" "yelly-quality" "yelly-team" "yelly-lead")
```

- [ ] **Step 4: Sanity-check the setup script syntax**

Run: `bash -n setup`
Expected: no syntax errors.

- [ ] **Step 5: Commit**

```bash
git add package.json setup
git commit -m "feat(yelly-lead): register CLI tools and yelly-lead skill in setup"
```

---

## Task 7: Integration test — full bootstrap → module → sync flow

**Files:**
- Create: `test/integration/yelly-lead-routing.test.ts`

This test asserts that the public API (lib/yelly-lead/*) composes correctly to produce a usable YELLY.md from a fixture project.

- [ ] **Step 1: Create the integration test**

```typescript
import { describe, it, expect } from "vitest";
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import {
  gatherContext,
  renderYellyMdTemplate,
} from "../../lib/yelly-lead/bootstrap.js";
import {
  replaceSection,
  appendToSection,
  stampFrontmatter,
} from "../../lib/yelly-lead/yelly-md-updater.js";
import { validateProjectDir } from "../../lib/yelly-lead/validate.js";
import { syncYellyMd } from "../../lib/yelly-lead/sync.js";
import { gatherStats } from "../../lib/yelly-lead/stats.js";

const REPO_ROOT = join(import.meta.dirname, "..", "..");

describe("yelly-lead end-to-end routing", () => {
  const tmp = join(tmpdir(), "yelly-e2e-" + Date.now());

  it("bootstrap → ADR → risk → sync → validate → stats", () => {
    // 1. Set up a fake project with package.json (typescript + node + postgres)
    const project = join(tmp, "fake-project");
    mkdirSync(project, { recursive: true });
    writeFileSync(
      join(project, "package.json"),
      JSON.stringify({
        name: "fake-project",
        dependencies: { pg: "8.0.0", express: "4.0.0" },
        devDependencies: { typescript: "5.0.0" },
      }),
    );

    // 2. Bootstrap: render YELLY.md from the real template
    const ctx = gatherContext(project);
    expect(ctx.projectName).toBe("fake-project");
    expect(ctx.stack.languages).toContain("typescript");
    expect(ctx.stack.databases).toContain("postgres");

    const tplPath = join(REPO_ROOT, "templates", "YELLY.md.tmpl");
    expect(existsSync(tplPath)).toBe(true);
    const yellyContent = renderYellyMdTemplate(
      tplPath,
      ctx,
      { phase: "MVP", currentFocus: "ship auth", teamSize: 2 },
      "0.2.0",
    );
    writeFileSync(join(project, "YELLY.md"), yellyContent);

    // 3. Validate the freshly bootstrapped YELLY.md
    let result = validateProjectDir(project);
    expect(result.ok).toBe(true);

    // 4. Add an ADR to docs/yelly/adr/
    mkdirSync(join(project, "docs", "yelly", "adr"), { recursive: true });
    writeFileSync(
      join(project, "docs/yelly/adr/0001-use-postgres.md"),
      "---\nadr_number: 1\ntitle: Use Postgres\nstatus: accepted\ndate: 2026-04-13\n---\n# ADR-0001: Use Postgres\n",
    );

    // 5. Add a risk to docs/yelly/risks/active.md
    mkdirSync(join(project, "docs", "yelly", "risks"), { recursive: true });
    writeFileSync(
      join(project, "docs/yelly/risks/active.md"),
      "# Active Risk Register\n\n## Risk: Migration downtime\n- Severity: 16\n- Owner: alice\n",
    );

    // 6. Sync — rewrites architecture-decisions and top-risks sections
    const syncResult = syncYellyMd(project, "0.2.0");
    expect(syncResult.yellyMdRewritten).toBe(true);
    expect(syncResult.sectionsTouched).toContain("architecture-decisions");
    expect(syncResult.sectionsTouched).toContain("top-risks");

    // 7. Validate again (post-sync)
    result = validateProjectDir(project);
    expect(result.ok).toBe(true);

    // 8. Stats reflects the artifacts
    const stats = gatherStats(project);
    expect(stats.adrCount).toBe(1);
    expect(stats.activeRiskCount).toBe(1);
    expect(stats.topRiskSeverity).toBe(16);
    expect(stats.yellyMdLines).toBeGreaterThan(0);

    // 9. YELLY.md content reflects sync output
    const finalYelly = readFileSync(join(project, "YELLY.md"), "utf-8");
    expect(finalYelly).toContain("ADR-0001");
    expect(finalYelly).toContain("Use Postgres");
    expect(finalYelly).toContain("Migration downtime");
    expect(finalYelly).toContain("yelly_lead_version: 0.2.0");
    expect(finalYelly).toContain("last_updated_by: yelly-lead-sync");

    rmSync(tmp, { recursive: true, force: true });
  });

  it("manual section update via replaceSection + appendToSection survives", () => {
    const project = join(tmp, "manual");
    mkdirSync(project, { recursive: true });
    const tplPath = join(REPO_ROOT, "templates", "YELLY.md.tmpl");
    const ctx = gatherContext(project);
    let content = renderYellyMdTemplate(
      tplPath,
      ctx,
      { phase: "MVP", currentFocus: "ship", teamSize: 1 },
      "0.2.0",
    );

    content = replaceSection(content, "active-work", "- Estimate in progress for X");
    content = appendToSection(content, "decision-log", "- 2026-04-13 — Added X estimate");
    content = stampFrontmatter(content, {
      updated_by: "/yelly-lead estimate",
      yelly_lead_version: "0.2.0",
    });

    expect(content).toContain("- Estimate in progress for X");
    expect(content).toContain("Added X estimate");
    expect(content).toContain("/yelly-lead estimate");

    rmSync(tmp, { recursive: true, force: true });
  });
});
```

- [ ] **Step 2: Run the integration test**

Run: `npx vitest run test/integration/yelly-lead-routing.test.ts`
Expected: 2/2 PASS.

- [ ] **Step 3: Run the full suite**

Run: `npm test`
Expected: all tests green — Plan 1 + Plan 2 + Plan 3 unit tests + integration test.

- [ ] **Step 4: Commit**

```bash
git add test/integration/yelly-lead-routing.test.ts
git commit -m "test(yelly-lead): add end-to-end routing integration test"
```

---

## Task 8: Final verification

- [ ] **Step 1: Full test suite**

Run: `npm test`
Expected: all tests green.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Generated SKILL.md sanity check (dry run)**

Run:
```bash
ls skills/yelly-lead/
cat skills/yelly-lead/SKILL.md.tmpl | head -10
```

Expected: template file exists with the `name: yelly-lead` frontmatter.

- [ ] **Step 4: bin tools sanity check**

Run:
```bash
npm run yelly-lead-stats -- /tmp
```

Expected: prints zero counts without crashing.

- [ ] **Step 5: Setup script syntax check**

Run: `bash -n setup`
Expected: no errors.

- [ ] **Step 6: Inventory**

Run:
```bash
ls config/yelly-lead.yaml skills/yelly-lead/SKILL.md.tmpl
ls bin/yelly-lead-sync.ts bin/yelly-lead-validate.ts bin/yelly-lead-stats.ts
ls lib/yelly-lead/sync.ts lib/yelly-lead/validate.ts lib/yelly-lead/stats.ts
ls test/integration/yelly-lead-routing.test.ts
```

Expected: all 9 listed files exist.

- [ ] **Step 7: Git status + log**

Run: `git status && git log --oneline -10`
Expected: clean tree, recent commits show 6 task commits matching `feat(yelly-lead):` / `test(yelly-lead):`.

---

## Done Criteria (Plan 3)

- [x] `skills/yelly-lead/SKILL.md.tmpl` exists with routing + permission pre-flight + bootstrap section
- [x] `config/yelly-lead.yaml` defines mega-skill defaults; `config/defaults.yaml` includes per-module yelly-lead defaults
- [x] 3 lib modules (`validate`, `stats`, `sync`) + 3 CLI wrappers, all type-checked and unit-tested
- [x] Integration test covers bootstrap → ADR → risk → sync → validate → stats end-to-end
- [x] `setup` script `SKILLS` array includes `yelly-lead`
- [x] `package.json` exposes the 3 new bin tools as npm scripts
- [x] `npm test` and `npx tsc --noEmit` clean
- [x] No modifications to Plan 1 or Plan 2 files
- [x] ~7 atomic commits

## Not In Plan 3 (will come in Plan 4)

- README architecture/modules table updates
- CHANGELOG entry
- `docs/yelly-lead/OVERVIEW.md` and `docs/yelly-lead/YELLY_MD_SCHEMA.md`
- `migrations/v0.2.0-yelly-lead.ts`
- `VERSION` bump 0.1.0 → 0.2.0
- CLAUDE.md injection logic in setup (deferred — best-effort manual instruction in OVERVIEW.md)

## Self-Review

- **Spec coverage:** §5.1 mega-skill template, §9 session continuation, §11 CLI tools all addressed.
- **Placeholder scan:** No TBDs. Every code step shows the actual code.
- **Type consistency:** All references to lib functions match Plan 1's exported API. New types (`ValidateResult`, `ProjectStats`, `SyncResult`) are defined where used.
- **Scope:** ~12 new files, 3 modified files. 8 tasks. Sequential dependencies between tasks but each is committable atomically.
- **Risk:** Task 5's `__dirname` workaround may need adjustment based on existing bin/*.ts conventions — Step 6 explicitly notes the fallback.
