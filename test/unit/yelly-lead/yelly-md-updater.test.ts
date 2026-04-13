import { describe, it, expect } from "vitest";
import {
  replaceSection,
  appendToSection,
  countLines,
  stampFrontmatter,
} from "../../../lib/yelly-lead/yelly-md-updater.js";

const SAMPLE = `---
yelly_version: 1
yelly_lead_version: 0.1.0
last_updated: 2026-04-01T00:00:00Z
last_updated_by: old
schema: project-state
---

# YELLY

## Active Work
<!-- yelly-lead: active-work -->
_None yet._
<!-- /yelly-lead: active-work -->

## Decision Log (last 10)
<!-- yelly-lead: decision-log -->
- 2026-04-01 — Project initialized
<!-- /yelly-lead: decision-log -->
`;

describe("replaceSection", () => {
  it("replaces section body between markers", () => {
    const out = replaceSection(SAMPLE, "active-work", "- Estimate in progress");
    expect(out).toContain("- Estimate in progress");
    expect(out).not.toContain("_None yet._");
    expect(out).toContain("<!-- yelly-lead: active-work -->");
    expect(out).toContain("<!-- /yelly-lead: active-work -->");
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
      updated_by: "/yelly-lead estimate",
      yelly_lead_version: "0.2.0",
    });
    expect(out).toContain("last_updated_by: /yelly-lead estimate");
    expect(out).toContain("yelly_lead_version: 0.2.0");
    expect(out).not.toContain("last_updated: 2026-04-01T00:00:00Z");
  });
});
