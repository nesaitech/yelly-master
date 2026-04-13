import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..", "..");
const TEMPLATES = join(ROOT, "templates");

describe("YELLY.md.tmpl", () => {
  const path = join(TEMPLATES, "YELLY.md.tmpl");

  it("exists", () => {
    expect(existsSync(path)).toBe(true);
  });

  const content = existsSync(path) ? readFileSync(path, "utf-8") : "";

  it("has frontmatter with required fields", () => {
    expect(content).toMatch(/^---\n[\s\S]*?yelly_version: 1/);
    expect(content).toContain("yelly_lead_version: {{YELLY_LEAD_VERSION}}");
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
      expect(content).toContain(`<!-- yelly-lead: ${section}`);
      expect(content).toContain(`<!-- /yelly-lead: ${section} -->`);
    });
  }

  const REQUIRED_PLACEHOLDERS = [
    "{{YELLY_LEAD_VERSION}}",
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
