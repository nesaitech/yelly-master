import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { generateSkillDocs } from "../../scripts/gen-skill-docs.js";
import { mkdirSync, writeFileSync, readFileSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

describe("generateSkillDocs", () => {
  const tmp = join(tmpdir(), "yelly-test-gen-" + Date.now());

  beforeEach(() => {
    mkdirSync(tmp, { recursive: true });
  });

  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true });
  });

  it("generates SKILL.md from SKILL.md.tmpl", () => {
    const skillDir = join(tmp, "skills", "yelly-code");
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(
      join(skillDir, "SKILL.md.tmpl"),
      "---\nname: yelly-code\ndescription: Engineering Core\n---\n\n{{PREAMBLE}}\n\nModules at: {{MODULES_ROOT}}\nBin at: {{BIN_ROOT}}\nVersion: {{VERSION}}\n"
    );

    const results = generateSkillDocs({
      skillsDir: join(tmp, "skills"),
      host: "claude",
      modulesRoot: "/home/user/.claude/skills/yelly-master/modules",
      binRoot: "/home/user/.claude/skills/yelly-master/bin",
      version: "0.1.0",
    });

    expect(results.length).toBe(1);
    expect(results[0].skill).toBe("yelly-code");
    expect(results[0].success).toBe(true);

    const output = readFileSync(join(skillDir, "SKILL.md"), "utf-8");
    expect(output).toContain("yelly-master v0.1.0");
    expect(output).toContain("/home/user/.claude/skills/yelly-master/modules");
    expect(output).toContain("/home/user/.claude/skills/yelly-master/bin");
    expect(output).not.toContain("{{PREAMBLE}}");
    expect(output).not.toContain("{{MODULES_ROOT}}");
  });

  it("preserves frontmatter in output", () => {
    const skillDir = join(tmp, "skills", "yelly-ops");
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(
      join(skillDir, "SKILL.md.tmpl"),
      "---\nname: yelly-ops\ndescription: Operations\n---\n\nContent here.\n"
    );

    generateSkillDocs({
      skillsDir: join(tmp, "skills"),
      host: "claude",
      modulesRoot: "/modules",
      binRoot: "/bin",
      version: "0.1.0",
    });

    const output = readFileSync(join(skillDir, "SKILL.md"), "utf-8");
    expect(output).toContain("name: yelly-ops");
    expect(output).toContain("description: Operations");
  });

  it("handles multiple skills", () => {
    for (const name of ["yelly-code", "yelly-ops", "yelly-quality", "yelly-team"]) {
      const dir = join(tmp, "skills", name);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "SKILL.md.tmpl"), `---\nname: ${name}\n---\n\n{{VERSION}}\n`);
    }

    const results = generateSkillDocs({
      skillsDir: join(tmp, "skills"),
      host: "claude",
      modulesRoot: "/m",
      binRoot: "/b",
      version: "0.1.0",
    });

    expect(results.length).toBe(4);
    expect(results.every(r => r.success)).toBe(true);
  });
});
