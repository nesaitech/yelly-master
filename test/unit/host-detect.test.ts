// test/unit/host-detect.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getHostPaths, detectAllHosts } from "../../lib/host-detect.js";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

describe("getHostPaths", () => {
  it("returns correct paths for claude", () => {
    const paths = getHostPaths("claude");
    expect(paths.name).toBe("claude");
    expect(paths.skillsDir).toContain(".claude/skills");
    expect(paths.settingsFile).toContain(".claude/settings.json");
    expect(paths.configDir).toContain(".8hour-master");
  });

  it("returns correct paths for codex", () => {
    const paths = getHostPaths("codex");
    expect(paths.name).toBe("codex");
    expect(paths.skillsDir).toContain(".codex/skills");
  });

  it("returns correct paths for cursor", () => {
    const paths = getHostPaths("cursor");
    expect(paths.name).toBe("cursor");
    expect(paths.skillsDir).toContain(".cursor/skills");
    expect(paths.settingsFile).toBe("");
  });

  it("returns correct paths for windsurf", () => {
    const paths = getHostPaths("windsurf");
    expect(paths.name).toBe("windsurf");
    expect(paths.skillsDir).toContain(".windsurf/skills");
  });

  it("returns correct paths for kiro", () => {
    const paths = getHostPaths("kiro");
    expect(paths.name).toBe("kiro");
    expect(paths.skillsDir).toContain(".kiro/skills");
  });

  it("returns generic fallback", () => {
    const paths = getHostPaths("generic");
    expect(paths.name).toBe("generic");
    expect(paths.settingsFile).toBe("");
  });
});

describe("detectAllHosts", () => {
  const tmp = join(tmpdir(), "8hour-test-hosts-" + Date.now());

  beforeEach(() => { mkdirSync(tmp, { recursive: true }); });
  afterEach(() => { rmSync(tmp, { recursive: true, force: true }); });

  it("detects claude when .claude/settings.json exists", () => {
    mkdirSync(join(tmp, ".claude"), { recursive: true });
    writeFileSync(join(tmp, ".claude", "settings.json"), "{}");
    const hosts = detectAllHosts(tmp);
    expect(hosts).toContain("claude");
  });

  it("detects codex when .codex/ exists", () => {
    mkdirSync(join(tmp, ".codex"), { recursive: true });
    const hosts = detectAllHosts(tmp);
    expect(hosts).toContain("codex");
  });

  it("returns empty array when no hosts found", () => {
    const hosts = detectAllHosts(tmp);
    expect(hosts).toEqual([]);
  });

  it("detects multiple hosts", () => {
    mkdirSync(join(tmp, ".claude"), { recursive: true });
    writeFileSync(join(tmp, ".claude", "settings.json"), "{}");
    mkdirSync(join(tmp, ".codex"), { recursive: true });
    mkdirSync(join(tmp, ".kiro"), { recursive: true });
    const hosts = detectAllHosts(tmp);
    expect(hosts).toContain("claude");
    expect(hosts).toContain("codex");
    expect(hosts).toContain("kiro");
    expect(hosts.length).toBe(3);
  });
});
