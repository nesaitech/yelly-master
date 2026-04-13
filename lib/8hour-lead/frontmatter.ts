import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname } from "path";
import yaml from "js-yaml";

export type FrontmatterValue = unknown;
export type Frontmatter = Record<string, unknown>;

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
  if (rawYaml.trim().length === 0) {
    return { frontmatter: {}, body };
  }
  try {
    const loaded = yaml.load(rawYaml) as unknown;
    if (loaded && typeof loaded === "object" && !Array.isArray(loaded)) {
      return { frontmatter: loaded as Frontmatter, body };
    }
    return { frontmatter: {}, body };
  } catch {
    return { frontmatter: {}, body };
  }
}

export function serializeFrontmatter(
  frontmatter: Frontmatter,
  body: string,
): string {
  if (Object.keys(frontmatter).length === 0) {
    return body;
  }
  // noCompatMode disables YAML 1.1 back-compat so bare keys like `n`, `y`, `on`, `off`
  // serialize unquoted. Without it, `{ n: 1 }` dumps as `'n': 1`.
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
  try {
    const content = readFileSync(filepath, "utf-8");
    return parseFrontmatter(content);
  } catch {
    return { frontmatter: {}, body: "" };
  }
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
