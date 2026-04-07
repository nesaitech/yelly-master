// lib/config.ts
import { join } from "path";
import { readYaml, writeYaml } from "./utils.js";

export interface ConfigPaths {
  moduleConfigDir: string;
  globalDefaultsPath: string;
  userConfigPath: string;
  projectConfigDir: string;
}

export function mergeConfigs(
  base: Record<string, unknown>,
  override: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...base };

  for (const [key, value] of Object.entries(override)) {
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof result[key] === "object" &&
      result[key] !== null &&
      !Array.isArray(result[key])
    ) {
      result[key] = mergeConfigs(
        result[key] as Record<string, unknown>,
        value as Record<string, unknown>,
      );
    } else {
      result[key] = value;
    }
  }

  return result;
}

export function loadConfig(
  moduleName: string,
  paths: ConfigPaths,
): Record<string, unknown> {
  const moduleConfig = readYaml(join(paths.moduleConfigDir, moduleName, "config.yaml"));
  const globalDefaults = readYaml(paths.globalDefaultsPath);
  const globalModuleConfig = (globalDefaults[moduleName] ?? {}) as Record<string, unknown>;
  const userConfig = readYaml(paths.userConfigPath);
  const userModuleConfig = (userConfig[moduleName] ?? {}) as Record<string, unknown>;
  const projectConfig = readYaml(join(paths.projectConfigDir, "config.yaml"));
  const projectModuleConfig = (projectConfig[moduleName] ?? {}) as Record<string, unknown>;
  const projectSpecific = readYaml(join(paths.projectConfigDir, `${moduleName}.yaml`));

  let result = moduleConfig;
  result = mergeConfigs(result, globalModuleConfig);
  result = mergeConfigs(result, userModuleConfig);
  result = mergeConfigs(result, projectModuleConfig);
  result = mergeConfigs(result, projectSpecific);

  return result;
}

export function getConfigValue(filepath: string, dotPath: string): unknown {
  const config = readYaml(filepath);
  const keys = dotPath.split(".");
  let current: unknown = config;

  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

export function setConfigValue(filepath: string, dotPath: string, value: unknown): void {
  const config = readYaml(filepath);
  const keys = dotPath.split(".");
  let current: Record<string, unknown> = config;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (typeof current[key] !== "object" || current[key] === null) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  current[keys[keys.length - 1]] = value;
  writeYaml(filepath, config);
}
