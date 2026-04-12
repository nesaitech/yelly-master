import { describe, it, expect } from "vitest";
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import {
  parseFrontmatter,
  serializeFrontmatter,
  readMarkdownWithFrontmatter,
  writeMarkdownWithFrontmatter,
} from "../../../lib/yelly-lead/frontmatter.js";

describe("parseFrontmatter", () => {
  it("parses a markdown file with frontmatter", () => {
    const content = `---
title: Hello
count: 3
active: true
---
# Body

Text here.
`;
    const { frontmatter, body } = parseFrontmatter(content);
    expect(frontmatter).toEqual({ title: "Hello", count: 3, active: true });
    expect(body).toBe("# Body\n\nText here.\n");
  });

  it("returns empty frontmatter when missing", () => {
    const content = "# Just a body\n";
    const { frontmatter, body } = parseFrontmatter(content);
    expect(frontmatter).toEqual({});
    expect(body).toBe("# Just a body\n");
  });

  it("handles empty frontmatter block", () => {
    const content = "---\n---\nbody\n";
    const { frontmatter, body } = parseFrontmatter(content);
    expect(frontmatter).toEqual({});
    expect(body).toBe("body\n");
  });

  it("preserves horizontal rules in body (not treated as frontmatter)", () => {
    const content = "# Title\n\n---\n\nSection two\n";
    const { frontmatter, body } = parseFrontmatter(content);
    expect(frontmatter).toEqual({});
    expect(body).toBe(content);
  });

  it("returns empty frontmatter and body on malformed YAML", () => {
    // unclosed quote → YAMLException
    const content = `---\ntitle: "unterminated\n---\n# Body\n`;
    const { frontmatter, body } = parseFrontmatter(content);
    expect(frontmatter).toEqual({});
    expect(body).toBe("# Body\n");
  });

  it("ignores a frontmatter block that loads to a non-object", () => {
    const content = `---\njust-a-string\n---\nbody\n`;
    const { frontmatter, body } = parseFrontmatter(content);
    expect(frontmatter).toEqual({});
    expect(body).toBe("body\n");
  });

  it("preserves nested objects, arrays, and dates from YAML", () => {
    const content = `---\ntags:\n  - a\n  - b\ndate: 2026-04-13\nnested:\n  key: value\n---\nbody\n`;
    const { frontmatter } = parseFrontmatter(content);
    expect(frontmatter.tags).toEqual(["a", "b"]);
    expect(frontmatter.date).toBeInstanceOf(Date);
    expect(frontmatter.nested).toEqual({ key: "value" });
  });
});

describe("serializeFrontmatter", () => {
  it("emits frontmatter block then body", () => {
    const out = serializeFrontmatter({ title: "X", n: 1 }, "# Body\n");
    expect(out).toBe("---\ntitle: X\nn: 1\n---\n# Body\n");
  });

  it("emits no block when frontmatter is empty", () => {
    const out = serializeFrontmatter({}, "# Body\n");
    expect(out).toBe("# Body\n");
  });
});

describe("round-trip file IO", () => {
  const tmp = join(tmpdir(), "yelly-fm-test-" + Date.now());

  it("writes and reads back frontmatter + body", () => {
    mkdirSync(tmp, { recursive: true });
    const path = join(tmp, "doc.md");
    writeMarkdownWithFrontmatter(path, { v: 1, name: "test" }, "# Hi\n");
    const parsed = readMarkdownWithFrontmatter(path);
    expect(parsed.frontmatter).toEqual({ v: 1, name: "test" });
    expect(parsed.body).toBe("# Hi\n");
    rmSync(tmp, { recursive: true, force: true });
  });

  it("returns empty result for missing file", () => {
    const result = readMarkdownWithFrontmatter("/nonexistent/x.md");
    expect(result.frontmatter).toEqual({});
    expect(result.body).toBe("");
  });

  it("returns empty result when read fails (e.g., directory, not file)", () => {
    // readFileSync on a directory throws EISDIR — must be caught
    const result = readMarkdownWithFrontmatter(tmpdir());
    expect(result.frontmatter).toEqual({});
    expect(result.body).toBe("");
  });
});
