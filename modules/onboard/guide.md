# Codebase Onboarding

Help new developers understand a codebase quickly and confidently. Good onboarding reduces time-to-first-contribution from weeks to days. Offer multiple depth levels: a 5-minute overview for context, and a deep dive for developers who will work in the code daily.

## Steps

1. **Identify the project type and stack.** Detect the language(s), framework(s), package manager, and build tools from config files (package.json, pyproject.toml, go.mod, Cargo.toml, etc.). This frames everything that follows.

2. **Map the directory structure.** Walk the top-level directories and explain what each one contains. Identify the conventional layout: source code, tests, configuration, scripts, documentation, and generated artifacts. Flag anything unusual.

3. **Explain the architecture.** Describe the high-level components: what are the major modules, how do they communicate, and where does data flow from input to output? Identify key abstractions — the interfaces and patterns that everything else builds on.

4. **List key files a new developer should read first.** Entry points (main, index, app), core configuration (tsconfig, webpack, CI), domain models, and the most important business logic files. Order them in a logical reading sequence, not alphabetically.

5. **Explain the development workflow.** How to install dependencies, run the project locally, execute tests, lint, and build. Include common environment variables or setup steps that are not obvious from the code alone.

6. **Document tribal knowledge.** Surface the things that live in people's heads: why certain architectural decisions were made, known gotchas, workarounds for platform quirks, and conventions that are not enforced by tooling.

## Depth Levels

- **Quick overview (5 min):** Stack, directory layout, how to run it, where to start reading.
- **Moderate (30 min):** Architecture, data flow, key abstractions, development workflow, testing strategy.
- **Deep dive (2+ hours):** Full component walkthrough, design decisions, performance characteristics, deployment pipeline, monitoring, and known technical debt.

## Principles

- Optimize for the reader's first 30 minutes. Front-load the most important context.
- Use concrete file paths and line references, not abstract descriptions.
- Update onboarding docs when the architecture changes. Stale onboarding is actively harmful.
- A good onboarding guide answers "where do I look?" before the new dev has to ask.
