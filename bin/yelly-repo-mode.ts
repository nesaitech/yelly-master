import { existsSync } from "fs";
import { join } from "path";

type RepoMode = "monorepo" | "single-repo" | "multi-package" | "unknown";

function detectRepoMode(cwd: string): RepoMode {
  const hasWorkspaces = existsSync(join(cwd, "pnpm-workspace.yaml"));
  const hasLerna = existsSync(join(cwd, "lerna.json"));
  const hasTurbo = existsSync(join(cwd, "turbo.json"));
  const hasNx = existsSync(join(cwd, "nx.json"));
  const hasPackagesDir = existsSync(join(cwd, "packages"));
  const hasAppsDir = existsSync(join(cwd, "apps"));

  if (hasWorkspaces || hasLerna || hasTurbo || hasNx) {
    return "monorepo";
  }

  if (hasPackagesDir || hasAppsDir) {
    return "multi-package";
  }

  if (existsSync(join(cwd, "package.json"))) {
    return "single-repo";
  }

  return "unknown";
}

const cwd = process.argv[2] || process.cwd();
const mode = detectRepoMode(cwd);

console.log(`REPO_MODE=${mode}`);
