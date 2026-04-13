# 8hour-lead Plan 1 — Foundation Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the foundation library `lib/8hour-lead/*` and template files that all 4 8hour-lead modules depend on — parsing frontmatter, detecting issue trackers, safely updating the project `8HOUR.md` context file, and producing initial content from templates.

**Architecture:** Pure-function TypeScript library with no AI coupling — the AI orchestration layer (modules + SKILL.md.tmpl) will call these functions. All filesystem operations are explicit; templates use `{{VAR}}` placeholder substitution (same convention as existing `SKILL.md.tmpl`); `8HOUR.md` sections are delimited by HTML comment markers so the updater can locate and rewrite them idempotently.

**Tech Stack:** TypeScript (ES2022, Node16 modules, strict), vitest for tests, js-yaml for YAML parsing (already a dependency). No new runtime dependencies.

**Spec reference:** `docs/superpowers/specs/2026-04-13-8hour-lead-mvp-design.md` sections 5 (Architecture), 7 (8HOUR.md Schema), 8 (Bootstrap Flow), 12 (File Inventory lib rows).

**Dependency:** None. This plan is the foundation for Plans 2–4.

---

## File Structure

### New files

| Path | Responsibility |
|------|---------------|
| `lib/8hour-lead/frontmatter.ts` | Parse and serialize YAML frontmatter blocks on markdown files |
| `lib/8hour-lead/tracker-detect.ts` | Detect available issue tracker CLIs (gh, glab, jira, linear) in current project |
| `lib/8hour-lead/8hour-md-updater.ts` | Replace section content inside `8HOUR.md` using HTML-comment markers, preserving non-managed regions |
| `lib/8hour-lead/bootstrap.ts` | Pure functions for first-run context gathering (stack detection, git stats) and initial `8HOUR.md` generation from template |
| `lib/8hour-lead/index.ts` | Barrel export — re-exports all public types and functions |
| `templates/8HOUR.md.tmpl` | Root project state template with section markers |
| `templates/adr.md.tmpl` | Nygard ADR template |
| `templates/estimate.md.tmpl` | Estimate document template |
| `templates/risk.md.tmpl` | Risk entry template |
| `test/unit/8hour-lead/frontmatter.test.ts` | Unit tests for frontmatter parser |
| `test/unit/8hour-lead/tracker-detect.test.ts` | Unit tests for tracker detection |
| `test/unit/8hour-lead/8hour-md-updater.test.ts` | Unit tests for section replacement and governance |
| `test/unit/8hour-lead/bootstrap.test.ts` | Unit tests for stack detection and generation |
| `test/static/8hour-lead-templates.test.ts` | Static tests — each template file contains required markers and placeholders |

### Modified files

None. Plan 1 is purely additive.

---

## Public API Sketch (reference for later tasks)

```typescript
// frontmatter.ts
export type FrontmatterValue = string | number | boolean | null;
export type Frontmatter = Record<string, FrontmatterValue>;

export function parseFrontmatter(content: string): { frontmatter: Frontmatter; body: string };
export function serializeFrontmatter(frontmatter: Frontmatter, body: string): string;
export function readMarkdownWithFrontmatter(filepath: string): { frontmatter: Frontmatter; body: string };
export function writeMarkdownWithFrontmatter(filepath: string, frontmatter: Frontmatter, body: string): void;

// tracker-detect.ts
export type TrackerType = "github" | "gitlab" | "jira" | "linear" | "none";
export interface TrackerInfo {
  type: TrackerType;
  cliAvailable: boolean;
  detectedVia: string;
}
export function detectTracker(projectDir: string): TrackerInfo;

// 8hour-md-updater.ts
export type SectionName =
  | "project-snapshot"
  | "active-work"
  | "architecture-decisions"
  | "top-risks"
  | "tech-debt"
  | "decision-log"
  | "open-questions"
  | "pinned-notes";

export function replaceSection(content: string, section: SectionName, newBody: string): string;
export function appendToSection(content: string, section: SectionName, newLine: string): string;
export function countLines(content: string): number;
export interface UpdateMeta { updated_by: string; 8hour_lead_version: string }
export function stampFrontmatter(content: string, meta: UpdateMeta): string;

// bootstrap.ts
export interface DetectedStack {
  languages: string[];
  frameworks: string[];
  databases: string[];
}
export interface BootstrapContext {
  projectDir: string;
  projectName: string;
  stack: DetectedStack;
  teamSizeDetected: number;
}
export interface BootstrapAnswers {
  phase: string;
  currentFocus: string;
  teamSize: number;
}
export function gatherContext(projectDir: string): BootstrapContext;
export function renderEightHourMdTemplate(
  templatePath: string,
  context: BootstrapContext,
  answers: BootstrapAnswers,
  eightHourLeadVersion: string
): string;
```

---

## Task 1: frontmatter.ts — parse and serialize YAML frontmatter

**Files:**
- Create: `lib/8hour-lead/frontmatter.ts`
- Create: `test/unit/8hour-lead/frontmatter.test.ts`

- [ ] **Step 1: Create the test file**

Create `test/unit/8hour-lead/frontmatter.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import {
  parseFrontmatter,
  serializeFrontmatter,
  readMarkdownWithFrontmatter,
  writeMarkdownWithFrontmatter,
} from "../../../lib/8hour-lead/frontmatter.js";

describe("parseFrontmatter", () => {
  it("parses a markdown file with frontmatter", () => {
    const content = `---
title: Hello
count: 3
active: true
---
# Body

