import { readdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import type { HostName, TemplateContext } from "../lib/types.js";
import { ALL_RESOLVERS, resolveTemplate } from "./resolvers/index.js";

export interface GenOptions {
  skillsDir: string;
  host: HostName;
  modulesRoot: string;
  binRoot: string;
  version: string;
  dryRun?: boolean;
}

export interface GenResult {
  skill: string;
  success: boolean;
  error?: string;
}

export function generateSkillDocs(options: GenOptions): GenResult[] {
  const { skillsDir, host, modulesRoot, binRoot, version, dryRun } = options;
  const results: GenResult[] = [];

  const ctx: TemplateContext = { host, modulesRoot, binRoot, version };

  let entries: string[];
  try {
    entries = readdirSync(skillsDir);
  } catch {
    return [];
  }

  for (const entry of entries) {
    const tmplPath = join(skillsDir, entry, "SKILL.md.tmpl");
    if (!existsSync(tmplPath)) continue;

    try {
      const template = readFileSync(tmplPath, "utf-8");
      const resolved = resolveTemplate(template, ALL_RESOLVERS, ctx);

      if (!dryRun) {
        writeFileSync(join(skillsDir, entry, "SKILL.md"), resolved, "utf-8");
      }

      results.push({ skill: entry, success: true });
    } catch (err) {
      results.push({
        skill: entry,
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}
