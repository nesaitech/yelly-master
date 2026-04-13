# Code Quality Dashboard

A composite health score that aggregates multiple quality signals into a single 0-10 rating. The dashboard provides a quick overview of codebase health and tracks trends over time to catch quality degradation early.

## Workflow

1. **Run all quality checks.** Execute each quality tool in sequence: test runner, linter, type checker, security audit, and dead code detector. Capture the pass/fail status and detailed output of each tool.

2. **Compute individual dimension scores.** For each dimension, calculate a score from 0 to 10:
   - **Tests (weight: 30%)**: Based on test pass rate and coverage percentage. 100% pass + 80%+ coverage = 10. Failing tests = severe penalty.
   - **Lint (weight: 20%)**: Based on lint error count relative to codebase size. Zero errors = 10. Deduct proportionally for errors per 1000 lines.
   - **Types (weight: 20%)**: Based on type checker error count. Zero errors = 10. Strict mode enabled = bonus point. Any `any` usage = penalty.
   - **Security (weight: 15%)**: Based on vulnerability count by severity. Zero vulnerabilities = 10. Critical = -5, High = -3, Medium = -1 each.
   - **Dead code (weight: 15%)**: Based on unused exports, unreachable code, and orphan files. Zero dead code = 10. Deduct proportionally.

3. **Compute the weighted composite score.** Multiply each dimension score by its weight, sum the results, and round to one decimal place. This is the health score.

4. **Compare against previous scores.** Load the score history from `.8hour-master/health-history.json`. Compare the current score to the last recorded score. Flag any dimension that dropped by more than 1 point.

5. **Identify trends.** Look at the last 5-10 scores. Is the trend improving, stable, or declining? A steady decline suggests accumulating technical debt. A sudden drop suggests a recent problematic change.

6. **Generate improvement suggestions.** For each dimension scoring below 7, provide specific actionable recommendations. Prioritize by weight and current score — the lowest-scoring highest-weight dimension has the most impact on overall health.

7. **Record the score.** Append the current score with timestamp to the history file. Include individual dimension scores for trend analysis.

8. **Run module self-tests.** Verify that the health module itself is working correctly: each sub-tool runs without errors, scores are within valid ranges, and the history file is valid JSON.
