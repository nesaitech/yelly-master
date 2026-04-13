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

    const tplPath = join(REPO_ROOT, "templates", "YELLY.md.tmpl");
    expect(existsSync(tplPath)).toBe(true);
    const yellyContent = renderYellyMdTemplate(
      tplPath,
      ctx,
      { phase: "MVP", currentFocus: "ship auth", teamSize: 2 },
      "0.2.0",
    );
    writeFileSync(join(project, "YELLY.md"), yellyContent);

    let result = validateProjectDir(project);
    expect(result.ok).toBe(true);

    mkdirSync(join(project, "docs", "yelly", "adr"), { recursive: true });
    writeFileSync(
      join(project, "docs/yelly/adr/0001-use-postgres.md"),
      "---\nadr_number: 1\ntitle: Use Postgres\nstatus: accepted\ndate: 2026-04-13\n---\n# ADR-0001: Use Postgres\n",
    );

    mkdirSync(join(project, "docs", "yelly", "risks"), { recursive: true });
    writeFileSync(
      join(project, "docs/yelly/risks/active.md"),
      "# Active Risk Register\n\n## Risk: Migration downtime\n- Severity: 16\n- Owner: alice\n",
    );

    const syncResult = syncYellyMd(project, "0.2.0");
    expect(syncResult.yellyMdRewritten).toBe(true);
    expect(syncResult.sectionsTouched).toContain("architecture-decisions");
    expect(syncResult.sectionsTouched).toContain("top-risks");

    result = validateProjectDir(project);
    expect(result.ok).toBe(true);

    const stats = gatherStats(project);
    expect(stats.adrCount).toBe(1);
    expect(stats.activeRiskCount).toBe(1);
    expect(stats.topRiskSeverity).toBe(16);
    expect(stats.yellyMdLines).toBeGreaterThan(0);

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
