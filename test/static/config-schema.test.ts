import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";

const PROJECT_ROOT = join(import.meta.dirname, "../..");

describe("config/defaults.yaml", () => {
  const defaultsPath = join(PROJECT_ROOT, "config", "defaults.yaml");

  it("exists", () => {
    expect(existsSync(defaultsPath)).toBe(true);
  });

  it("is valid yaml", () => {
    const content = readFileSync(defaultsPath, "utf-8");
    const parsed = yaml.load(content);
    expect(parsed).toBeDefined();
    expect(typeof parsed).toBe("object");
  });

  it("has update section", () => {
    const content = readFileSync(defaultsPath, "utf-8");
    const parsed = yaml.load(content) as Record<string, unknown>;
    expect(parsed.update).toBeDefined();
  });
});

describe("VERSION file", () => {
  it("exists", () => {
    expect(existsSync(join(PROJECT_ROOT, "VERSION"))).toBe(true);
  });

  it("contains valid semver", () => {
    const version = readFileSync(join(PROJECT_ROOT, "VERSION"), "utf-8").trim();
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
