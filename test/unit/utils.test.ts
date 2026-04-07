import { describe, it, expect } from "vitest";
import { expandHome, readYaml, writeYaml, ensureDir } from "../../lib/utils.js";
import { writeFileSync, mkdirSync, rmSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

describe("expandHome", () => {
  it("replaces ~ with home directory", () => {
    const result = expandHome("~/foo/bar");
    expect(result).toBe(join(process.env.HOME!, "foo/bar"));
  });

  it("returns absolute paths unchanged", () => {
    expect(expandHome("/usr/local")).toBe("/usr/local");
  });
});

describe("readYaml", () => {
  const tmp = join(tmpdir(), "yelly-test-utils-" + Date.now());

  it("reads and parses a yaml file", () => {
    mkdirSync(tmp, { recursive: true });
    writeFileSync(join(tmp, "test.yaml"), "foo: bar\nnum: 42\n");
    const result = readYaml(join(tmp, "test.yaml"));
    expect(result).toEqual({ foo: "bar", num: 42 });
    rmSync(tmp, { recursive: true, force: true });
  });

  it("returns empty object for missing file", () => {
    const result = readYaml("/nonexistent/path.yaml");
    expect(result).toEqual({});
  });
});

describe("writeYaml", () => {
  const tmp = join(tmpdir(), "yelly-test-write-" + Date.now());

  it("writes object as yaml", () => {
    mkdirSync(tmp, { recursive: true });
    const path = join(tmp, "out.yaml");
    writeYaml(path, { hello: "world", count: 3 });
    const content = readYaml(path);
    expect(content).toEqual({ hello: "world", count: 3 });
    rmSync(tmp, { recursive: true, force: true });
  });
});

describe("ensureDir", () => {
  const tmp = join(tmpdir(), "yelly-test-ensure-" + Date.now());

  it("creates directory recursively", () => {
    const dir = join(tmp, "a", "b", "c");
    ensureDir(dir);
    expect(existsSync(dir)).toBe(true);
    rmSync(tmp, { recursive: true, force: true });
  });
});
