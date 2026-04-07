// test/unit/updater.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  parseVersion,
  compareVersions,
  readLocalVersion,
  isCacheExpired,
  readCachedVersion,
  writeCachedVersion,
} from "../../lib/updater.js";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

describe("parseVersion", () => {
  it("parses valid semver", () => {
    expect(parseVersion("1.2.3")).toEqual({ major: 1, minor: 2, patch: 3 });
  });

  it("trims whitespace", () => {
    expect(parseVersion("  0.1.0\n")).toEqual({ major: 0, minor: 1, patch: 0 });
  });

  it("returns null for invalid", () => {
    expect(parseVersion("abc")).toBeNull();
    expect(parseVersion("1.2")).toBeNull();
  });
});

describe("compareVersions", () => {
  it("returns 0 for equal", () => {
    expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
  });

  it("returns positive when a > b", () => {
    expect(compareVersions("2.0.0", "1.0.0")).toBeGreaterThan(0);
    expect(compareVersions("1.1.0", "1.0.0")).toBeGreaterThan(0);
    expect(compareVersions("1.0.1", "1.0.0")).toBeGreaterThan(0);
  });

  it("returns negative when a < b", () => {
    expect(compareVersions("0.1.0", "1.0.0")).toBeLessThan(0);
  });
});

describe("readLocalVersion", () => {
  const tmp = join(tmpdir(), "yelly-test-version-" + Date.now());

  beforeEach(() => mkdirSync(tmp, { recursive: true }));
  afterEach(() => rmSync(tmp, { recursive: true, force: true }));

  it("reads version from VERSION file", () => {
    writeFileSync(join(tmp, "VERSION"), "0.3.1\n");
    expect(readLocalVersion(tmp)).toBe("0.3.1");
  });

  it("returns 0.0.0 if file missing", () => {
    expect(readLocalVersion(tmp)).toBe("0.0.0");
  });
});

describe("cache", () => {
  const tmp = join(tmpdir(), "yelly-test-cache-" + Date.now());

  beforeEach(() => mkdirSync(tmp, { recursive: true }));
  afterEach(() => rmSync(tmp, { recursive: true, force: true }));

  it("writes and reads cached version", () => {
    writeCachedVersion(tmp, "1.2.3");
    expect(readCachedVersion(tmp)).toBe("1.2.3");
  });

  it("returns null for missing cache", () => {
    expect(readCachedVersion(tmp)).toBeNull();
  });

  it("cache is not expired when just written", () => {
    writeCachedVersion(tmp, "1.0.0");
    expect(isCacheExpired(tmp, 24 * 60 * 60 * 1000)).toBe(false);
  });
});
