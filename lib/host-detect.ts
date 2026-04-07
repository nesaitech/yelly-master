// lib/host-detect.ts
import { existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import type { HostName, HostPaths } from "./types.js";

const HOST_MARKERS: Record<Exclude<HostName, "generic">, { dir: string; requireFile?: string }> = {
  claude:   { dir: ".claude",   requireFile: "settings.json" },
  codex:    { dir: ".codex" },
  cursor:   { dir: ".cursor" },
  windsurf: { dir: ".windsurf" },
  kiro:     { dir: ".kiro" },
};

const HOSTS_WITH_SETTINGS: HostName[] = ["claude", "codex", "kiro"];

export function getHostPaths(host: HostName): HostPaths {
  const home = homedir();
  const configDir = join(home, ".yelly-master");

  if (host === "generic") {
    return { name: "generic", skillsDir: "", settingsFile: "", configDir };
  }

  const marker = HOST_MARKERS[host];
  const hostDir = join(home, marker.dir);

  return {
    name: host,
    skillsDir: join(hostDir, "skills"),
    settingsFile: HOSTS_WITH_SETTINGS.includes(host) ? join(hostDir, "settings.json") : "",
    configDir,
  };
}

export function detectAllHosts(homeOverride?: string): HostName[] {
  const home = homeOverride ?? homedir();
  const detected: HostName[] = [];

  for (const [host, marker] of Object.entries(HOST_MARKERS)) {
    const dir = join(home, marker.dir);
    if (!existsSync(dir)) continue;
    if (marker.requireFile && !existsSync(join(dir, marker.requireFile))) continue;
    detected.push(host as HostName);
  }

  return detected;
}

export function detectCurrentHost(): HostName {
  if (process.env.CLAUDE_CODE) return "claude";
  if (process.env.CODEX_CLI) return "codex";

  const hosts = detectAllHosts();
  if (hosts.includes("claude")) return "claude";
  if (hosts.length > 0) return hosts[0];
  return "generic";
}
