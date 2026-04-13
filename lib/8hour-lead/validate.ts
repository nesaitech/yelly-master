import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";
import { parseFrontmatter } from "./frontmatter.js";

export interface ValidateResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

const REQUIRED_FRONTMATTER_KEYS = [
  "8hour_version",
  "8hour_lead_version",
  "last_updated",
  "last_updated_by",
  "schema",
];

const ADR_FILENAME_RE = /^\d{4}-[a-z0-9-]+\.md$/;
const EIGHT_HOUR_MD_MAX_LINES = 400;

export function validateProjectDir(projectDir: string): ValidateResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const eightHourPath = join(projectDir, "8HOUR.md");
  if (!existsSync(eightHourPath)) {
    errors.push(`8HOUR.md not found at ${eightHourPath}`);
    return { ok: false, errors, warnings };
  }

  const content = readFileSync(eightHourPath, "utf-8");
  const { frontmatter } = parseFrontmatter(content);

  for (const key of REQUIRED_FRONTMATTER_KEYS) {
    if (!(key in frontmatter)) {
      errors.push(`8HOUR.md frontmatter missing key: ${key}`);
    }
  }

  const lines = content.split("\n").length;
  if (lines > EIGHT_HOUR_MD_MAX_LINES) {
    warnings.push(
      `8HOUR.md has ${lines} lines (over the 400 line soft cap — consider rotating Decision Log)`,
    );
  }

  const adrDir = join(projectDir, "docs", "8hour", "adr");
  if (existsSync(adrDir)) {
    for (const entry of readdirSync(adrDir)) {
      if (entry === ".gitkeep") continue;
      if (!entry.endsWith(".md")) continue;
      if (!ADR_FILENAME_RE.test(entry)) {
        warnings.push(
          `ADR filename does not match NNNN-kebab-title.md pattern: ${entry}`,
        );
      }
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}
