import {
  parseFrontmatter,
  serializeFrontmatter,
  type Frontmatter,
} from "./frontmatter.js";

export type SectionName =
  | "project-snapshot"
  | "active-work"
  | "architecture-decisions"
  | "top-risks"
  | "tech-debt"
  | "decision-log"
  | "open-questions"
  | "pinned-notes";

export interface UpdateMeta {
  updated_by: string;
  yelly_lead_version: string;
}

function buildSectionRegex(section: SectionName): RegExp {
  const esc = section.replace(/-/g, "\\-");
  return new RegExp(
    `(<!--\\s*yelly-lead:\\s*${esc}[^>]*-->)([\\s\\S]*?)(<!--\\s*/yelly-lead:\\s*${esc}\\s*-->)`,
    "m",
  );
}

export function replaceSection(
  content: string,
  section: SectionName,
  newBody: string,
): string {
  const re = buildSectionRegex(section);
  if (!re.test(content)) {
    throw new Error(`Section marker not found: ${section}`);
  }
  const normalizedBody = newBody.endsWith("\n") ? newBody : newBody + "\n";
  return content.replace(re, `$1\n${normalizedBody}$3`);
}

export function appendToSection(
  content: string,
  section: SectionName,
  newLine: string,
): string {
  const re = buildSectionRegex(section);
  const match = content.match(re);
  if (!match) {
    throw new Error(`Section marker not found: ${section}`);
  }
  const existingBody = match[2].trim();
  const isPlaceholder =
    existingBody === "" ||
    /^_[^_]+_$/.test(existingBody) ||
    /^_None( yet)?\._$/.test(existingBody);
  const merged = isPlaceholder ? newLine : `${existingBody}\n${newLine}`;
  return replaceSection(content, section, merged);
}

export function countLines(content: string): number {
  if (content.length === 0) return 0;
  const trimmed = content.endsWith("\n") ? content.slice(0, -1) : content;
  return trimmed.split("\n").length;
}

export function stampFrontmatter(content: string, meta: UpdateMeta): string {
  const { frontmatter, body } = parseFrontmatter(content);
  const updated: Frontmatter = {
    ...frontmatter,
    last_updated: new Date().toISOString(),
    last_updated_by: meta.updated_by,
    yelly_lead_version: meta.yelly_lead_version,
  };
  return serializeFrontmatter(updated, body);
}
