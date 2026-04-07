# Plan Module — Methodology Guide

This guide defines the architecture planning methodology an AI agent must follow when designing new features, systems, or significant changes. Planning happens before any code is written.

## Phase 1: Understand Requirements

Start by making sure you know exactly what you are building and why.

1. **What:** Define the feature or change in one sentence. If you cannot, the scope is unclear.
2. **Why:** What problem does this solve? Who benefits? What happens if we do not build it?
3. **Constraints:** Budget, timeline, technology restrictions, backward compatibility requirements.
4. **Success criteria:** How will you know this is done? Define measurable outcomes: "API responds in under 200ms," "Users can complete the flow in 3 clicks."
5. If any of these are unclear, ask the user before proceeding. Planning on assumptions leads to rework.

## Phase 2: Explore Existing Codebase

Understand what you are working with before proposing what to build.

1. Identify existing patterns: how are similar features structured? Check 2-3 comparable modules.
2. Map dependencies: what does this feature need to interact with? Database, APIs, other modules.
3. Check conventions: naming patterns, file organization, test patterns, error handling style.
4. Look for reusable components: does something similar already exist that can be extended?
5. Use `Glob` and `Grep` extensively. Read key files. Do not guess at architecture.

## Phase 3: Propose Approaches

Present 2-3 distinct approaches with explicit trade-offs.

For each approach, document:
- **Description:** A paragraph explaining the approach.
- **Pros:** What it does well.
- **Cons:** What it does poorly or risks.
- **Effort estimate:** Small (hours), medium (1-2 days), large (3+ days).
- **Risk level:** Low, medium, high.

Example:
- **Approach A:** Add the logic inline to the existing handler. Pro: fast. Con: increases complexity of an already large file.
- **Approach B:** Extract a new service module. Pro: clean separation. Con: more files, new abstraction to maintain.
- **Approach C:** Use an event-driven pattern. Pro: decoupled. Con: harder to debug, overhead for a simple feature.

Always include a recommendation with reasoning.

## Phase 4: Design

Once an approach is selected, design the implementation in detail.

1. **Architecture diagram:** Describe components and how they interact (data flow, API calls, events).
2. **Interfaces:** Define the public API of each new component: function signatures, types, endpoints.
3. **Data model:** If the feature involves data, define the schema: tables, fields, relationships, indexes.
4. **Error handling:** How will each failure mode be handled? Network errors, invalid input, partial failures.
5. **Edge cases:** List known edge cases and how the design handles them.

## Phase 5: Break Down into Tasks

Decompose the design into tasks small enough that each one is a single commit.

1. Each task should be completable in under 30 minutes.
2. Each task should have a clear definition of done.
3. Tasks should be ordered by dependency: what must be built first?
4. Group tasks into milestones if the project spans multiple sessions.

**Example breakdown:**
1. Create database migration for `orders` table.
2. Create `OrderService` with `create()` and `findById()` methods.
3. Add validation logic for order creation.
4. Create API endpoint `POST /orders`.
5. Add integration tests for the order creation flow.

## Phase 6: Document

Write a spec that captures the plan before any code is written.

1. Summary: one paragraph describing what and why.
2. Chosen approach with rationale.
3. Interface definitions.
4. Task breakdown with ordering.
5. Open questions or decisions deferred.

Get explicit approval from the user before proceeding to implementation.

## Phase 7: TDD Plan

For each task, define what tests to write first.

1. What is the happy path test?
2. What are the error case tests?
3. What are the edge case tests?
4. Write test names (not implementations) as part of the plan.

## Principles

- **YAGNI (You Ain't Gonna Need It):** Do not design for hypothetical future requirements. Build what is needed now. It is cheaper to add later than to maintain unused abstractions.
- **When to decompose:** If a project has more than 10 tasks, consider splitting it into sub-projects that can be planned and shipped independently.
- **Reversibility:** Prefer designs that are easy to change. Avoid decisions that are expensive to undo (database schema choices, public API contracts).
