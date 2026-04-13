import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";

const ROOT = join(import.meta.dirname, "..", "..");
const MODULES = join(ROOT, "modules");

const YELLY_LEAD_MODULES = ["adr", "debt", "estimate", "risk"];

const REQUIRED_FILES = [
  "guide.md",
  "patterns.md",
  "config.yaml",
  "prompts",
  "hooks/pre.sh",
  "hooks/post.sh",
];

const REQUIRED_CONFIG_KEYS = ["permissions"];

describe.each(YELLY_LEAD_MODULES)("module %s", (mod) => {
  const dir = join(MODULES, mod);

  it("directory exists", () => {
    expect(existsSync(dir)).toBe(true);
  });

  for (const file of REQUIRED_FILES) {
    it(`has ${file}`, () => {
      expect(existsSync(join(dir, file))).toBe(true);
    });
  }

  it("config.yaml has required keys", () => {
    const configPath = join(dir, "config.yaml");
    if (!existsSync(configPath)) return;
    const parsed = yaml.load(readFileSync(configPath, "utf-8")) as Record<
      string,
      unknown
    >;
    for (const key of REQUIRED_CONFIG_KEYS) {
      expect(parsed).toHaveProperty(key);
    }
  });

  it("guide.md has a title heading", () => {
    const guidePath = join(dir, "guide.md");
    if (!existsSync(guidePath)) return;
    const content = readFileSync(guidePath, "utf-8");
    expect(content).toMatch(/^#\s+\S/m);
  });

  it("guide.md is non-trivial (>50 lines)", () => {
    const guidePath = join(dir, "guide.md");
    if (!existsSync(guidePath)) return;
    const lines = readFileSync(guidePath, "utf-8").split("\n").length;
    expect(lines).toBeGreaterThan(50);
  });

  it("hooks are executable bash", () => {
    for (const hook of ["hooks/pre.sh", "hooks/post.sh"]) {
      const path = join(dir, hook);
      if (!existsSync(path)) continue;
      const content = readFileSync(path, "utf-8");
      expect(content).toMatch(/^#!.*bash/);
    }
  });
});
