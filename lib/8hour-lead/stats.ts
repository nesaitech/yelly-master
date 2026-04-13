import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";
import { parseFrontmatter } from "./frontmatter.js";

export interface ProjectStats {
  adrCount: number;
  activeRiskCount: number;
  topRiskSeverity: number | null;
  estimateHistoryCount: number;
  estimateBias: number | null;
  eightHourMdLines: number;
  eightHourMdLastUpdated: string | null;
}

const ADR_FILENAME_RE = /^\d{4}-[a-z0-9-]+\.md$/;

function countAdrs(projectDir: string): number {
  const dir = join(projectDir, "docs", "8hour", "adr");
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).filter((f) => ADR_FILENAME_RE.test(f)).length;
}

function countActiveRisks(projectDir: string): {
  count: number;
  topSeverity: number | null;
} {
  const path = join(projectDir, "docs", "8hour", "risks", "active.md");
  if (!existsSync(path)) return { count: 0, topSeverity: null };
  const content = readFileSync(path, "utf-8");
  const headers = content.match(/^##\s+/gm);
  const count = headers ? headers.length : 0;
  let topSeverity: number | null = null;
  for (const match of content.matchAll(/Severity:\s*(\d+)/gi)) {
    const n = Number(match[1]);
    if (topSeverity === null || n > topSeverity) topSeverity = n;
  }
  return { count, topSeverity };
}

function readEstimateHistory(projectDir: string): {
  count: number;
  bias: number | null;
} {
  const path = join(projectDir, ".8hour", "history", "estimates.jsonl");
  if (!existsSync(path)) return { count: 0, bias: null };
  const lines = readFileSync(path, "utf-8")
    .split("\n")
    .filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { count: 0, bias: null };
  const last10 = lines.slice(-10);
  const ratios: number[] = [];
  for (const line of last10) {
    try {
      const obj = JSON.parse(line) as { estimated?: number; actual?: number };
      if (
        typeof obj.estimated === "number" &&
        typeof obj.actual === "number" &&
        obj.estimated > 0
      ) {
        ratios.push(obj.actual / obj.estimated);
      }
    } catch {
      // skip malformed line
    }
  }
  const bias =
    ratios.length === 0
      ? null
      : ratios.reduce((a, b) => a + b, 0) / ratios.length;
  return { count: lines.length, bias };
}

function readEightHourMdInfo(projectDir: string): {
  lines: number;
  lastUpdated: string | null;
} {
  const path = join(projectDir, "8HOUR.md");
  if (!existsSync(path)) return { lines: 0, lastUpdated: null };
  const content = readFileSync(path, "utf-8");
  const lines = content.split("\n").length;
  const { frontmatter } = parseFrontmatter(content);
  const lu = frontmatter["last_updated"];
  // js-yaml parses ISO timestamps as Date; accept both shapes
  let lastUpdated: string | null = null;
  if (typeof lu === "string") lastUpdated = lu;
  else if (lu instanceof Date) lastUpdated = lu.toISOString();
  return { lines, lastUpdated };
}

export function gatherStats(projectDir: string): ProjectStats {
  const risks = countActiveRisks(projectDir);
  const history = readEstimateHistory(projectDir);
  const eightHourInfo = readEightHourMdInfo(projectDir);
  return {
    adrCount: countAdrs(projectDir),
    activeRiskCount: risks.count,
    topRiskSeverity: risks.topSeverity,
    estimateHistoryCount: history.count,
    estimateBias: history.bias,
    eightHourMdLines: eightHourInfo.lines,
    eightHourMdLastUpdated: eightHourInfo.lastUpdated,
  };
}
