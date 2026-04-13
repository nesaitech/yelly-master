import { existsSync, readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";
import {
  replaceSection,
  stampFrontmatter,
} from "./8hour-md-updater.js";
import { parseFrontmatter } from "./frontmatter.js";

export interface SyncResult {
  eightHourMdRewritten: boolean;
  sectionsTouched: string[];
}

const ADR_FILENAME_RE = /^(\d{4})-([a-z0-9-]+)\.md$/;

interface AdrEntry {
  number: string;
  title: string;
  date: string;
  status: string;
}

function readAdrs(projectDir: string): AdrEntry[] {
  const dir = join(projectDir, "docs", "8hour", "adr");
  if (!existsSync(dir)) return [];
  const entries: AdrEntry[] = [];
  for (const file of readdirSync(dir)) {
    const m = file.match(ADR_FILENAME_RE);
    if (!m) continue;
    const content = readFileSync(join(dir, file), "utf-8");
    const { frontmatter } = parseFrontmatter(content);
    entries.push({
      number: m[1],
      title:
        typeof frontmatter["title"] === "string"
          ? (frontmatter["title"] as string)
          : m[2].replace(/-/g, " "),
      date:
        typeof frontmatter["date"] === "string"
          ? (frontmatter["date"] as string)
          : "",
      status:
        typeof frontmatter["status"] === "string"
          ? (frontmatter["status"] as string)
          : "unknown",
    });
  }
  entries.sort((a, b) => Number(b.number) - Number(a.number));
  return entries.slice(0, 5);
}

function formatAdrSection(entries: AdrEntry[]): string {
  if (entries.length === 0) return "_No ADRs recorded yet._";
  return entries
    .map((e) => `- ADR-${e.number}: ${e.title} — ${e.status}`)
    .join("\n");
}

interface RiskEntry {
  title: string;
  severity: number;
  owner: string;
}

function readActiveRisks(projectDir: string): RiskEntry[] {
  const path = join(projectDir, "docs", "8hour", "risks", "active.md");
  if (!existsSync(path)) return [];
  const content = readFileSync(path, "utf-8");
  const blocks = content.split(/^##\s+/m).slice(1);
  const risks: RiskEntry[] = [];
  for (const block of blocks) {
    const lines = block.split("\n");
    const title = (lines[0] || "").replace(/^Risk:\s*/i, "").trim();
    let severity = 0;
    let owner = "";
    for (const line of lines) {
      const sm = line.match(/Severity:\s*(\d+)/i);
      if (sm) severity = Number(sm[1]);
      const om = line.match(/Owner:\s*([^\s,]+)/i);
      if (om) owner = om[1];
    }
    if (title) risks.push({ title, severity, owner });
  }
  risks.sort((a, b) => b.severity - a.severity);
  return risks.slice(0, 5);
}

function formatRisksSection(entries: RiskEntry[]): string {
  if (entries.length === 0) return "_No risks tracked yet._";
  return entries
    .map(
      (e, i) =>
        `${i + 1}. **${e.title}** — severity ${e.severity}${e.owner ? ` (owner ${e.owner})` : ""}`,
    )
    .join("\n");
}

export function syncEightHourMd(
  projectDir: string,
  eightHourLeadVersion: string,
): SyncResult {
  const path = join(projectDir, "8HOUR.md");
  if (!existsSync(path)) {
    return { eightHourMdRewritten: false, sectionsTouched: [] };
  }
  let content = readFileSync(path, "utf-8");
  const sectionsTouched: string[] = [];

  const adrs = readAdrs(projectDir);
  if (adrs.length > 0) {
    content = replaceSection(
      content,
      "architecture-decisions",
      formatAdrSection(adrs),
    );
    sectionsTouched.push("architecture-decisions");
  }

  const risks = readActiveRisks(projectDir);
  if (risks.length > 0) {
    content = replaceSection(content, "top-risks", formatRisksSection(risks));
    sectionsTouched.push("top-risks");
  }

  content = stampFrontmatter(content, {
    updated_by: "8hour-lead-sync",
    "8hour_lead_version": eightHourLeadVersion,
  });

  writeFileSync(path, content, "utf-8");
  return { eightHourMdRewritten: true, sectionsTouched };
}
