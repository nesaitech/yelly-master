// test/unit/router.test.ts
import { describe, it, expect } from "vitest";
import { routeRequest, MEGA_SKILL_MODULES } from "../../lib/router.js";

describe("MEGA_SKILL_MODULES", () => {
  it("has 4 mega-skills defined", () => {
    expect(Object.keys(MEGA_SKILL_MODULES)).toEqual([
      "yelly-code", "yelly-ops", "yelly-quality", "yelly-team"
    ]);
  });

  it("yelly-code has 4 modules", () => {
    expect(Object.keys(MEGA_SKILL_MODULES["yelly-code"])).toEqual([
      "debug", "review", "refactor", "plan"
    ]);
  });

  it("yelly-ops has 5 modules", () => {
    expect(Object.keys(MEGA_SKILL_MODULES["yelly-ops"])).toEqual([
      "ci", "deploy", "monitor", "env", "docker"
    ]);
  });

  it("yelly-quality has 6 modules", () => {
    expect(Object.keys(MEGA_SKILL_MODULES["yelly-quality"])).toEqual([
      "test", "security", "perf", "qa", "lint", "health"
    ]);
  });

  it("yelly-team has 4 modules", () => {
    expect(Object.keys(MEGA_SKILL_MODULES["yelly-team"])).toEqual([
      "doc", "retro", "onboard", "changelog"
    ]);
  });
});

describe("routeRequest", () => {
  it("routes 'fix the login bug' to debug", () => {
    const matches = routeRequest("yelly-code", "fix the login bug");
    expect(matches[0].module).toBe("debug");
    expect(matches[0].confidence).toBeGreaterThan(0);
  });

  it("routes 'review this PR' to review", () => {
    const matches = routeRequest("yelly-code", "review this PR before merge");
    expect(matches[0].module).toBe("review");
  });

  it("routes 'deploy to production' to deploy", () => {
    const matches = routeRequest("yelly-ops", "deploy to production");
    expect(matches[0].module).toBe("deploy");
  });

  it("routes 'run unit tests' to test", () => {
    const matches = routeRequest("yelly-quality", "run unit tests with coverage");
    expect(matches[0].module).toBe("test");
  });

  it("routes 'security audit' to security", () => {
    const matches = routeRequest("yelly-quality", "do a security audit");
    expect(matches[0].module).toBe("security");
  });

  it("routes 'write documentation' to doc", () => {
    const matches = routeRequest("yelly-team", "write documentation for the API");
    expect(matches[0].module).toBe("doc");
  });

  it("returns multiple matches sorted by confidence", () => {
    const matches = routeRequest("yelly-code", "review and refactor this code");
    expect(matches.length).toBeGreaterThanOrEqual(2);
    expect(matches[0].confidence).toBeGreaterThanOrEqual(matches[1].confidence);
  });

  it("returns empty for unknown mega-skill", () => {
    const matches = routeRequest("yelly-unknown", "do something");
    expect(matches).toEqual([]);
  });

  it("handles empty request gracefully", () => {
    const matches = routeRequest("yelly-code", "");
    expect(matches).toEqual([]);
  });
});
