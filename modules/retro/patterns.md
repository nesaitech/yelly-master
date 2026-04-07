# Retrospective Patterns

## Good Retro Format

### What Went Well
- Specific wins with evidence (e.g., "Shipped auth module with 95% test coverage")
- Process improvements that paid off
- Collaboration highlights

### What Didn't Go Well
- Friction points with root causes, not symptoms
- Missed targets with honest assessment of why
- Technical debt that slowed work

### Action Items
- Each item has an owner, a deadline, and a definition of done
- Limited to 2-4 items — more than that means nothing gets done
- Carried forward from previous retro if unresolved

## Metrics That Matter

### Velocity
- Commits per day (trend, not absolute)
- PRs merged per week
- Features shipped vs planned

### Quality
- Test coverage delta (did it go up or down?)
- Bug fix ratio (fixes / total commits)
- Hotfix frequency (unplanned patches to production)

### Collaboration
- Average PR review turnaround time
- PR size distribution (smaller is healthier)
- Bus factor (how many people touch each module?)

## Common Anti-Patterns in Retros

### Blame Culture
- **Symptom**: "Person X broke the build"
- **Fix**: Focus on systems, not individuals. "Our CI didn't catch the regression" is actionable.

### No Action Items
- **Symptom**: Long discussion, no concrete next steps
- **Fix**: End every retro with exactly 2-4 written, assigned action items.

### Same Issues Recurring
- **Symptom**: "We said this last sprint too"
- **Fix**: Review previous retro's action items first. If they were not completed, ask why and either recommit or drop them honestly.

### Vanity Metrics
- **Symptom**: Celebrating line count or commit count
- **Fix**: Focus on outcomes (features shipped, bugs fixed, users unblocked) not activity.

## How to Track Action Item Follow-Through

1. **Start each retro by reviewing last retro's action items.** Status: done, in progress, dropped.
2. **Store retro data in a persistent location** (e.g., `docs/retros/`) so trends are visible.
3. **Tag action items with IDs** for cross-referencing (e.g., `RETRO-2025-W12-01`).
4. **Measure completion rate** over time. Healthy teams complete 70%+ of their action items.
