# Quick Codebase Overview (5 Minutes)

Generate a concise overview that gives a new developer enough context to navigate the codebase.

## Process

1. **Detect the stack.** Read package.json, pyproject.toml, go.mod, or equivalent. Report: language, framework, major dependencies.

2. **Map the directory layout.** List top-level directories with a one-line description of each.

3. **Identify the entry point.** Find where the application starts (main file, index, app entry).

4. **Show how to run it.** Extract the dev/start/test commands from package.json scripts, Makefile, or equivalent.

5. **Point to key files.** List 5-8 files a new developer should read first, in order.

## Output Format

```markdown
# [Project Name] — Quick Overview

## Stack
- Language: [e.g., TypeScript]
- Framework: [e.g., Next.js]
- Database: [e.g., PostgreSQL via Prisma]
- Testing: [e.g., Vitest]

## Directory Layout
```
src/          — Application source code
test/         — Test files
config/       — Configuration files
scripts/      — Build and utility scripts
docs/         — Documentation
```

## Getting Started
\`\`\`bash
npm install
npm run dev
npm test
\`\`\`

## Key Files to Read First
1. `src/index.ts` — Entry point
2. `src/config.ts` — Configuration loading
3. `src/core/types.ts` — Core type definitions
4. ...
```

## Guidelines

- Keep the entire overview under 50 lines of markdown.
- Use actual file paths from the project, not generic examples.
- If something is unclear from code alone, say so rather than guessing.
