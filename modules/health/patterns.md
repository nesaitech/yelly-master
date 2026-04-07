# Health Patterns

## Score Interpretation

### Health Score Ranges
- **9-10 (Excellent)**: All dimensions strong. Codebase is well-maintained. Focus on keeping it here.
- **7-8 (Good)**: Most dimensions healthy with minor issues. Address before they compound.
- **4-6 (Needs Work)**: Significant issues in one or more dimensions. Prioritize the lowest-scoring areas.
- **0-3 (Critical)**: Major quality problems. Failing tests, security vulnerabilities, or widespread type errors. Stop feature work and fix the foundation.

## Degradation Signals

### Common Health Degradation Signals
- **Sudden score drop (>2 points)**: Usually caused by a large merge with failing tests or lint errors. Check recent commits.
- **Gradual decline (0.5 points per week)**: Accumulating technical debt. Tests not updated, lint warnings ignored, dependencies not maintained.
- **One dimension cratering while others are fine**: Targeted neglect. Common with security (dependencies go stale) and dead code (features removed but code left behind).
- **Score oscillation**: Fixes applied then reverted, or CI checks disabled then re-enabled. Indicates process issues.

## Quick Wins

### Quick Wins by Dimension

#### Tests (30% weight)
- Fix failing tests first (biggest impact on score)
- Add tests for uncovered critical paths
- Remove flaky tests or fix them
- Enable coverage reporting in CI

#### Lint (20% weight)
- Run auto-fix: `npx eslint --fix .` or `npx biome check --fix .`
- Address the single most common error type first
- Enable lint-staged to prevent new violations

#### Types (20% weight)
- Fix `tsc` errors starting with the simplest ones
- Replace `any` with proper types in high-traffic files
- Enable strict mode incrementally with `// @ts-strict` comments

#### Security (15% weight)
- Run `npm audit fix` for automatic dependency patches
- Rotate any exposed secrets immediately
- Update dependencies with known vulnerabilities

#### Dead Code (15% weight)
- Remove unused imports (auto-fixable by most linters)
- Delete files with zero imports/references
- Remove commented-out code blocks

## Trend Analysis

### Trend Analysis Over Time
- **Improving trend (consistent +0.5/week)**: Good engineering practices in place. Celebrate and maintain.
- **Stable trend (within +/-0.3)**: Acceptable steady state. Watch for the start of a decline.
- **Declining trend (-0.5/week or more)**: Intervention needed. Schedule a tech debt sprint.
- **Volatile trend (large swings)**: Process inconsistency. Standardize CI checks and PR requirements.

### Tracking Recommendations
- Record scores at least weekly (ideally on every merge to main)
- Keep at least 30 data points for meaningful trend analysis
- Set alerts for scores dropping below 6
- Review health trends in sprint retrospectives
