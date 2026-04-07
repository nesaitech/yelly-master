# Refactor Module — Methodology Guide

This guide defines the safe refactoring methodology an AI agent must follow when restructuring code without changing its behavior. Safety is the priority: every step must preserve existing functionality.

## Phase 1: Identify Scope

Before changing any code, define what needs refactoring and why.

1. What is the specific problem? Name it: "This 300-line function does too many things" or "This pattern is duplicated in 4 places."
2. What is the desired end state? Be concrete: "Three focused functions of 40-60 lines each" or "One shared utility used by all 4 call sites."
3. What is the boundary? List exactly which files and functions will change. Do not let scope creep beyond this boundary.

## Phase 2: Ensure Test Coverage

You must have tests BEFORE you refactor. Refactoring without tests is gambling.

1. Run the existing test suite: `npm test` or `npx vitest`. All tests must pass.
2. Check coverage of the code you plan to change. Use `npx vitest --coverage` if available.
3. If the code you are refactoring has no tests, write characterization tests first. These tests capture the current behavior, whatever it is. Commit them separately before starting the refactor.
4. If you cannot write tests (no test infrastructure, too tightly coupled), inform the user and get explicit approval before proceeding.

## Phase 3: Small Steps

Refactor in the smallest possible increments. Each step should be independently correct.

1. Make one refactoring change at a time: extract a function, rename a variable, move a block.
2. After each change, run tests. If tests fail, revert immediately and try a smaller step.
3. Commit after each successful step. This gives you safe rollback points.
4. Never combine refactoring with behavior changes in the same step.

**Example sequence:**
- Step 1: Extract `validateInput()` from the large function. Run tests. Commit.
- Step 2: Extract `transformData()`. Run tests. Commit.
- Step 3: Extract `saveResult()`. Run tests. Commit.
- Step 4: Rename the original function to reflect its new orchestration role. Run tests. Commit.

## Phase 4: Preserve Behavior

The defining rule of refactoring: behavior must not change.

1. Tests must pass after every step. No exceptions.
2. If you need to change a public interface (function signature, API contract), that is not a refactor — it is a breaking change. Treat it differently.
3. Use your IDE or `Grep` to find all callers before changing any function signature.
4. Temporary duplication is acceptable. It is safer to duplicate and then remove the old code than to change in place.

## Phase 5: Common Refactorings

These are the safe, well-defined refactorings you should reach for:

- **Extract function:** Pull a block of code into a named function. The original code calls the new function.
- **Inline variable:** Replace a variable used once with its value, if the expression is clear enough.
- **Rename:** Change a name to better reflect what it does. Update all references.
- **Move file:** Relocate a module to a more logical directory. Update all imports.
- **Split module:** Break a large file into smaller, focused modules. Each module gets one responsibility.

## Phase 6: Verify

After all refactoring steps are complete:

1. Run the full test suite one final time.
2. Run `git diff` against the branch point to review the total change.
3. Verify that no behavior has changed: same inputs produce same outputs.
4. If the refactoring improved testability, consider adding new tests now.

## When NOT to Refactor

- **No test coverage and no time to write tests.** You are likely to break things silently.
- **On a deadline.** Refactoring can uncover unexpected complexity. Do it when you have slack.
- **Scope too large.** If the refactoring touches more than 10 files, break it into smaller refactoring PRs.
- **The code is about to be deleted.** Do not polish code that is being replaced.
- **You do not understand the code.** Read it, write tests for it, then refactor. In that order.
