import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";
import { parseFrontmatter } from "./frontmatter.js";

export interface ValidateResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

const REQUIRED_FRONTMATTER_KEYS = [
  "yelly_version",
  "yelly_lead_version",
  "last_updated",
  "last_updated_by",
  "schema",
];

const ADR_FILENAME_RE = /^\d{4}-[a-z0-9-]+\.md$/;
const YELLY_MD_MAX_LINES = 400;

export function validateProjectDir(projectDir: string): ValidateResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const yellyPath = join(projectDir, "YELLY.md");
  if (!existsSync(yellyPath)) {
    errors.push(`YELLY.md not found at ${yellyPath}`);
    return { ok: false, errors, warnings };
  }

  const content = readFileSync(yellyPath, "utf-8");
  const { frontmatter } = parseFrontmatter(content);

  for (const key of REQUIRED_FRONTMATTER_KEYS) {
    if (!(key in frontmatter)) {
      errors.push(`YELLY.md frontmatter missing key: ${key}`);
    }
  }

  const lines = content.split("\n").length;
  if (lines > YELLY_MD_MAX_LINES) {
    warnings.push(
      `YELLY.md has ${lines} lines (over the 400 line soft cap — consider rotating Decision Log)`,
    );
  }

  const adrDir = join(projectDir, "docs", "yelly", "adr");
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