Text here.
`;
    const { frontmatter, body } = parseFrontmatter(content);
    expect(frontmatter).toEqual({ title: "Hello", count: 3, active: true });
    expect(body).toBe("# Body\n\nText here.\n");
  });

  it("returns empty frontmatter when missing", () => {
    const content = "# Just a body\n";
    const { frontmatter, body } = parseFrontmatter(content);
    expect(frontmatter).toEqual({});
    expect(body).toBe("# Just a body\n");
  });

  it("handles empty frontmatter block", () => {
    const content = "---\n---\nbody\n";
    const { frontmatter, body } = parseFrontmatter(content);
    expect(frontmatter).toEqual({});
    expect(body).toBe("body\n");
  });

  it("preserves horizontal rules in body (not treated as frontmatter)", () => {
    const content = "# Title\n\n---\n\nSection two\n";
    const { frontmatter, body } = parseFrontmatter(content);
    expect(frontmatter).toEqual({});
    expect(body).toBe(content);
  });
});

describe("serializeFrontmatter", () => {
  it("emits frontmatter block then body", () => {
    const out = serializeFrontmatter({ title: "X", n: 1 }, "# Body\n");
    expect(out).toBe("---\ntitle: X\nn: 1\n---\n# Body\n");
  });

  it("emits no block when frontmatter is empty", () => {
    const out = serializeFrontmatter({}, "# Body\n");
    expect(out).toBe("# Body\n");
  });
});

describe("round-trip file IO", () => {
  const tmp = join(tmpdir(), "8hour-fm-test-" + Date.now());

  it("writes and reads back frontmatter + body", () => {
    mkdirSync(tmp, { recursive: true });
    const path = join(tmp, "doc.md");
    writeMarkdownWithFrontmatter(path, { v: 1, name: "test" }, "# Hi\n");
    const parsed = readMarkdownWithFrontmatter(path);
    expect(parsed.frontmatter).toEqual({ v: 1, name: "test" });
    expect(parsed.body).toBe("# Hi\n");
    rmSync(tmp, { recursive: true, force: true });
  });

  it("returns empty result for missing file", () => {
    const result = readMarkdownWithFrontmatter("/nonexistent/x.md");
    expect(result.frontmatter).toEqual({});
    expect(result.body).toBe("");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/unit/8hour-lead/frontmatter.test.ts`
Expected: FAIL — "Cannot find module '../../../lib/8hour-lead/frontmatter.js'"

- [ ] **Step 3: Create the implementation**

Create `lib/8hour-lead/frontmatter.ts`:

```typescript
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname } from "path";
import yaml from "js-yaml";

export type FrontmatterValue = string | number | boolean | null;
export type Frontmatter = Record<string, FrontmatterValue>;

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n?---\r?\n?([\s\S]*)$/;

export function parseFrontmatter(content: string): {
  frontmatter: Frontmatter;
  body: string;
} {
  const match = content.match(FRONTMATTER_RE);
  if (!match) {
    return { frontmatter: {}, body: content };
  }
  const rawYaml = match[1];
  const body = match[2];
  let parsed: Frontmatter = {};
  if (rawYaml.trim().length > 0) {
    const loaded = yaml.load(rawYaml) as unknown;
    if (loaded && typeof loaded === "object") {
      parsed = loaded as Frontmatter;
    }
  }
  return { frontmatter: parsed, body };
}

export function serializeFrontmatter(
  frontmatter: Frontmatter,
  body: string,
): string {
  if (Object.keys(frontmatter).length === 0) {
    return body;
  }
  const yamlBlock = yaml.dump(frontmatter, { lineWidth: 120 }).trimEnd();
  return `---\n${yamlBlock}\n---\n${body}`;
}

export function readMarkdownWithFrontmatter(filepath: string): {
  frontmatter: Frontmatter;
  body: string;
} {
  if (!existsSync(filepath)) {
    return { frontmatter: {}, body: "" };
  }
  const content = readFileSync(filepath, "utf-8");
  return parseFrontmatter(content);
}

export function writeMarkdownWithFrontmatter(
  filepath: string,
  frontmatter: Frontmatter,
  body: string,
): void {
  const dir = dirname(filepath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(filepath, serializeFrontmatter(frontmatter, body), "utf-8");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/unit/8hour-lead/frontmatter.test.ts`
Expected: PASS — all 7 tests green

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add lib/8hour-lead/frontmatter.ts test/unit/8hour-lead/frontmatter.test.ts
git commit -m "feat(8hour-lead): add frontmatter parser/serializer lib"
```

---

## Task 2: tracker-detect.ts — detect available issue tracker

**Files:**
- Create: `lib/8hour-lead/tracker-detect.ts`
- Create: `test/unit/8hour-lead/tracker-detect.test.ts`

- [ ] **Step 1: Create the test file**

Create `test/unit/8hour-lead/tracker-detect.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { detectTracker } from "../../../lib/8hour-lead/tracker-detect.js";

