import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname } from "path";
import yaml from "js-yaml";

export type FrontmatterValue = string | number | boolean | null;
export type Frontmatter = Record<string, FrontmatterValue>;

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n?---\r?\n?([\s\S]*)$/;

export function parseFrontmatter(content: string): {
  frontmatter: Frontmatter;
  body: string;
} {
  const match = content.match(FRONTMATTER_RE);
  if (!match) {
    return { frontmatter: {}, body: content };
  }
  const rawYaml = match[1];
  const body = match[2];
  let parsed: Frontmatter = {};
  if (rawYaml.trim().length > 0) {
    const loaded = yaml.load(rawYaml) as unknown;
    if (loaded && typeof loaded === "object") {
      parsed = loaded as Frontmatter;
    }
  }
  return { frontmatter: parsed, body };
}

export function serializeFrontmatter(
  frontmatter: Frontmatter,
  body: string,
): string {
  if (Object.keys(frontmatter).length === 0) {
    return body;
  }
  const yamlBlock = yaml
    .dump(frontmatter, { lineWidth: 120, noCompatMode: true })
    .trimEnd();
  return `---\n${yamlBlock}\n---\n${body}`;
}

export function readMarkdownWithFrontmatter(filepath: string): {
  frontmatter: Frontmatter;
  body: string;
} {
  if (!existsSync(filepath)) {
    return { frontmatter: {}, body: "" };
  }
  const content = readFileSync(filepath, "utf-8");
  return parseFrontmatter(content);
}

export function writeMarkdownWithFrontmatter(
  filepath: string,
  frontmatter: Frontmatter,
  body: string,
): void {
  const dir = dirname(filepath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(filepath, serializeFrontmatter(frontmatter, body), "utf-8");
}
