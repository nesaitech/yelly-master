// test/unit/config.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadConfig, getConfigValue, setConfigValue, mergeConfigs } from "../../lib/config.js";
import { writeYaml } from "../../lib/utils.js";
import { mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

describe("mergeConfigs", () => {
  it("merges two flat configs", () => {
    const base = { foo: "bar", num: 1 };
    const override = { foo: "baz", extra: true };
    const result = mergeConfigs(base, override);
    expect(result).toEqual({ foo: "baz", num: 1, extra: true });
  });

  it("deep merges nested configs", () => {
    const base = { test: { framework: "jest", tdd: false } };
    const override = { test: { tdd: true } };
    const result = mergeConfigs(base, override);
    expect(result).toEqual({ test: { framework: "jest", tdd: true } });
  });

  it("override arrays replace, not concat", () => {
    const base = { check: ["a", "b"] };
    const override = { check: ["c"] };
    const result = mergeConfigs(base, override);
    expect(result).toEqual({ check: ["c"] });
  });
});

describe("loadConfig", () => {
  const tmp = join(tmpdir(), "8hour-test-config-" + Date.now());

  beforeEach(() => { mkdirSync(tmp, { recursive: true }); });
  afterEach(() => { rmSync(tmp, { recursive: true, force: true }); });

  it("loads module defaults as base", () => {
    const moduleDir = join(tmp, "modules", "test");
    mkdirSync(moduleDir, { recursive: true });
    writeYaml(join(moduleDir, "config.yaml"), { framework: "jest", tdd: false });

    const config = loadConfig("test", {
      moduleConfigDir: join(tmp, "modules"),
      globalDefaultsPath: "",
      userConfigPath: "",
      projectConfigDir: "",
    });
    expect(config.framework).toBe("jest");
    expect(config.tdd).toBe(false);
  });

  it("user config overrides module defaults", () => {
    const moduleDir = join(tmp, "modules", "test");
    mkdirSync(moduleDir, { recursive: true });
    writeYaml(join(moduleDir, "config.yaml"), { framework: "jest", tdd: false });

    const userConfig = join(tmp, "user-config.yaml");
    writeYaml(userConfig, { test: { tdd: true, coverage_threshold: 95 } });

    const config = loadConfig("test", {
      moduleConfigDir: join(tmp, "modules"),
      globalDefaultsPath: "",
      userConfigPath: userConfig,
      projectConfigDir: "",
    });
    expect(config.framework).toBe("jest");
    expect(config.tdd).toBe(true);
    expect(config.coverage_threshold).toBe(95);
  });

  it("project config overrides user config", () => {
    const moduleDir = join(tmp, "modules", "test");
    mkdirSync(moduleDir, { recursive: true });
    writeYaml(join(moduleDir, "config.yaml"), { framework: "jest" });

    const userConfig = join(tmp, "user-config.yaml");
    writeYaml(userConfig, { test: { framework: "vitest" } });

    const projectDir = join(tmp, "project");
    mkdirSync(projectDir, { recursive: true });
    writeYaml(join(projectDir, "config.yaml"), { test: { framework: "mocha" } });

    const config = loadConfig("test", {
      moduleConfigDir: join(tmp, "modules"),
      globalDefaultsPath: "",
      userConfigPath: userConfig,
      projectConfigDir: projectDir,
    });
    expect(config.framework).toBe("mocha");
  });

  it("project module-specific yaml is highest priority", () => {
    const moduleDir = join(tmp, "modules", "test");
    mkdirSync(moduleDir, { recursive: true });
    writeYaml(join(moduleDir, "config.yaml"), { framework: "jest" });

    const projectDir = join(tmp, "project");
    mkdirSync(projectDir, { recursive: true });
    writeYaml(join(projectDir, "config.yaml"), { test: { framework: "vitest" } });
    writeYaml(join(projectDir, "test.yaml"), { framework: "pytest" });

    const config = loadConfig("test", {
      moduleConfigDir: join(tmp, "modules"),
      globalDefaultsPath: "",
      userConfigPath: "",
      projectConfigDir: projectDir,
    });
    expect(config.framework).toBe("pytest");
  });

  it("full 5-level chain works correctly", () => {
    const moduleDir = join(tmp, "modules", "test");
    mkdirSync(moduleDir, { recursive: true });
    writeYaml(join(moduleDir, "config.yaml"), {
      framework: "jest", tdd: false, coverage_threshold: 80, parallel: true, style: "unit-first"
    });

    const globalDefaults = join(tmp, "defaults.yaml");
    writeYaml(globalDefaults, { test: { coverage_threshold: 85 } });

    const userConfig = join(tmp, "user-config.yaml");
    writeYaml(userConfig, { test: { tdd: true } });

    const projectDir = join(tmp, "project");
    mkdirSync(projectDir, { recursive: true });
    writeYaml(join(projectDir, "config.yaml"), { test: { framework: "vitest" } });
    writeYaml(join(projectDir, "test.yaml"), { parallel: false });

    const config = loadConfig("test", {
      moduleConfigDir: join(tmp, "modules"),
      globalDefaultsPath: globalDefaults,
      userConfigPath: userConfig,
      projectConfigDir: projectDir,
    });

    expect(config.framework).toBe("vitest");
    expect(config.tdd).toBe(true);
    expect(config.coverage_threshold).toBe(85);
    expect(config.parallel).toBe(false);
    expect(config.style).toBe("unit-first");
  });
});

describe("getConfigValue / setConfigValue", () => {
  const tmp = join(tmpdir(), "8hour-test-getset-" + Date.now());

  beforeEach(() => mkdirSync(tmp, { recursive: true }));
  afterEach(() => rmSync(tmp, { recursive: true, force: true }));

  it("gets a nested value by dot path", () => {
    const filepath = join(tmp, "config.yaml");
    writeYaml(filepath, { test: { framework: "jest", tdd: true } });
    expect(getConfigValue(filepath, "test.framework")).toBe("jest");
    expect(getConfigValue(filepath, "test.tdd")).toBe(true);
  });

  it("returns undefined for missing key", () => {
    const filepath = join(tmp, "config.yaml");
    writeYaml(filepath, { test: { framework: "jest" } });
    expect(getConfigValue(filepath, "test.missing")).toBeUndefined();
  });

  it("sets a nested value by dot path", () => {
    const filepath = join(tmp, "config.yaml");
    writeYaml(filepath, { test: { framework: "jest" } });
    setConfigValue(filepath, "test.framework", "vitest");
    expect(getConfigValue(filepath, "test.framework")).toBe("vitest");
  });

  it("creates intermediate keys when setting", () => {
    const filepath = join(tmp, "config.yaml");
    writeYaml(filepath, {});
    setConfigValue(filepath, "deploy.platform", "vercel");
    expect(getConfigValue(filepath, "deploy.platform")).toBe("vercel");
  });
});