describe("detectTracker", () => {
  const tmp = join(tmpdir(), "8hour-tracker-test-" + Date.now());

  it("returns none for empty directory", () => {
    mkdirSync(tmp, { recursive: true });
    const info = detectTracker(tmp);
    expect(info.type).toBe("none");
    expect(info.cliAvailable).toBe(false);
    rmSync(tmp, { recursive: true, force: true });
  });

  it("detects github when .github dir exists", () => {
    const dir = join(tmp, "gh");
    mkdirSync(join(dir, ".github"), { recursive: true });
    const info = detectTracker(dir);
    expect(info.type).toBe("github");
    expect(info.detectedVia).toContain(".github/");
    rmSync(tmp, { recursive: true, force: true });
  });

  it("detects gitlab from .gitlab-ci.yml", () => {
    const dir = join(tmp, "gl");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, ".gitlab-ci.yml"), "stages: []\n");
    const info = detectTracker(dir);
    expect(info.type).toBe("gitlab");
    expect(info.detectedVia).toContain(".gitlab-ci.yml");
    rmSync(tmp, { recursive: true, force: true });
  });

  it("cliAvailable is a boolean regardless of detection", () => {
    mkdirSync(join(tmp, "x", ".github"), { recursive: true });
    const info = detectTracker(join(tmp, "x"));
    expect(typeof info.cliAvailable).toBe("boolean");
    rmSync(tmp, { recursive: true, force: true });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/unit/8hour-lead/tracker-detect.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Create the implementation**

Create `lib/8hour-lead/tracker-detect.ts`:

```typescript
import { existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

export type TrackerType = "github" | "gitlab" | "jira" | "linear" | "none";

export interface TrackerInfo {
  type: TrackerType;
  cliAvailable: boolean;
  detectedVia: string;
}

function cliExists(binary: string): boolean {
  try {
    execSync(`command -v ${binary}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function detectTracker(projectDir: string): TrackerInfo {
  if (existsSync(join(projectDir, ".github"))) {
    return {
      type: "github",
      cliAvailable: cliExists("gh"),
      detectedVia: ".github/ directory present",
    };
  }
  if (existsSync(join(projectDir, ".gitlab-ci.yml"))) {
    return {
      type: "gitlab",
      cliAvailable: cliExists("glab"),
      detectedVia: ".gitlab-ci.yml present",
    };
  }
  if (cliExists("linear")) {
    return {
      type: "linear",
      cliAvailable: true,
      detectedVia: "linear CLI in PATH",
    };
  }
  if (cliExists("jira")) {
    return {
      type: "jira",
      cliAvailable: true,
      detectedVia: "jira CLI in PATH",
    };
  }
  return {
    type: "none",
    cliAvailable: false,
    detectedVia: "no tracker signals found",
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/unit/8hour-lead/tracker-detect.test.ts`
Expected: PASS — all 4 tests green

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add lib/8hour-lead/tracker-detect.ts test/unit/8hour-lead/tracker-detect.test.ts
git commit -m "feat(8hour-lead): add tracker detection (github/gitlab/jira/linear)"
```

---

## Task 3: 8HOUR.md template with section markers

**Files:**
- Create: `templates/8HOUR.md.tmpl`
- Create: `test/static/8hour-lead-templates.test.ts`

- [ ] **Step 1: Create the template**

Create `templates/8HOUR.md.tmpl`:

```markdown
---
8hour_version: 1
8hour_lead_version: {{EIGHT_HOUR_LEAD_VERSION}}
last_updated: {{LAST_UPDATED}}
last_updated_by: /8hour-lead bootstrap
schema: project-state
---

# 8HOUR — Project Tech Lead Context

> Auto-generated by /8hour-lead. Do not edit manually except for the Pinned Notes section.
> Regenerate or refresh with `8hour-lead-sync`.

## Project Snapshot
<!-- 8hour-lead: project-snapshot -->
- **Project:** {{PROJECT_NAME}}
- **Stack:** {{STACK}}
- **Phase:** {{PHASE}}
- **Team:** {{TEAM_SIZE}}
- **Current focus:** {{CURRENT_FOCUS}}
<!-- /8hour-lead: project-snapshot -->

## Active Work
<!-- 8hour-lead: active-work -->
_None yet. Start a task with `/8hour-lead estimate <feature>` or `/8hour-lead adr <decision>`._
<!-- /8hour-lead: active-work -->

## Architecture Decisions (latest 5)
<!-- 8hour-lead: architecture-decisions -->
_No ADRs recorded yet._
<!-- /8hour-lead: architecture-decisions -->

## Top Risks (live, top 5 by severity)
<!-- 8hour-lead: top-risks -->
_No risks tracked yet._
<!-- /8hour-lead: top-risks -->

## Tech Debt (top 5)
<!-- 8hour-lead: tech-debt -->
_No debt tracked yet._
<!-- /8hour-lead: tech-debt -->

## Decision Log (last 10)
<!-- 8hour-lead: decision-log -->
- {{LAST_UPDATED}} — Project initialized via /8hour-lead bootstrap
<!-- /8hour-lead: decision-log -->

## Open Questions
<!-- 8hour-lead: open-questions -->
_None._
<!-- /8hour-lead: open-questions -->

## Pinned Notes
<!-- 8hour-lead: pinned-notes (preserved across regeneration) -->

<!-- /8hour-lead: pinned-notes -->
```

- [ ] **Step 2: Create the static test**

Create `test/static/8hour-lead-templates.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..", "..");
const TEMPLATES = join(ROOT, "templates");

describe("8HOUR.md.tmpl", () => {
  const path = join(TEMPLATES, "8HOUR.md.tmpl");

  it("exists", () => {
    expect(existsSync(path)).toBe(true);
  });

  const content = existsSync(path) ? readFileSync(path, "utf-8") : "";

  it("has frontmatter with required fields", () => {
    expect(content).toMatch(/^---\n[\s\S]*?8hour_version: 1/);
    expect(content).toContain("8hour_lead_version: {{EIGHT_HOUR_LEAD_VERSION}}");
    expect(content).toContain("last_updated: {{LAST_UPDATED}}");
    expect(content).toContain("schema: project-state");
  });

  const REQUIRED_SECTIONS = [
    "project-snapshot",
    "active-work",
    "architecture-decisions",
    "top-risks",
    "tech-debt",
    "decision-log",
    "open-questions",
    "pinned-notes",
  ];

  for (const section of REQUIRED_SECTIONS) {
    it(`has open + close markers for "${section}"`, () => {
      expect(content).toContain(`<!-- 8hour-lead: ${section}`);
      expect(content).toContain(`<!-- /8hour-lead: ${section} -->`);
    });
  }

  const REQUIRED_PLACEHOLDERS = [
    "{{EIGHT_HOUR_LEAD_VERSION}}",
    "{{LAST_UPDATED}}",
    "{{PROJECT_NAME}}",
    "{{STACK}}",
    "{{PHASE}}",
    "{{TEAM_SIZE}}",
    "{{CURRENT_FOCUS}}",
  ];

  for (const placeholder of REQUIRED_PLACEHOLDERS) {
    it(`contains placeholder ${placeholder}`, () => {
      expect(content).toContain(placeholder);
    });
  }
});
```

- [ ] **Step 3: Run the test**

Run: `npx vitest run test/static/8hour-lead-templates.test.ts`
Expected: PASS — template file exists and satisfies all markers + placeholders

- [ ] **Step 4: Commit**

```bash
git add templates/8HOUR.md.tmpl test/static/8hour-lead-templates.test.ts
git commit -m "feat(8hour-lead): add 8HOUR.md template with section markers"
```

---

## Task 4: ADR, estimate, and risk templates

**Files:**
- Create: `templates/adr.md.tmpl`
- Create: `templates/estimate.md.tmpl`
- Create: `templates/risk.md.tmpl`
- Modify: `test/static/8hour-lead-templates.test.ts` (extend)

- [ ] **Step 1: Create `templates/adr.md.tmpl`**

```markdown
---
adr_number: {{ADR_NUMBER}}
title: {{TITLE}}
status: proposed
date: {{DATE}}
supersedes: none
superseded_by: none
---

# ADR-{{ADR_NUMBER}}: {{TITLE}}

## Status

Proposed — {{DATE}}

## Context

{{CONTEXT}}

## Decision

{{DECISION}}

## Consequences

**Positive:**
- {{POSITIVE_CONSEQUENCE}}

**Negative:**
- {{NEGATIVE_CONSEQUENCE}}

**Neutral:**
- {{NEUTRAL_CONSEQUENCE}}

## Alternatives Considered

### {{ALTERNATIVE_TITLE}}
{{ALTERNATIVE_DESCRIPTION}}

Rejected because: {{ALTERNATIVE_REJECTION}}

## References

- Spec: {{SPEC_LINK}}
- PR: {{PR_LINK}}
```

- [ ] **Step 2: Create `templates/estimate.md.tmpl`**

```markdown
---
estimate_id: {{ESTIMATE_ID}}
topic: {{TOPIC}}
date: {{DATE}}
status: open
confidence: {{CONFIDENCE}}
---

# Estimate: {{TOPIC}}

## Scope

{{SCOPE_DESCRIPTION}}

## Decomposition

| Task | Optimistic (O) | Most Likely (M) | Pessimistic (P) |
|------|---------------:|-----------------:|----------------:|
| {{TASK_1}} | {{O_1}} | {{M_1}} | {{P_1}} |

## PERT Calculation

- **Expected (E):** (O + 4M + P) / 6 = **{{EXPECTED_DAYS}}d**
- **Standard deviation (σ):** (P - O) / 6 = **{{SIGMA}}d**
- **P50:** {{EXPECTED_DAYS}}d
- **P80:** {{P80_DAYS}}d
- **P95:** {{P95_DAYS}}d

## Risk Adjustment

Multiplier applied: **{{RISK_FACTOR}}×** (from risk module: {{RISK_REASON}})

**Final estimate:** {{FINAL_DAYS}}d ±{{FINAL_SIGMA}}d at {{CONFIDENCE}} confidence

## Assumptions

- {{ASSUMPTION}}

## Closure (filled when work ships)

- **Actual days:** _pending_
- **Error vs P50:** _pending_
- **Calibration note:** _pending_
```

- [ ] **Step 3: Create `templates/risk.md.tmpl`**

```markdown
---
risk_id: {{RISK_ID}}
date: {{DATE}}
status: active
owner: {{OWNER}}
---

## Risk: {{TITLE}}

- **Impact:** {{IMPACT}}/5
- **Probability:** {{PROBABILITY}}/5
- **Severity:** {{SEVERITY}} (= Impact × Probability)
- **Owner:** {{OWNER}}
- **Due date:** {{DUE_DATE}}

### Description

{{DESCRIPTION}}

### Mitigation

{{MITIGATION}}

### Contingency

{{CONTINGENCY}}

### Review notes

- {{DATE}} — created
```

- [ ] **Step 4: Extend the static test**

Append this block to `test/static/8hour-lead-templates.test.ts` at the end of the file:

```typescript
describe("adr.md.tmpl", () => {
  const path = join(TEMPLATES, "adr.md.tmpl");

  it("exists", () => {
    expect(existsSync(path)).toBe(true);
  });

  const content = existsSync(path) ? readFileSync(path, "utf-8") : "";

  it("uses Nygard sections", () => {
    expect(content).toContain("## Status");
    expect(content).toContain("## Context");
    expect(content).toContain("## Decision");
    expect(content).toContain("## Consequences");
    expect(content).toContain("## Alternatives Considered");
  });

  for (const placeholder of [
    "{{ADR_NUMBER}}",
    "{{TITLE}}",
    "{{DATE}}",
    "{{CONTEXT}}",
    "{{DECISION}}",
  ]) {
    it(`contains placeholder ${placeholder}`, () => {
      expect(content).toContain(placeholder);
    });
  }
});

describe("estimate.md.tmpl", () => {
  const path = join(TEMPLATES, "estimate.md.tmpl");

  it("exists", () => {
    expect(existsSync(path)).toBe(true);
  });

  const content = existsSync(path) ? readFileSync(path, "utf-8") : "";

  it("has PERT formula and P50/P80/P95", () => {
    expect(content).toContain("(O + 4M + P) / 6");
    expect(content).toContain("P50");
    expect(content).toContain("P80");
    expect(content).toContain("P95");
  });
});

describe("risk.md.tmpl", () => {
  const path = join(TEMPLATES, "risk.md.tmpl");

  it("exists", () => {
    expect(existsSync(path)).toBe(true);
  });

  const content = existsSync(path) ? readFileSync(path, "utf-8") : "";

  it("has impact × probability × severity fields", () => {
    expect(content).toContain("Impact");
    expect(content).toContain("Probability");
    expect(content).toContain("Severity");
  });
});
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run test/static/8hour-lead-templates.test.ts`
Expected: PASS — all template tests green

- [ ] **Step 6: Commit**

```bash
git add templates/adr.md.tmpl templates/estimate.md.tmpl templates/risk.md.tmpl test/static/8hour-lead-templates.test.ts
git commit -m "feat(8hour-lead): add adr, estimate, risk templates"
```

---

## Task 5: 8hour-md-updater.ts — replaceSection and appendToSection

**Files:**
- Create: `lib/8hour-lead/8hour-md-updater.ts`
- Create: `test/unit/8hour-lead/8hour-md-updater.test.ts`

- [ ] **Step 1: Create the test file**

Create `test/unit/8hour-lead/8hour-md-updater.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  replaceSection,
  appendToSection,
  countLines,
  stampFrontmatter,
} from "../../../lib/8hour-lead/8hour-md-updater.js";

const SAMPLE = `---
8hour_version: 1
8hour_lead_version: 0.1.0
last_updated: 2026-04-01T00:00:00Z
last_updated_by: old
schema: project-state
---

# 8HOUR

## Active Work
<!-- 8hour-lead: active-work -->
_None yet._
<!-- /8hour-lead: active-work -->

## Decision Log (last 10)
<!-- 8hour-lead: decision-log -->
- 2026-04-01 — Project initialized
<!-- /8hour-lead: decision-log -->
`;

describe("replaceSection", () => {
  it("replaces section body between markers", () => {
    const out = replaceSection(SAMPLE, "active-work", "- Estimate in progress");
    expect(out).toContain("- Estimate in progress");
    expect(out).not.toContain("_None yet._");
    expect(out).toContain("<!-- 8hour-lead: active-work -->");
    expect(out).toContain("<!-- /8hour-lead: active-work -->");
  });

  it("is idempotent — replacing twice yields the same content", () => {
    const once = replaceSection(SAMPLE, "active-work", "- X");
    const twice = replaceSection(once, "active-work", "- X");
    expect(twice).toBe(once);
  });

  it("leaves other sections untouched", () => {
    const out = replaceSection(SAMPLE, "active-work", "- X");
    expect(out).toContain("- 2026-04-01 — Project initialized");
  });

  it("throws when section marker missing", () => {
    expect(() => replaceSection(SAMPLE, "top-risks", "- X")).toThrow(
      /top-risks/,
    );
  });
});

describe("appendToSection", () => {
  it("appends a line before the closing marker", () => {
    const out = appendToSection(
      SAMPLE,
      "decision-log",
      "- 2026-04-13 — Chose Postgres over MySQL",
    );
    expect(out).toContain("- 2026-04-01 — Project initialized");
    expect(out).toContain("- 2026-04-13 — Chose Postgres over MySQL");
    // order: old line then new line
    const oldIdx = out.indexOf("Project initialized");
    const newIdx = out.indexOf("Chose Postgres");
    expect(oldIdx).toBeLessThan(newIdx);
  });

  it("adds a line when section was a placeholder", () => {
    const out = appendToSection(SAMPLE, "active-work", "- First real entry");
    expect(out).toContain("- First real entry");
  });
});

describe("countLines", () => {
  it("counts newline-separated lines", () => {
    expect(countLines("a\nb\nc\n")).toBe(3);
    expect(countLines("a\nb\nc")).toBe(3);
    expect(countLines("")).toBe(0);
  });
});

describe("stampFrontmatter", () => {
  it("updates last_updated and last_updated_by", () => {
    const out = stampFrontmatter(SAMPLE, {
      updated_by: "/8hour-lead estimate",
      8hour_lead_version: "0.2.0",
    });
    expect(out).toContain("last_updated_by: /8hour-lead estimate");
    expect(out).toContain("8hour_lead_version: 0.2.0");
    expect(out).not.toContain("last_updated: 2026-04-01T00:00:00Z");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/unit/8hour-lead/8hour-md-updater.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Create the implementation**

Create `lib/8hour-lead/8hour-md-updater.ts`:

```typescript
import {
  parseFrontmatter,
  serializeFrontmatter,
  type Frontmatter,
} from "./frontmatter.js";

export type SectionName =
  | "project-snapshot"
  | "active-work"
  | "architecture-decisions"
  | "top-risks"
  | "tech-debt"
  | "decision-log"
  | "open-questions"
  | "pinned-notes";

export interface UpdateMeta {
  updated_by: string;
  8hour_lead_version: string;
}

function buildSectionRegex(section: SectionName): RegExp {
  // Matches: <!-- 8hour-lead: section ... -->\n BODY \n<!-- /8hour-lead: section -->
  const esc = section.replace(/-/g, "\\-");
  return new RegExp(
    `(<!--\\s*8hour-lead:\\s*${esc}[^>]*-->)([\\s\\S]*?)(<!--\\s*/8hour-lead:\\s*${esc}\\s*-->)`,
    "m",
  );
}

export function replaceSection(
  content: string,
  section: SectionName,
  newBody: string,
): string {
  const re = buildSectionRegex(section);
  if (!re.test(content)) {
    throw new Error(`Section marker not found: ${section}`);
  }
  const normalizedBody = newBody.endsWith("\n") ? newBody : newBody + "\n";
  return content.replace(re, `$1\n${normalizedBody}$3`);
}

export function appendToSection(
  content: string,
  section: SectionName,
  newLine: string,
): string {
  const re = buildSectionRegex(section);
  const match = content.match(re);
  if (!match) {
    throw new Error(`Section marker not found: ${section}`);
  }
  const existingBody = match[2].trim();
  const isPlaceholder =
    existingBody === "" ||
    /^_[^_]+_$/.test(existingBody) ||
    /^_None( yet)?\._$/.test(existingBody);
  const merged = isPlaceholder
    ? newLine
    : `${existingBody}\n${newLine}`;
  return replaceSection(content, section, merged);
}

export function countLines(content: string): number {
  if (content.length === 0) return 0;
  const trimmed = content.endsWith("\n") ? content.slice(0, -1) : content;
  return trimmed.split("\n").length;
}

export function stampFrontmatter(content: string, meta: UpdateMeta): string {
  const { frontmatter, body } = parseFrontmatter(content);
  const updated: Frontmatter = {
    ...frontmatter,
    last_updated: new Date().toISOString(),
    last_updated_by: meta.updated_by,
    8hour_lead_version: meta.8hour_lead_version,
  };
  return serializeFrontmatter(updated, body);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/unit/8hour-lead/8hour-md-updater.test.ts`
Expected: PASS — all tests green

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add lib/8hour-lead/8hour-md-updater.ts test/unit/8hour-lead/8hour-md-updater.test.ts
git commit -m "feat(8hour-lead): add 8HOUR.md section updater with replace/append"
```

---

## Task 6: bootstrap.ts — gatherContext (stack + git detection)

**Files:**
- Create: `lib/8hour-lead/bootstrap.ts`
- Create: `test/unit/8hour-lead/bootstrap.test.ts`

- [ ] **Step 1: Create the test file**

Create `test/unit/8hour-lead/bootstrap.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import {
  gatherContext,
  renderEightHourMdTemplate,
} from "../../../lib/8hour-lead/bootstrap.js";

describe("gatherContext", () => {
  const tmp = join(tmpdir(), "8hour-boot-test-" + Date.now());

  it("detects project name from directory", () => {
    const dir = join(tmp, "my-app");
    mkdirSync(dir, { recursive: true });
    const ctx = gatherContext(dir);
    expect(ctx.projectName).toBe("my-app");
    expect(ctx.projectDir).toBe(dir);
    rmSync(tmp, { recursive: true, force: true });
  });

  it("detects typescript + node from package.json", () => {
    const dir = join(tmp, "node-app");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({
        name: "x",
        dependencies: { express: "4.0.0" },
        devDependencies: { typescript: "5.0.0" },
      }),
    );
    const ctx = gatherContext(dir);
    expect(ctx.stack.languages).toContain("typescript");
    expect(ctx.stack.languages).toContain("node");
    expect(ctx.stack.frameworks).toContain("express");
    rmSync(tmp, { recursive: true, force: true });
  });

  it("detects python from requirements.txt", () => {
    const dir = join(tmp, "py-app");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "requirements.txt"), "flask==2.0\n");
    const ctx = gatherContext(dir);
    expect(ctx.stack.languages).toContain("python");
    rmSync(tmp, { recursive: true, force: true });
  });

  it("detects go from go.mod", () => {
    const dir = join(tmp, "go-app");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "go.mod"), "module x\n\ngo 1.22\n");
    const ctx = gatherContext(dir);
    expect(ctx.stack.languages).toContain("go");
    rmSync(tmp, { recursive: true, force: true });
  });

  it("detects postgres from deps", () => {
    const dir = join(tmp, "db-app");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({ dependencies: { pg: "8.0.0" } }),
    );
    const ctx = gatherContext(dir);
    expect(ctx.stack.databases).toContain("postgres");
    rmSync(tmp, { recursive: true, force: true });
  });

  it("teamSizeDetected defaults to 1 when git unavailable", () => {
    const dir = join(tmp, "no-git");
    mkdirSync(dir, { recursive: true });
    const ctx = gatherContext(dir);
    expect(ctx.teamSizeDetected).toBeGreaterThanOrEqual(1);
    rmSync(tmp, { recursive: true, force: true });
  });
});

describe("renderEightHourMdTemplate", () => {
  const tmp = join(tmpdir(), "8hour-render-test-" + Date.now());

  it("substitutes placeholders", () => {
    mkdirSync(tmp, { recursive: true });
    const tplPath = join(tmp, "8HOUR.md.tmpl");
    writeFileSync(
      tplPath,
      [
        "---",
        "8hour_version: 1",
        "8hour_lead_version: {{EIGHT_HOUR_LEAD_VERSION}}",
        "last_updated: {{LAST_UPDATED}}",
        "---",
        "# {{PROJECT_NAME}}",
        "Stack: {{STACK}}",
        "Phase: {{PHASE}}",
        "Team: {{TEAM_SIZE}}",
        "Focus: {{CURRENT_FOCUS}}",
        "",
      ].join("\n"),
    );
    const output = renderEightHourMdTemplate(
      tplPath,
      {
        projectDir: tmp,
        projectName: "demo",
        stack: {
          languages: ["typescript", "node"],
          frameworks: ["express"],
          databases: ["postgres"],
        },
        teamSizeDetected: 4,
      },
      { phase: "MVP", currentFocus: "ship auth", teamSize: 4 },
      "0.2.0",
    );
    expect(output).toContain("8hour_lead_version: 0.2.0");
    expect(output).toContain("# demo");
    expect(output).toContain("Phase: MVP");
    expect(output).toContain("Team: 4");
    expect(output).toContain("Focus: ship auth");
    expect(output).toContain("typescript");
    expect(output).not.toContain("{{");
    rmSync(tmp, { recursive: true, force: true });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/unit/8hour-lead/bootstrap.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Create the implementation**

Create `lib/8hour-lead/bootstrap.ts`:

```typescript
import { readFileSync, existsSync } from "fs";
import { join, basename } from "path";
import { execSync } from "child_process";

export interface DetectedStack {
  languages: string[];
  frameworks: string[];
  databases: string[];
}

export interface BootstrapContext {
  projectDir: string;
  projectName: string;
  stack: DetectedStack;
  teamSizeDetected: number;
}

export interface BootstrapAnswers {
  phase: string;
  currentFocus: string;
  teamSize: number;
}

const FRAMEWORK_HINTS: Record<string, string> = {
  express: "express",
  fastify: "fastify",
  next: "next",
  "@nestjs/core": "nestjs",
  react: "react",
  vue: "vue",
  svelte: "svelte",
  flask: "flask",
  django: "django",
  fastapi: "fastapi",
  gin: "gin",
};

const DATABASE_HINTS: Record<string, string> = {
  pg: "postgres",
  "pg-promise": "postgres",
  postgres: "postgres",
  mysql: "mysql",
  mysql2: "mysql",
  mongodb: "mongodb",
  mongoose: "mongodb",
  redis: "redis",
  ioredis: "redis",
  sqlite3: "sqlite",
  "better-sqlite3": "sqlite",
  prisma: "prisma",
  "@prisma/client": "prisma",
};

function readJsonSafe(path: string): Record<string, unknown> | null {
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}

function detectStack(projectDir: string): DetectedStack {
  const languages = new Set<string>();
  const frameworks = new Set<string>();
  const databases = new Set<string>();

  const pkgPath = join(projectDir, "package.json");
  if (existsSync(pkgPath)) {
    languages.add("node");
    const pkg = readJsonSafe(pkgPath) ?? {};
    const deps = {
      ...(pkg.dependencies as Record<string, string> | undefined),
      ...(pkg.devDependencies as Record<string, string> | undefined),
    };
    if (deps && typeof deps === "object") {
      if ("typescript" in deps) languages.add("typescript");
      for (const name of Object.keys(deps)) {
        if (FRAMEWORK_HINTS[name]) frameworks.add(FRAMEWORK_HINTS[name]);
        if (DATABASE_HINTS[name]) databases.add(DATABASE_HINTS[name]);
      }
    }
  }

  if (existsSync(join(projectDir, "requirements.txt"))) {
    languages.add("python");
    try {
      const reqs = readFileSync(
        join(projectDir, "requirements.txt"),
        "utf-8",
      );
      for (const line of reqs.split("\n")) {
        const name = line.split(/[=<>~!]/)[0].trim().toLowerCase();
        if (FRAMEWORK_HINTS[name]) frameworks.add(FRAMEWORK_HINTS[name]);
        if (DATABASE_HINTS[name]) databases.add(DATABASE_HINTS[name]);
      }
    } catch {
      // ignore
    }
  }

  if (existsSync(join(projectDir, "pyproject.toml"))) {
    languages.add("python");
  }

  if (existsSync(join(projectDir, "go.mod"))) {
    languages.add("go");
  }

  if (existsSync(join(projectDir, "Cargo.toml"))) {
    languages.add("rust");
  }

  return {
    languages: Array.from(languages).sort(),
    frameworks: Array.from(frameworks).sort(),
    databases: Array.from(databases).sort(),
  };
}

function detectTeamSize(projectDir: string): number {
  try {
    const output = execSync("git shortlog -sne --all", {
      cwd: projectDir,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    if (!output) return 1;
    return output.split("\n").length;
  } catch {
    return 1;
  }
}

export function gatherContext(projectDir: string): BootstrapContext {
  return {
    projectDir,
    projectName: basename(projectDir),
    stack: detectStack(projectDir),
    teamSizeDetected: detectTeamSize(projectDir),
  };
}

function stackToString(stack: DetectedStack): string {
  const parts: string[] = [];
  if (stack.languages.length > 0) parts.push(stack.languages.join(" + "));
  if (stack.frameworks.length > 0) parts.push(`(${stack.frameworks.join(", ")})`);
  if (stack.databases.length > 0) parts.push(`[db: ${stack.databases.join(", ")}]`);
  return parts.length > 0 ? parts.join(" ") : "unknown";
}

export function renderEightHourMdTemplate(
  templatePath: string,
  context: BootstrapContext,
  answers: BootstrapAnswers,
  eightHourLeadVersion: string,
): string {
  const template = readFileSync(templatePath, "utf-8");
  const replacements: Record<string, string> = {
    EIGHT_HOUR_LEAD_VERSION: eightHourLeadVersion,
    LAST_UPDATED: new Date().toISOString(),
    PROJECT_NAME: context.projectName,
    STACK: stackToString(context.stack),
    PHASE: answers.phase,
    TEAM_SIZE: String(answers.teamSize),
    CURRENT_FOCUS: answers.currentFocus,
  };
  let output = template;
  for (const [key, value] of Object.entries(replacements)) {
    output = output.replaceAll(`{{${key}}}`, value);
  }
  return output;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/unit/8hour-lead/bootstrap.test.ts`
Expected: PASS — all 7 tests green

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add lib/8hour-lead/bootstrap.ts test/unit/8hour-lead/bootstrap.test.ts
git commit -m "feat(8hour-lead): add bootstrap context gathering + template rendering"
```

---

## Task 7: index.ts barrel export

**Files:**
- Create: `lib/8hour-lead/index.ts`

- [ ] **Step 1: Create the barrel**

Create `lib/8hour-lead/index.ts`:

```typescript
export {
  parseFrontmatter,
  serializeFrontmatter,
  readMarkdownWithFrontmatter,
  writeMarkdownWithFrontmatter,
  type Frontmatter,
  type FrontmatterValue,
} from "./frontmatter.js";

export {
  detectTracker,
  type TrackerType,
  type TrackerInfo,
} from "./tracker-detect.js";

export {
  replaceSection,
  appendToSection,
  countLines,
  stampFrontmatter,
  type SectionName,
  type UpdateMeta,
} from "./8hour-md-updater.js";

export {
  gatherContext,
  renderEightHourMdTemplate,
  type DetectedStack,
  type BootstrapContext,
  type BootstrapAnswers,
} from "./bootstrap.js";
```

- [ ] **Step 2: Type-check full project**

Run: `npx tsc --noEmit`
Expected: no errors — barrel re-exports resolve cleanly

- [ ] **Step 3: Run full test suite**

Run: `npm test`
Expected: all existing tests continue passing + all new 8hour-lead tests green

- [ ] **Step 4: Commit**

```bash
git add lib/8hour-lead/index.ts
git commit -m "feat(8hour-lead): add barrel export for lib/8hour-lead"
```

---

## Task 8: Wire 8hour-lead tests into npm scripts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Inspect current npm scripts**

Run: `cat package.json | grep -A 10 '"scripts"'`
Expected: see existing `test`, `test:unit`, `test:static`, `test:watch` entries

- [ ] **Step 2: Verify vitest already discovers the new tests**

Run: `npx vitest run test/unit/8hour-lead/ test/static/8hour-lead-templates.test.ts`
Expected: all 8hour-lead tests run green — no script changes required (vitest globs `test/unit/**` and `test/static/**` by default)

- [ ] **Step 3: Add a dedicated convenience script**

Apply this edit to `package.json` — insert one new script after `"test:static"`:

Before:
```json
"test:static": "vitest run test/static/",
"test:unit": "vitest run test/unit/",
```

After:
```json
"test:static": "vitest run test/static/",
"test:unit": "vitest run test/unit/",
"test:8hour-lead": "vitest run test/unit/8hour-lead/ test/static/8hour-lead-templates.test.ts",
```

- [ ] **Step 4: Run the new script**

Run: `npm run test:8hour-lead`
Expected: all 8hour-lead tests pass, no unrelated tests run

- [ ] **Step 5: Commit**

```bash
git add package.json
git commit -m "chore(8hour-lead): add test:8hour-lead npm script"
```

---

## Task 9: Final verification

- [ ] **Step 1: Full test suite**

Run: `npm test`
Expected: all tests green — existing suite unaffected, new foundation tests all pass

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: zero errors

- [ ] **Step 3: Sanity-check file inventory**

Run: `ls -la lib/8hour-lead/ templates/ test/unit/8hour-lead/ test/static/8hour-lead-templates.test.ts`
Expected output includes:
- `lib/8hour-lead/frontmatter.ts`
- `lib/8hour-lead/tracker-detect.ts`
- `lib/8hour-lead/8hour-md-updater.ts`
- `lib/8hour-lead/bootstrap.ts`
- `lib/8hour-lead/index.ts`
- `templates/8HOUR.md.tmpl`
- `templates/adr.md.tmpl`
- `templates/estimate.md.tmpl`
- `templates/risk.md.tmpl`
- `test/unit/8hour-lead/frontmatter.test.ts`
- `test/unit/8hour-lead/tracker-detect.test.ts`
- `test/unit/8hour-lead/8hour-md-updater.test.ts`
- `test/unit/8hour-lead/bootstrap.test.ts`
- `test/static/8hour-lead-templates.test.ts`

- [ ] **Step 4: Git status check**

Run: `git status`
Expected: clean working tree — all commits from tasks 1-8 are in

- [ ] **Step 5: Review commit history**

Run: `git log --oneline -10`
Expected: a sequence of `feat(8hour-lead):` commits matching the task order

---

## Done Criteria (Plan 1)

- [x] Spec sections 5.3, 7, 8, 12 (lib rows, template rows) have concrete, tested implementations
- [x] `npm test` green
- [x] `npx tsc --noEmit` clean
- [x] All public API from the sketch block above is exported and type-checked
- [x] Templates contain required section markers and placeholders (enforced by static tests)
- [x] 8 small, atomic commits — one feature per commit
- [x] No dependency version bumps, no new runtime dependencies
- [x] `package.json` has a `test:8hour-lead` convenience script

## Not In Plan 1 (will come in later plans)

- Module content (`modules/estimate`, `modules/risk`, `modules/adr`, `modules/debt`) → Plan 2
- `/8hour-lead` SKILL.md.tmpl, routing, permission pre-flight → Plan 3
- `bin/8hour-lead-sync`, `8hour-lead-validate`, `8hour-lead-stats` CLI tools → Plan 3
- Setup script integration + CLAUDE.md injection → Plan 3
- README, CHANGELOG, OVERVIEW, migration script, version bump → Plan 4

## Self-Review Notes

- **Spec coverage:** Library rows from spec §12 fully covered (`frontmatter.ts`, `8hour-md-updater.ts`, `bootstrap.ts`, `tracker-detect.ts`) + all 4 templates + initial static + unit tests.
- **Placeholder scan:** No TBDs, no "implement later", every code step has complete source.
- **Type consistency:** `SectionName` is the same enum everywhere; `BootstrapContext` / `BootstrapAnswers` / `DetectedStack` match between `bootstrap.ts` and its test; `FrontmatterValue` is exported from `frontmatter.ts` and re-exported in `index.ts`.
- **Scope:** Plan 1 is a single session executable — ~8 commits, all additive, no refactors, no coupling with AI layer.
