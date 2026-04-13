// test/unit/router.test.ts
import { describe, it, expect } from "vitest";
import { routeRequest, MEGA_SKILL_MODULES } from "../../lib/router.js";

describe("MEGA_SKILL_MODULES", () => {
  it("has 4 mega-skills defined", () => {
    expect(Object.keys(MEGA_SKILL_MODULES)).toEqual([
      "8hour-code", "8hour-ops", "8hour-quality", "8hour-team"
    ]);
  });

  it("8hour-code has 4 modules", () => {
    expect(Object.keys(MEGA_SKILL_MODULES["8hour-code"])).toEqual([
      "debug", "review", "refactor", "plan"
    ]);
  });

  it("8hour-ops has 5 modules", () => {
    expect(Object.keys(MEGA_SKILL_MODULES["8hour-ops"])).toEqual([
      "ci", "deploy", "monitor", "env", "docker"
    ]);
  });

  it("8hour-quality has 6 modules", () => {
    expect(Object.keys(MEGA_SKILL_MODULES["8hour-quality"])).toEqual([
      "test", "security", "perf", "qa", "lint", "health"
    ]);
  });

  it("8hour-team has 4 modules", () => {
    expect(Object.keys(MEGA_SKILL_MODULES["8hour-team"])).toEqual([
      "doc", "retro", "onboard", "changelog"
    ]);
  });
});

describe("routeRequest", () => {
  it("routes 'fix the login bug' to debug", () => {
    const matches = routeRequest("8hour-code", "fix the login bug");
    expect(matches[0].module).toBe("debug");
    expect(matches[0].confidence).toBeGreaterThan(0);
  });

  it("routes 'review this PR' to review", () => {
    const matches = routeRequest("8hour-code", "review this PR before merge");
    expect(matches[0].module).toBe("review");
  });

  it("routes 'deploy to production' to deploy", () => {
    const matches = routeRequest("8hour-ops", "deploy to production");
    expect(matches[0].module).toBe("deploy");
  });

  it("routes 'run unit tests' to test", () => {
    const matches = routeRequest("8hour-quality", "run unit tests with coverage");
    expect(matches[0].module).toBe("test");
  });

  it("routes 'security audit' to security", () => {
    const matches = routeRequest("8hour-quality", "do a security audit");
    expect(matches[0].module).toBe("security");
  });

  it("routes 'write documentation' to doc", () => {
    const matches = routeRequest("8hour-team", "write documentation for the API");
    expect(matches[0].module).toBe("doc");
  });

  it("returns multiple matches sorted by confidence", () => {
    const matches = routeRequest("8hour-code", "review and refactor this code");
    expect(matches.length).toBeGreaterThanOrEqual(2);
    expect(matches[0].confidence).toBeGreaterThanOrEqual(matches[1].confidence);
  });

  it("returns empty for unknown mega-skill", () => {
    const matches = routeRequest("8hour-unknown", "do something");
    expect(matches).toEqual([]);
  });

  it("handles empty request gracefully", () => {
    const matches = routeRequest("8hour-code", "");
    expect(matches).toEqual([]);
  });
});
