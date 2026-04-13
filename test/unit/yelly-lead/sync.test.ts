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
