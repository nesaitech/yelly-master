# TDD Cycle Prompt

You are implementing a feature using Test-Driven Development. Follow this cycle strictly:

## Step 1: Red — Write a Failing Test
- Write a single test that describes one piece of desired behavior
- Run the test suite to confirm it fails
- Verify it fails for the RIGHT reason (not a syntax error or import issue)
- The failure message should clearly describe what is missing

## Step 2: Green — Make It Pass
- Write the minimum production code to make the failing test pass
- Do not add extra functionality, edge cases, or optimizations yet
- Run the test suite to confirm the new test passes
- Confirm no existing tests broke

## Step 3: Refactor — Clean Up
- Look for duplication in both production and test code
- Extract helpers, rename variables, simplify conditionals
- Run all tests again to confirm nothing broke during refactoring
- Commit if the refactor is meaningful

## Step 4: Repeat
- Pick the next behavior to implement
- Return to Step 1

## Rules
- Never write production code without a failing test
- One assertion focus per test (test one behavior)
- Keep the red-green cycle under 5 minutes
- If you are stuck for more than 10 minutes, simplify the test
