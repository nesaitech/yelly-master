// lib/router.ts
import type { RouteMatch } from "./types.js";

type ModuleKeywords = Record<string, string[]>;

export const MEGA_SKILL_MODULES: Record<string, ModuleKeywords> = {
  "8hour-code": {
    debug:    ["fix", "bug", "error", "crash", "broken", "investigate", "debug", "issue", "fail", "exception", "trace"],
    review:   ["review", "check", "pr", "merge", "diff", "code review", "pull request", "approve"],
    refactor: ["refactor", "clean", "restructure", "extract", "rename", "reorganize", "simplify", "split"],
    plan:     ["plan", "design", "architect", "approach", "how to build", "strategy", "rfc", "spec"],
  },
  "8hour-ops": {
    ci:      ["ci", "pipeline", "github actions", "workflow", "build fail", "ci/cd", "jenkins", "gitlab ci"],
    deploy:  ["deploy", "ship", "release", "production", "staging", "rollback", "promote"],
    monitor: ["monitor", "canary", "health check", "post-deploy", "uptime", "alert", "observability"],
    env:     ["env", "environment", "secrets", ".env", "config vars", "environment variable"],
    docker:  ["docker", "container", "compose", "image", "k8s", "kubernetes", "dockerfile"],
  },
  "8hour-quality": {
    test:     ["test", "unit", "integration", "e2e", "coverage", "spec", "jest", "vitest", "pytest"],
    security: ["security", "audit", "vulnerability", "owasp", "secrets scan", "cve", "dependency audit"],
    perf:     ["performance", "slow", "optimize", "benchmark", "profiling", "lighthouse", "bundle size"],
    qa:       ["qa", "browser test", "visual", "screenshot", "verify site", "regression", "smoke test"],
    lint:     ["lint", "format", "eslint", "prettier", "standards", "style guide", "formatting"],
    health:   ["health", "quality score", "tech debt", "code smell", "complexity", "maintainability"],
  },
  "8hour-team": {
    doc:       ["document", "readme", "api docs", "jsdoc", "documentation", "typedoc"],
    retro:     ["retro", "retrospective", "sprint", "what went well", "weekly review"],
    onboard:   ["onboard", "new dev", "explain codebase", "walkthrough", "getting started"],
    changelog: ["changelog", "release notes", "what changed", "version", "history"],
  },
};

export function routeRequest(megaSkill: string, request: string): RouteMatch[] {
  const modules = MEGA_SKILL_MODULES[megaSkill];
  if (!modules) return [];

  const normalized = request.toLowerCase().trim();
  if (!normalized) return [];

  const matches: RouteMatch[] = [];

  for (const [moduleName, keywords] of Object.entries(modules)) {
    const matchedKeywords: string[] = [];

    for (const keyword of keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
      }
    }

    if (matchedKeywords.length > 0) {
      matches.push({
        module: moduleName,
        confidence: matchedKeywords.length / keywords.length,
        keywords: matchedKeywords,
      });
    }
  }

  matches.sort((a, b) => b.confidence - a.confidence);
  return matches;
}

export function getAllModules(megaSkill: string): string[] {
  const modules = MEGA_SKILL_MODULES[megaSkill];
  if (!modules) return [];
  return Object.keys(modules);
}

export function getAllMegaSkills(): string[] {
  return Object.keys(MEGA_SKILL_MODULES);
}
