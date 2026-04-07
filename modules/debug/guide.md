# Debug Module — Methodology Guide

This guide defines the systematic debugging methodology an AI agent must follow when investigating and resolving bugs. Every debugging session follows six phases in order. Do not skip phases.

## Phase 1: Reproduce

Before touching any code, confirm you can trigger the bug reliably.

1. Gather all available error details: stack traces, error messages, logs, screenshots.
2. Identify the exact steps to reproduce. If the user provided steps, follow them verbatim.
3. Run the failing test or trigger the failing behavior in a local environment.
4. If you cannot reproduce after two attempts, ask the user for more context before proceeding.

**Example:** If the error is `TypeError: Cannot read properties of undefined (reading 'id')`, run the exact API call or test that triggers it and capture the full stack trace.

## Phase 2: Isolate

Narrow the problem to the smallest possible scope.

1. Use the stack trace to identify the file and line number where the error originates.
2. If no stack trace exists, use binary search: add logging at the midpoint of the suspected code path and narrow from there.
3. Use `Grep` to search for related symbols, error messages, or patterns across the codebase.
4. Check if the issue is in application code, a dependency, or configuration.

**Goal:** Identify the exact file and function responsible.

## Phase 3: Root Cause

Understand WHY the bug occurs, not just WHERE.

1. Read the surrounding code carefully. Understand the intended behavior.
2. Run `git blame` on the affected lines to see when they were last changed and by whom.
3. Run `git log --oneline -10 -- <file>` to check recent changes to the file.
4. Ask: Is this a regression? A missing edge case? A misunderstanding of an API?
5. Form a hypothesis and validate it with evidence (logs, tests, code reading).

## Phase 4: Fix

Apply a minimal, targeted fix that addresses the root cause.

1. Fix the root cause, not the symptom. If null comes from upstream, fix upstream — do not add a null check at the crash site unless that is the correct boundary.
2. Keep the diff small. One bug, one fix, one commit.
3. Do not refactor unrelated code in the same change.

## Phase 5: Verify

Confirm the fix works and does not break anything else.

1. Run the reproduction steps from Phase 1. Confirm the bug is gone.
2. Run the full test suite: `npm test` or `npx vitest`.
3. If no test existed for this bug, write one (see Phase 6).
4. Check for related edge cases the fix might affect.

## Phase 6: Prevent

Add a regression test so this bug cannot return silently.

1. Write a test that would have caught this bug before your fix.
2. Verify the test fails without your fix and passes with it.
3. If the bug was caused by a systemic pattern, suggest a lint rule or type improvement.

## Rules

- **Max 3 attempts:** If you cannot resolve the bug after three fix attempts, stop and escalate to the user with a summary of what you tried and what you learned.
- **Rollback:** If a fix makes things worse (more tests fail, new errors appear), immediately revert with `git checkout -- <file>` and reassess.
- **Escalate:** If the bug is in a third-party dependency or requires environment changes you cannot make, report your findings and let the user decide.
- **Log everything:** Use `log_level: verbose` to capture your reasoning at each phase.
