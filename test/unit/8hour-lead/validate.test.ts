import { describe, it, expect } from "vitest";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { validateProjectDir } from "../../../lib/8hour-lead/validate.js";

describe("validateProjectDir", () => {
  const tmp = join(tmpdir(), "8hour-validate-test-" + Date.now());

  it("ok=false when 8HOUR.md is missing", () => {
    const dir = join(tmp, "no-8hour");
    mkdirSync(dir, { recursive: true });
    const result = validateProjectDir(dir);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("8HOUR.md"))).toBe(true);
    rmSync(tmp, { recursive: true, force: true });
  });

  it("ok=true for a minimal valid 8HOUR.md", () => {
    const dir = join(tmp, "valid");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "8HOUR.md"),
      `---
8hour_version: 1
8hour_lead_version: 0.2.0
last_updated: 2026-04-13T00:00:00Z
last_updated_by: /8hour-lead bootstrap
schema: project-state
---

# 8HOUR

## Project Snapshot
<!-- 8hour-lead: project-snapshot -->
- Project: x
<!-- /8hour-lead: project-snapshot -->
`,
    );
    const result = validateProjectDir(dir);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    rmSync(tmp, { recursive: true, force: true });
  });

  it("flags missing 8hour_version", () => {
    const dir = join(tmp, "no-version");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "8HOUR.md"),
      "---\nlast_updated: 2026-04-13T00:00:00Z\n---\n# 8HOUR\n",
    );
    const result = validateProjectDir(dir);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("8hour_version"))).toBe(true);
    rmSync(tmp, { recursive: true, force: true });
  });

  it("flags ADR filename violations", () => {
    const dir = join(tmp, "bad-adr");
    mkdirSync(join(dir, "docs", "8hour", "adr"), { recursive: true });
    writeFileSync(
      join(dir, "8HOUR.md"),
      "---\n8hour_version: 1\n8hour_lead_version: 0.2.0\nlast_updated: 2026-04-13T00:00:00Z\nlast_updated_by: x\nschema: project-state\n---\n# 8HOUR\n",
    );
    writeFileSync(join(dir, "docs/8hour/adr/not-numbered.md"), "# bad");
    writeFileSync(join(dir, "docs/8hour/adr/0001-good.md"), "# good");
    const result = validateProjectDir(dir);
    expect(result.warnings.some((w) => w.includes("not-numbered"))).toBe(true);
    rmSync(tmp, { recursive: true, force: true });
  });

  it("warns when 8HOUR.md exceeds 400 lines", () => {
    const dir = join(tmp, "huge");
    mkdirSync(dir, { recursive: true });
    const body = Array.from({ length: 500 }, (_, i) => `line ${i}`).join("\n");
    writeFileSync(
      join(dir, "8HOUR.md"),
      `---\n8hour_version: 1\n8hour_lead_version: 0.2.0\nlast_updated: 2026-04-13T00:00:00Z\nlast_updated_by: x\nschema: project-state\n---\n${body}\n`,
    );
    const result = validateProjectDir(dir);
    expect(result.warnings.some((w) => w.includes("400"))).toBe(true);
    rmSync(tmp, { recursive: true, force: true });
  });
});
