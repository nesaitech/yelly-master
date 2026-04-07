import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import yaml from "js-yaml";

export function expandHome(filepath: string): string {
  if (filepath.startsWith("~/")) {
    return join(homedir(), filepath.slice(2));
  }
  return filepath;
}

export function readYaml(filepath: string): Record<string, unknown> {
  try {
    const content = readFileSync(filepath, "utf-8");
    return (yaml.load(content) as Record<string, unknown>) ?? {};
  } catch {
    return {};
  }
}

export function writeYaml(filepath: string, data: Record<string, unknown>): void {
  const dir = filepath.substring(0, filepath.lastIndexOf("/"));
  if (dir) ensureDir(dir);
  writeFileSync(filepath, yaml.dump(data, { lineWidth: 120 }), "utf-8");
}

export function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true });
}

export function fileExists(filepath: string): boolean {
  return existsSync(filepath);
}
