# Testing Patterns

## Structural Patterns

### Arrange-Act-Assert (AAA)
Every test follows three phases:
- **Arrange**: Set up test data, mocks, and preconditions
- **Act**: Execute the function or action under test
- **Assert**: Verify the result matches expectations

Keep each phase clearly separated. If arrange is more than 5-10 lines, extract a helper.

### Test Isolation
- Each test runs independently with no shared mutable state
- Use `beforeEach` / `setUp` to create fresh fixtures per test
- Never rely on test execution order
- Clean up side effects (timers, listeners, temp files) in teardown
- Use separate database transactions or in-memory databases for integration tests

### Meaningful Test Names
- Describe the scenario and expected outcome: `should throw ValidationError when email is empty`
- Group related tests under descriptive `describe` / `context` blocks
- Read the test name aloud — it should form a sentence

## Anti-Patterns to Avoid

### Testing Implementation Details
- Do not assert on internal state or private methods
- Test observable behavior: return values, side effects, thrown errors
- If a refactor breaks your test but not your feature, the test was too coupled

### Brittle Assertions
- Avoid asserting on exact timestamps or random values
- Use matchers like `toContain`, `toMatchObject`, `toBeCloseTo` where appropriate
- Prefer semantic assertions over string matching

## Integration Test Strategies

### Database Strategies
- **Transaction rollback**: Wrap each test in a transaction, rollback after
- **Isolated database**: Use a separate test database, truncate between tests
- **In-memory database**: SQLite in-memory for fast, disposable tests
- **Fixtures/seeds**: Load known data before each test suite

### API Integration Tests
- Use `supertest` or equivalent to test HTTP endpoints without a running server
- Assert on status codes, response shape, and headers
- Test error paths: 400, 401, 403, 404, 500

## E2E Test Stability

### Flaky Test Prevention
- Use explicit waits instead of arbitrary `sleep` calls
- Wait for specific DOM elements or network responses
- Retry flaky assertions with bounded retries
- Use stable selectors: `data-testid` over CSS classes

### Reliable Selectors
- Prefer `data-testid="submit-button"` over `.btn-primary`
- Avoid positional selectors like `:nth-child(3)`
- Keep selectors resilient to styling and layout changes

### Test Data Management
- Use deterministic test data, not production data
- Create test data programmatically in test setup
- Clean up created data in teardown
