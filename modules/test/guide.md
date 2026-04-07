# Testing Strategy

A disciplined approach to writing and maintaining tests that provide confidence in code correctness while keeping the test suite fast and maintainable.

## Workflow

1. **Choose the right test type.** Use the decision matrix: unit tests for pure logic and utilities, integration tests for module interactions and API endpoints, and e2e tests for critical user flows only. Default to unit tests unless the behavior under test spans multiple boundaries.

2. **Write the failing test first (TDD).** When TDD is enabled, start by writing a test that describes the expected behavior. Run it to confirm it fails for the right reason. This ensures you understand the requirement before writing code.

3. **Implement the minimal code to pass.** Write only enough production code to make the failing test green. Resist the urge to add functionality that no test demands yet.

4. **Verify the test passes.** Run the specific test file or suite. Confirm the new test passes and no existing tests broke.

5. **Refactor with confidence.** Clean up both production and test code. Extract helpers, rename for clarity, remove duplication. The passing test suite is your safety net.

6. **Apply naming conventions.** Name tests to describe behavior: `should return empty array when no items match filter`. Avoid names like `test1` or `works correctly`.

7. **Decide mocking strategy.** Mock external services (APIs, databases, file system) but prefer real implementations for internal modules. Over-mocking couples tests to implementation details and reduces confidence.

8. **Set coverage targets.** Aim for 80% line coverage as a baseline. Focus coverage on business logic, not boilerplate. Do not chase 100% — diminishing returns set in quickly.

9. **Handle snapshot testing carefully.** Use snapshots only for stable, serializable output (e.g., rendered component trees, API response shapes). Avoid snapshots for frequently changing data. Review snapshot diffs carefully — do not blindly update.

10. **Maintain test isolation.** Each test must be independent. No shared mutable state between tests. Use setup/teardown hooks to reset state. Tests that depend on execution order are a maintenance trap.
