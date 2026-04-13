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
