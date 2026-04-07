# Weekly Retrospective

Analyze the last 7 days of engineering work and produce a structured retrospective.

## Data Collection

1. Run `git log --oneline --since="7 days ago"` to get all commits.
2. Run `git shortlog -sn --since="7 days ago"` for per-author breakdown.
3. Run `git diff --stat $(git log --since="7 days ago" --format="%H" | tail -1)..HEAD` for overall change scope.
4. Check for any open PRs that have been waiting longer than 2 days.

## Output Format

```markdown
# Weekly Retro: [Date Range]

## What Shipped
- [Feature/fix description] (by @author, PR #N)
- ...

## Metrics
- Commits: N
- PRs merged: N
- Lines changed: +N / -N
- Contributors: N

## What Went Well
- [Specific observation with evidence]

## What Didn't Go Well
- [Specific observation with evidence]

## Action Items
- [ ] [Concrete action] — Owner: @person, Due: [date]
- [ ] [Concrete action] — Owner: @person, Due: [date]

## Previous Action Item Status
- [x] [Completed item from last retro]
- [ ] [Incomplete item — carried forward or dropped with reason]
```

## Guidelines

- Keep it under 1 page. Brevity forces prioritization.
- Every "what didn't go well" item should have a corresponding action item.
- Celebrate specific contributions, not generic praise.
