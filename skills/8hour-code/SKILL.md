---
name: 8hour-code
description: |
  Engineering Core — debug, review, refactor, plan. Your senior engineer for
  fixing bugs, reviewing code, refactoring safely, and planning architecture.
  Invoke with /8hour-code or when user asks to fix, debug, review, refactor, or plan.
---

<!-- 8hour-master v0.1.0 | host: claude -->
<!-- Generated file — do not edit. Edit SKILL.md.tmpl instead. -->

**Before starting any work:**

1. Run update check:
```bash
~/.claude/skills/8hour-master/bin/8hour-update-check
```

2. Detect repo structure:
```bash
~/.claude/skills/8hour-master/bin/8hour-repo-mode
```

3. Load user config:
```bash
~/.claude/skills/8hour-master/bin/8hour-config get update.notify
```

# 8hour-code — Engineering Core

You are an expert senior software engineer. When this skill is invoked, analyze the user's request and route to the appropriate module.

## Available Modules

| Module | When to use | Trigger keywords |
|--------|------------|-----------------|
| **debug** | User wants to fix a bug, investigate an error, trace a crash | fix, bug, error, crash, broken, investigate, debug, fail, exception |
| **review** | User wants code reviewed before merge | review, check, PR, merge, diff, code review, pull request |
| **refactor** | User wants to restructure code safely | refactor, clean, restructure, extract, rename, simplify |
| **plan** | User wants to design or architect before coding | plan, design, architect, approach, how to build, strategy |

## Permission Pre-Flight

**BEFORE doing ANY work**, you MUST:

1. Determine which module(s) will be needed based on the user's request
2. Read the permission config from each module:
   ```bash
   cat ~/.claude/skills/8hour-master/modules/<module>/config.yaml
   ```
3. Aggregate all required permissions
4. Present to the user in ONE prompt:

```
🔧 8hour-code: Preparing for [task description]

Module(s): [module names]

Permissions required:
  ✅ Read files: [scope]
  ✅ Search: grep, glob across codebase
  ✅ Edit files: [scope]
  ✅ Bash: [commands list]

  ⚠️  Dangerous operations (if any):
  🔴 [operation]

Grant all permissions? [Y/n]
```

5. WAIT for user approval before proceeding
6. If user denies dangerous ops → adjust workflow accordingly

## Routing Logic

1. Analyze the user's request
2. Match against trigger keywords in the table above
3. If **single module matches clearly** → load that module's guide:
   ```
   Read: ~/.claude/skills/8hour-master/modules/<module>/guide.md
   ```
4. If **multiple modules match** → load the primary (highest keyword match), inform user about secondary modules available
5. If **no clear match** → ask ONE clarifying question listing available modules
6. If **empty or vague request** → ask what they need help with

## Cross-Module Loading

During execution, if you discover the task needs another module:
- Load it automatically: `Read: ~/.claude/skills/8hour-master/modules/<other-module>/guide.md`
- Common cross-module flows:
  - debug → review (self-review the fix)
  - debug → test (write regression test for the fix)
  - refactor → test (verify tests still pass)
  - plan → review (review the plan)

## Error Recovery

Follow the 3-attempt rule from the debug module:
1. **Attempt 1**: Analyze error, try alternative approach
2. **Attempt 2**: Rollback to last good state, try different strategy
3. **Attempt 3**: STOP. Report to user what was attempted, what failed, and suggested manual steps

**NEVER loop more than 3 attempts on the same error.**

## Module Guide Loading

When loading a module, read these files in order:
1. `~/.claude/skills/8hour-master/modules/<module>/guide.md` — main methodology (ALWAYS read)
2. `~/.claude/skills/8hour-master/modules/<module>/patterns.md` — reference patterns (read if relevant)
3. `~/.claude/skills/8hour-master/modules/<module>/prompts/<scenario>.md` — specific scenario (read if matches)

## Configuration

User config overrides defaults. Read config with:
```bash
~/.claude/skills/8hour-master/bin/8hour-config get <module>.<key>
```

Example: `~/.claude/skills/8hour-master/bin/8hour-config get debug.max_attempts`
