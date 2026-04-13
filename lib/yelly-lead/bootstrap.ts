import { readFileSync, existsSync } from "fs";
import { join, basename } from "path";
import { execSync } from "child_process";

export interface DetectedStack {
  languages: string[];
  frameworks: string[];
  databases: string[];
}

export interface BootstrapContext {
  projectDir: string;
  projectName: string;
  stack: DetectedStack;
  teamSizeDetected: number;
}

export interface BootstrapAnswers {
  phase: string;
  currentFocus: string;
  teamSize: number;
}

const FRAMEWORK_HINTS: Record<string, string> = {
  express: "express",
  fastify: "fastify",
  next: "next",
  "@nestjs/core": "nestjs",
  react: "react",
  vue: "vue",
  svelte: "svelte",
  flask: "flask",
  django: "django",
  fastapi: "fastapi",
  gin: "gin",
};

const DATABASE_HINTS: Record<string, string> = {
  pg: "postgres",
  "pg-promise": "postgres",
  postgres: "postgres",
  mysql: "mysql",
  mysql2: "mysql",
  mongodb: "mongodb",
  mongoose: "mongodb",
  redis: "redis",
  ioredis: "redis",
  sqlite3: "sqlite",
  "better-sqlite3": "sqlite",
  prisma: "prisma",
  "@prisma/client": "prisma",
};

function readJsonSafe(path: string): Record<string, unknown> | null {
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}

function detectStack(projectDir: string): DetectedStack {
  const languages = new Set<string>();
  const frameworks = new Set<string>();
  const databases = new Set<string>();

  const pkgPath = join(projectDir, "package.json");
  if (existsSync(pkgPath)) {
    languages.add("node");
    const pkg = readJsonSafe(pkgPath) ?? {};
    const deps = {
      ...(pkg.dependencies as Record<string, string> | undefined),
      ...(pkg.devDependencies as Record<string, string> | undefined),
    };
    if (deps && typeof deps === "object") {
      if ("typescript" in deps) languages.add("typescript");
      for (const name of Object.keys(deps)) {
        if (FRAMEWORK_HINTS[name]) frameworks.add(FRAMEWORK_HINTS[name]);
        if (DATABASE_HINTS[name]) databases.add(DATABASE_HINTS[name]);
      }
    }
  }

  if (existsSync(join(projectDir, "requirements.txt"))) {
    languages.add("python");
    try {
      const reqs = readFileSync(
        join(projectDir, "requirements.txt"),
        "utf-8",
      );
      for (const line of reqs.split("\n")) {
        const name = line.split(/[=<>~!]/)[0].trim().toLowerCase();
        if (FRAMEWORK_HINTS[name]) frameworks.add(FRAMEWORK_HINTS[name]);
        if (DATABASE_HINTS[name]) databases.add(DATABASE_HINTS[name]);
      }
    } catch {
      // ignore
    }
  }

  if (existsSync(join(projectDir, "pyproject.toml"))) {
    languages.add("python");
  }

  if (existsSync(join(projectDir, "go.mod"))) {
    languages.add("go");
  }

  if (existsSync(join(projectDir, "Cargo.toml"))) {
    languages.add("rust");
  }

  return {
    languages: Array.from(languages).sort(),
    frameworks: Array.from(frameworks).sort(),
    databases: Array.from(databases).sort(),
  };
}

function detectTeamSize(projectDir: string): number {
  try {
    const output = execSync("git shortlog -sne --all", {
      cwd: projectDir,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    if (!output) return 1;
    return output.split("\n").length;
  } catch {
    return 1;
  }
}

export function gatherContext(projectDir: string): BootstrapContext {
  return {
    projectDir,
    projectName: basename(projectDir),
    stack: detectStack(projectDir),
    teamSizeDetected: detectTeamSize(projectDir),
  };
}

function stackToString(stack: DetectedStack): string {
  const parts: string[] = [];
  if (stack.languages.length > 0) parts.push(stack.languages.join(" + "));
  if (stack.frameworks.length > 0)
    parts.push(`(${stack.frameworks.join(", ")})`);
  if (stack.databases.length > 0)
    parts.push(`[db: ${stack.databases.join(", ")}]`);
  return parts.length > 0 ? parts.join(" ") : "unknown";
}

export function renderYellyMdTemplate(
  templatePath: string,
  context: BootstrapContext,
  answers: BootstrapAnswers,
  yellyLeadVersion: string,
): string {
  const template = readFileSync(templatePath, "utf-8");
  const replacements: Record<string, string> = {
    YELLY_LEAD_VERSION: yellyLeadVersion,
    LAST_UPDATED: new Date().toISOString(),
    PROJECT_NAME: context.projectName,
    STACK: stackToString(context.stack),
    PHASE: answers.phase,
    TEAM_SIZE: String(answers.teamSize),
    CURRENT_FOCUS: answers.currentFocus,
  };
  let output = template;
  for (const [key, value] of Object.entries(replacements)) {
    output = output.replaceAll(`{{${key}}}`, value);
  }
  return output;
}
