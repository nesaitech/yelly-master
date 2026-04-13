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
    writeFileSync(
      join(dir, "YELLY.md"),
      "---\nlast_updated: 2026-04-13T00:00:00Z\n---\n# YELLY\n",
    );
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
