# yelly-master

AI Engineering Copilot Plugin — an all-in-one senior engineer for debugging, code review, testing, deployment, security auditing, and team collaboration.

Works with **Claude Code**, **Codex CLI**, **Cursor**, **Windsurf**, and **Kiro**.

## Quick Start

```bash
git clone git@github.com:nesaitech/yelly-master.git
cd yelly-master
npm install
./setup  # coming in Phase 4
```

## Manual Setup (Phase 1)

Until the setup script is ready, you can install manually:

```bash
# 1. Clone
git clone git@github.com:nesaitech/yelly-master.git
cd yelly-master

# 2. Install dependencies
npm install

# 3. Verify everything works
npm test              # 61 tests should pass
npx tsc --noEmit      # TypeScript should compile clean

# 4. Link skills to your AI host (example: Claude Code)
mkdir -p ~/.claude/skills/yelly-master
ln -sf "$(pwd)/skills" ~/.claude/skills/yelly-master/skills
ln -sf "$(pwd)/modules" ~/.claude/skills/yelly-master/modules
ln -sf "$(pwd)/bin" ~/.claude/skills/yelly-master/bin

# 5. Generate SKILL.md files from templates
npm run gen:skills

# 6. Initialize config
mkdir -p ~/.yelly-master
cp config/defaults.yaml ~/.yelly-master/config.yaml
```

## Architecture

```
yelly-master/
├── skills/           # 4 mega-skills (user-facing)
│   ├── yelly-code/   #   debug, review, refactor, plan
│   ├── yelly-ops/    #   ci, deploy, monitor, env, docker
│   ├── yelly-quality/#   test, security, perf, qa, lint, health
│   └── yelly-team/   #   doc, retro, onboard, changelog
├── modules/          # 20 internal knowledge modules (loaded on-demand)
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

## Roadmap

- [x] **Phase 1: Foundation** — core lib, CLI binaries, template engine
- [ ] **Phase 2: Modules** — 20 knowledge modules with guides, patterns, prompts
- [ ] **Phase 3: Mega-Skills** — 4 SKILL.md.tmpl files with routing + permission pre-request
- [ ] **Phase 4: Setup Script** — multi-host install, symlinks, permission registration
- [ ] **Phase 5: Testing & CI** — integration tests, e2e tests, GitHub Actions

## License

MIT
