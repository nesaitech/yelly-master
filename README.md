# yelly-master

AI Engineering Copilot Plugin — an all-in-one senior engineer for debugging, code review, testing, deployment, security auditing, and team collaboration.

Works with **Claude Code**, **Codex CLI**, **Cursor**, **Windsurf**, and **Kiro**.

## Quick Start

```bash
git clone git@github.com:nesaitech/yelly-master.git
cd yelly-master
npm install
./setup
```

The setup script will:
- Detect installed AI hosts (Claude Code, Codex, Cursor, Windsurf, Kiro)
- Create symlinks and generate skill files for each host
- Register safe permissions automatically
- Initialize user config at `~/.yelly-master/config.yaml`

After setup, restart your AI agent session. You'll have access to:
- `/yelly-code` — debug, review, refactor, plan
- `/yelly-ops` — ci, deploy, monitor, env, docker
- `/yelly-quality` — test, security, perf, qa, lint, health
- `/yelly-team` — doc, retro, onboard, changelog

## Architecture

```
yelly-master/
├── skills/           # 4 mega-skills (user-facing)
│   ├── yelly-code/   #   debug, review, refactor, plan
│   ├── yelly-ops/    #   ci, deploy, monitor, env, docker
│   ├── yelly-quality/#   test, security, perf, qa, lint, health
│   └── yelly-team/   #   doc, retro, onboard, changelog
├── modules/          # 19 internal knowledge modules (loaded on-demand)
├── lib/              # Core TypeScript library
├── bin/              # CLI tools
├── scripts/          # Build & template generation
├── config/           # Default configuration
├── migrations/       # Version migration scripts
└── test/             # Tests (static, unit, integration, e2e)
```

### How It Works

1. User invokes a mega-skill: `/yelly-code "fix login bug"`
2. Lightweight SKILL.md loads with routing logic
3. AI matches request to the right module (e.g., `debug`)
4. Module guide loaded on-demand (saves context tokens)
5. AI executes the methodology, cross-loading other modules as needed
6. Unified output: root cause + fix + review notes + suggested tests

### Config Hierarchy (5 levels, high overrides low)

```
1. modules/<name>/config.yaml        # Module defaults
2. config/defaults.yaml               # Global defaults
3. ~/.yelly-master/config.yaml        # User preferences
4. .yelly-master/config.yaml          # Project overrides
5. .yelly-master/<module>.yaml        # Project + module specific
```

## CLI Tools

```bash
# Config management
npm run yelly-config -- get test.framework
npm run yelly-config -- set test.tdd true
npm run yelly-config -- path

# Version check
npm run yelly-update-check

# Repo mode detection
npm run yelly-repo-mode
```

## Development

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:static

# Watch mode
npm run test:watch

# Type check
npx tsc --noEmit

# Generate SKILL.md from templates
npm run gen:skills
npm run gen:skills -- --host=codex    # for a specific host
npm run gen:skills -- --dry-run       # preview without writing
```

## Multi-Host Support

| Host | Skills Dir | Settings |
|------|-----------|----------|
| Claude Code | `~/.claude/skills/` | `~/.claude/settings.json` |
| Codex CLI | `~/.codex/skills/` | `~/.codex/settings.json` |
| Cursor | `~/.cursor/skills/` | N/A |
| Windsurf | `~/.windsurf/skills/` | N/A |
| Kiro | `~/.kiro/skills/` | `~/.kiro/settings.json` |

Config directory (`~/.yelly-master/`) is shared across all hosts.

## Modules

19 knowledge modules across 4 mega-skills:

| yelly-code | yelly-ops | yelly-quality | yelly-team |
|-----------|----------|--------------|-----------|
| debug | ci | test | doc |
| review | deploy | security | retro |
| refactor | monitor | perf | onboard |
| plan | env | qa | changelog |
| | docker | lint | |
| | | health | |

Each module contains: `guide.md` (methodology), `patterns.md` (reference), `config.yaml` (permissions + settings), `prompts/` (scenario-specific), `hooks/` (pre/post scripts).

## Roadmap

- [x] **Phase 1: Foundation** — core lib, CLI binaries, template engine (61 tests)
- [x] **Phase 2: Modules** — 19 knowledge modules with guides, patterns, prompts
- [x] **Phase 3: Mega-Skills** — 4 SKILL.md.tmpl files with routing + permission pre-request
- [x] **Phase 4: Setup Script** — multi-host install, symlinks, permission registration
- [x] **Phase 5: CI/CD** — GitHub Actions pipeline (static, unit, typecheck, skills, modules)

## License

MIT
