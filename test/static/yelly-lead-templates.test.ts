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
