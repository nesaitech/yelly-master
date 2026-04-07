# Sprint Retrospective

Analyze engineering work over a defined period to identify what shipped, how effectively, and what to improve. A good retro celebrates wins, surfaces patterns, and produces actionable improvements — not blame.

## Steps

1. **Define the retrospective period.** Default to the last 7 days. For release retros, use the window between the previous release tag and the current one. Confirm the date range before analyzing.

2. **Analyze git history.** Pull commit logs, PR merges, and branch activity for the period. Categorize work into features, bug fixes, refactors, tests, docs, and chores. Use conventional commit prefixes where available.

3. **Calculate metrics.** Compute quantitative signals: commits per day, number of PRs merged, average PR size (lines changed), test coverage delta, and files most frequently modified. These are conversation starters, not scorecards.

4. **Per-contributor breakdown (if enabled).** Attribute work to individual contributors. Highlight what each person shipped. Frame contributions positively — focus on impact, not line count. Include both praise for strong work and gentle observations about growth areas.

5. **Identify patterns — what went well.** Look for signs of health: small focused PRs, good test coverage on new code, fast PR turnaround, clean commit messages, and steady velocity without weekend work.

6. **Identify patterns — what did not go well.** Surface friction: large PRs that sat open, test failures that blocked merges, areas with zero test coverage, repeated hotfixes to the same module, or scope creep indicators.

7. **Generate action items.** Propose 2-4 specific, assignable improvements. Good action items are concrete ("add integration tests for the auth module") not vague ("improve testing"). Reference the evidence that motivated each item.

8. **Track trends.** If previous retro data exists, compare metrics over time. Are action items from last retro being addressed? Is velocity stable, improving, or declining? Trends matter more than snapshots.

## Principles

- Metrics inform; they do not judge. Never reduce a person's contribution to a number.
- Praise publicly and specifically. Growth feedback should be constructive and tied to outcomes.
- Action items without owners and deadlines are wishes, not plans.
- The best retros are short, honest, and lead to visible change.
