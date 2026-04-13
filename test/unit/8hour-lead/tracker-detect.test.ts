import { describe, it, expect } from "vitest";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { detectTracker } from "../../../lib/8hour-lead/tracker-detect.js";

describe("detectTracker", () => {
  const tmp = join(tmpdir(), "8hour-tracker-test-" + Date.now());

  it("returns none for empty directory", () => {
    mkdirSync(tmp, { recursive: true });
    const info = detectTracker(tmp);
    expect(info.type).toBe("none");
    expect(info.cliAvailable).toBe(false);
    rmSync(tmp, { recursive: true, force: true });
  });

  it("detects github when .github dir exists", () => {
    const dir = join(tmp, "gh");
    mkdirSync(join(dir, ".github"), { recursive: true });
    const info = detectTracker(dir);
    expect(info.type).toBe("github");
    expect(info.detectedVia).toContain(".github/");
    rmSync(tmp, { recursive: true, force: true });
  });

  it("detects gitlab from .gitlab-ci.yml", () => {
    const dir = join(tmp, "gl");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, ".gitlab-ci.yml"), "stages: []\n");
    const info = detectTracker(dir);
    expect(info.type).toBe("gitlab");
    expect(info.detectedVia).toContain(".gitlab-ci.yml");
    rmSync(tmp, { recursive: true, force: true });
  });

  it("cliAvailable is a boolean regardless of detection", () => {
    mkdirSync(join(tmp, "x", ".github"), { recursive: true });
    const info = detectTracker(join(tmp, "x"));
    expect(typeof info.cliAvailable).toBe("boolean");
    rmSync(tmp, { recursive: true, force: true });
  });
});
