// lib/updater.ts
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { ensureDir } from "./utils.js";

export interface SemVer {
  major: number;
  minor: number;
  patch: number;
}

export function parseVersion(version: string): SemVer | null {
  const trimmed = version.trim();
  const match = trimmed.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return null;
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  };
}

export function compareVersions(a: string, b: string): number {
  const va = parseVersion(a);
  const vb = parseVersion(b);
  if (!va || !vb) return 0;

  if (va.major !== vb.major) return va.major - vb.major;
  if (va.minor !== vb.minor) return va.minor - vb.minor;
  return va.patch - vb.patch;
}

export function readLocalVersion(projectRoot: string): string {
  try {
    return readFileSync(join(projectRoot, "VERSION"), "utf-8").trim();
  } catch {
    return "0.0.0";
  }
}

const CACHE_FILE = "version-cache.json";

interface VersionCache {
  version: string;
  timestamp: number;
}

export function writeCachedVersion(cacheDir: string, version: string): void {
  ensureDir(cacheDir);
  const cache: VersionCache = { version, timestamp: Date.now() };
  writeFileSync(join(cacheDir, CACHE_FILE), JSON.stringify(cache), "utf-8");
}

export function readCachedVersion(cacheDir: string): string | null {
  try {
    const content = readFileSync(join(cacheDir, CACHE_FILE), "utf-8");
    const cache: VersionCache = JSON.parse(content);
    return cache.version;
  } catch {
    return null;
  }
}

export function isCacheExpired(cacheDir: string, maxAgeMs: number): boolean {
  try {
    const content = readFileSync(join(cacheDir, CACHE_FILE), "utf-8");
    const cache: VersionCache = JSON.parse(content);
    return Date.now() - cache.timestamp > maxAgeMs;
  } catch {
    return true;
  }
}

export function checkForUpdate(
  projectRoot: string,
  cacheDir: string,
): { updateAvailable: boolean; local: string; remote: string | null } {
  const local = readLocalVersion(projectRoot);
  const cacheMaxAge = 24 * 60 * 60 * 1000;

  if (!isCacheExpired(cacheDir, cacheMaxAge)) {
    const remote = readCachedVersion(cacheDir);
    if (remote) {
      return {
        updateAvailable: compareVersions(remote, local) > 0,
        local,
        remote,
      };
    }
  }

  return { updateAvailable: false, local, remote: null };
}
