import { describe, it, expect } from "vitest";
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import {
  gatherContext,
  renderEightHourMdTemplate,
} from "../../lib/8hour-lead/bootstrap.js";
import {
  replaceSection,
  appendToSection,
  stampFrontmatter,
} from "../../lib/8hour-lead/8hour-md-updater.js";
import { validateProjectDir } from "../../lib/8hour-lead/validate.js";
import { syncEightHourMd } from "../../lib/8hour-lead/sync.js";
import { gatherStats } from "../../lib/8hour-lead/stats.js";

const REPO_ROOT = join(import.meta.dirname, "..", "..");

describe("8hour-lead end-to-end routing", () => {
  const tmp = join(tmpdir(), "8hour-e2e-" + Date.now());

  it("bootstrap → ADR → risk → sync → validate → stats", () => {
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

    const ctx = gatherContext(project);
    expect(ctx.projectName).toBe("fake-project");
    expect(ctx.stack.languages).toContain("typescript");
    expect(ctx.stack.databases).toContain("postgres");

    const tplPath = join(REPO_ROOT, "templates", "8HOUR.md.tmpl");
    expect(existsSync(tplPath)).toBe(true);
    const eightHourContent = renderEightHourMdTemplate(
      tplPath,
      ctx,
      { phase: "MVP", currentFocus: "ship auth", teamSize: 2 },
      "0.2.0",
    );
    writeFileSync(join(project, "8HOUR.md"), eightHourContent);

    let result = validateProjectDir(project);
    expect(result.ok).toBe(true);

    mkdirSync(join(project, "docs", "8hour", "adr"), { recursive: true });
    writeFileSync(
      join(project, "docs/8hour/adr/0001-use-postgres.md"),
      "---\nadr_number: 1\ntitle: Use Postgres\nstatus: accepted\ndate: 2026-04-13\n---\n# ADR-0001: Use Postgres\n",
    );

    mkdirSync(join(project, "docs", "8hour", "risks"), { recursive: true });
    writeFileSync(
      join(project, "docs/8hour/risks/active.md"),
      "# Active Risk Register\n\n## Risk: Migration downtime\n- Severity: 16\n- Owner: alice\n",
    );

    const syncResult = syncEightHourMd(project, "0.2.0");
    expect(syncResult.eightHourMdRewritten).toBe(true);
    expect(syncResult.sectionsTouched).toContain("architecture-decisions");
    expect(syncResult.sectionsTouched).toContain("top-risks");

    result = validateProjectDir(project);
    expect(result.ok).toBe(true);

    const stats = gatherStats(project);
    expect(stats.adrCount).toBe(1);
    expect(stats.activeRiskCount).toBe(1);
    expect(stats.topRiskSeverity).toBe(16);
    expect(stats.eightHourMdLines).toBeGreaterThan(0);

    const finalEightHour = readFileSync(join(project, "8HOUR.md"), "utf-8");
    expect(finalEightHour).toContain("ADR-0001");
    expect(finalEightHour).toContain("Use Postgres");
    expect(finalEightHour).toContain("Migration downtime");
    expect(finalEightHour).toContain("8hour_lead_version: 0.2.0");
    expect(finalEightHour).toContain("last_updated_by: 8hour-lead-sync");

    rmSync(tmp, { recursive: true, force: true });
  });

  it("manual section update via replaceSection + appendToSection survives", () => {
    const project = join(tmp, "manual");
    mkdirSync(project, { recursive: true });
    const tplPath = join(REPO_ROOT, "templates", "8HOUR.md.tmpl");
    const ctx = gatherContext(project);
    let content = renderEightHourMdTemplate(
      tplPath,
      ctx,
      { phase: "MVP", currentFocus: "ship", teamSize: 1 },
      "0.2.0",
    );

    content = replaceSection(content, "active-work", "- Estimate in progress for X");
    content = appendToSection(content, "decision-log", "- 2026-04-13 — Added X estimate");
    content = stampFrontmatter(content, {
      updated_by: "/8hour-lead estimate",
      "8hour_lead_version": "0.2.0",
    });

    expect(content).toContain("- Estimate in progress for X");
    expect(content).toContain("Added X estimate");
    expect(content).toContain("/8hour-lead estimate");

    rmSync(tmp, { recursive: true, force: true });
  });
});
