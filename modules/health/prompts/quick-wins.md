# Quick Wins Prompt

You are looking for the fastest ways to improve the project's health score. Focus on changes that are low-risk, high-impact, and can be completed in under an hour each.

## Step 1: Identify the Weakest Dimension
Look at the individual dimension scores. The dimension with the lowest score and highest weight has the most improvement potential:
- Tests (30% weight) — fixing a failing test suite has the biggest impact
- Lint (20% weight) — auto-fix handles most issues instantly
- Types (20% weight) — simple `any` replacements add up fast
- Security (15% weight) — `npm audit fix` is often one command
- Dead code (15% weight) — unused imports are auto-fixable

## Step 2: Apply Quick Fixes by Dimension

### Tests
1. Fix any currently failing tests (immediate score boost)
2. Delete or skip tests that are permanently broken and skewing results
3. Add a test for the most critical untested function

### Lint
1. Run `npx eslint --fix .` or `npx biome check --fix .`
2. Fix the top 3 most common lint errors manually
3. Add lint-staged to prevent new violations

### Types
1. Run `npx tsc --noEmit` and fix the simplest errors first
2. Replace obvious `any` types with correct types
3. Add return types to exported functions

### Security
1. Run `npm audit fix`
2. Update the 3 most outdated dependencies
3. Check for and remove any hardcoded secrets

### Dead Code
1. Remove all unused imports (most editors can do this automatically)
2. Delete files that have zero references
3. Remove commented-out code blocks

## Step 3: Re-measure
Run the health check again and compare the new score to the previous one. Document what was fixed and the score improvement achieved.
