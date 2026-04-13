import { existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

export type TrackerType = "github" | "gitlab" | "jira" | "linear" | "none";

export interface TrackerInfo {
  type: TrackerType;
  cliAvailable: boolean;
  detectedVia: string;
}

function cliExists(binary: string): boolean {
  try {
    execSync(`command -v ${binary}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function detectTracker(projectDir: string): TrackerInfo {
  if (existsSync(join(projectDir, ".github"))) {
    return {
      type: "github",
      cliAvailable: cliExists("gh"),
      detectedVia: ".github/ directory present",
    };
  }
  if (existsSync(join(projectDir, ".gitlab-ci.yml"))) {
    return {
      type: "gitlab",
      cliAvailable: cliExists("glab"),
      detectedVia: ".gitlab-ci.yml present",
    };
  }
  if (cliExists("linear")) {
    return {
      type: "linear",
      cliAvailable: true,
      detectedVia: "linear CLI in PATH",
    };
  }
  if (cliExists("jira")) {
    return {
      type: "jira",
      cliAvailable: true,
      detectedVia: "jira CLI in PATH",
    };
  }
  return {
    type: "none",
    cliAvailable: false,
    detectedVia: "no tracker signals found",
  };
}
