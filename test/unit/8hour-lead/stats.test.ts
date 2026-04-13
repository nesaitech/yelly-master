import { describe, it, expect } from "vitest";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { gatherStats } from "../../../lib/8hour-lead/stats.js";

describe("gatherStats", () => {
  const tmp = join(tmpdir(), "8hour-stats-test-" + Date.now());

  it("returns zero counts for an empty project", () => {
    const dir = join(tmp, "empty");
    mkdirSync(dir, { recursive: true });
    const stats = gatherStats(dir);
    expect(stats.adrCount).toBe(0);
    expect(stats.activeRiskCount).toBe(0);
    expect(stats.estimateHistoryCount).toBe(0);
    expect(stats.eightHourMdLines).toBe(0);
    expect(stats.eightHourMdLastUpdated).toBeNull();
    rmSync(tmp, { recursive: true, force: true });
  });

  it("counts ADRs by filename pattern", () => {
    const dir = join(tmp, "with-adrs");
    mkdirSync(join(dir, "docs", "8hour", "adr"), { recursive: true });
    writeFileSync(join(dir, "docs/8hour/adr/0001-a.md"), "# 1");
    writeFileSync(join(dir, "docs/8hour/adr/0002-b.md"), "# 2");
    writeFileSync(join(dir, "docs/8hour/adr/notes.txt"), "ignored");
    const stats = gatherStats(dir);
    expect(stats.adrCount).toBe(2);
    rmSync(tmp, { recursive: true, force: true });
  });

  it("counts active risks by H2 header", () => {
    const dir = join(tmp, "with-risks");
    mkdirSync(join(dir, "docs", "8hour", "risks"), { recursive: true });
    writeFileSync(
      join(dir, "docs/8hour/risks/active.md"),
      "# Active Risks\n\n## Risk: A\n- Severity: 12\n\n## Risk: B\n- Severity: 6\n",
    );
    const stats = gatherStats(dir);
    expect(stats.activeRiskCount).toBe(2);
    expect(stats.topRiskSeverity).toBe(12);
    rmSync(tmp, { recursive: true, force: true });
  });

  it("computes estimate bias from history jsonl", () => {
    const dir = join(tmp, "with-history");
    mkdirSync(join(dir, ".8hour", "history"), { recursive: true });
    writeFileSync(
      join(dir, ".8hour/history/estimates.jsonl"),
      [
        '{"id":"a","topic":"x","estimated":4,"actual":5,"date":"2026-01-01"}',
        '{"id":"b","topic":"y","estimated":2,"actual":3,"date":"2026-01-15"}',
      ].join("\n") + "\n",
    );
    const stats = gatherStats(dir);
    expect(stats.estimateHistoryCount).toBe(2);
    expect(stats.estimateBias).toBeCloseTo(1.375, 3);
    rmSync(tmp, { recursive: true, force: true });
  });

  it("reads 8HOUR.md line count and last_updated", () => {
    const dir = join(tmp, "with-8hour");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "8HOUR.md"),
      `---\n8hour_version: 1\n8hour_lead_version: 0.2.0\nlast_updated: 2026-04-13T00:00:00Z\nlast_updated_by: x\nschema: project-state\n---\n\nbody1\nbody2\n`,
    );
    const stats = gatherStats(dir);
    expect(stats.eightHourMdLines).toBeGreaterThan(0);
    // js-yaml parses ISO timestamps as Date; stats normalizes via toISOString()
    expect(stats.eightHourMdLastUpdated).toBe("2026-04-13T00:00:00.000Z");
    rmSync(tmp, { recursive: true, force: true });
  });
});
