# Diagnosing and Fixing Flaky Tests

You are investigating a test that passes sometimes and fails sometimes. Follow this systematic approach.

## Phase 1: Identify the Flakiness Pattern
- Run the test 10 times in isolation: does it always pass alone?
- Run the full suite 5 times: does it fail only when other tests run first?
- Check if the failure is timing-dependent (CI vs local, fast vs slow machine)

## Phase 2: Common Causes

### Shared State
- Tests modifying global variables, singletons, or module-level state
- Database records left behind by a previous test
- Fix: Reset state in beforeEach/afterEach, use unique test data per test

### Timing Issues
- Tests relying on setTimeout, setInterval, or real clock
- Race conditions with async operations
- Fix: Use fake timers, explicit waits, or polling with timeouts

### Non-Deterministic Data
- Tests depending on random values, current time, or UUIDs
- Fix: Seed random generators, mock Date.now(), use fixed UUIDs in tests

### External Dependencies
- Tests hitting real APIs, databases, or file systems
- Network latency or service unavailability causing failures
- Fix: Mock external services, use in-memory alternatives

## Phase 3: Fix and Verify
- Apply the fix
- Run the test 20 times in a loop to confirm stability
- Run the full suite 5 times to confirm no ordering issues
- Add a comment explaining why the fix was needed
