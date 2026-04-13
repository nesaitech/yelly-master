# Debt Module — Reference Patterns

Common debt categories with detection heuristics and prioritization hints.

---

## SQALE-inspired classification

The SQALE method (Software Quality Assessment based on Lifecycle Expectations) classifies debt by what quality dimension is degraded. We use a simplified five-category version:

| Category | Detection signal | Why it matters |
|---|---|---|
| `maintainability` | files >500 LOC, cyclomatic complexity >20, deep nesting | Slows every future change |
| `reliability` | missing error handling, untested retries, race conditions | Surfaces as production incidents |
| `security` | known CVEs, missing input validation, weak crypto | One bad bug can leak data |
| `performance` | known-slow endpoints, N+1 queries, missing caches | Degrades user experience |
| `test-coverage` | files with no test sibling, mutation score <60% | Slows every refactor |

---

## Prudent vs Reckless debt

From Martin Fowler's debt quadrant — used to decide whether to forgive a debt item or punish it.

|              | Deliberate              | Inadvertent                       |
|---|---|---|
| **Prudent**  | "Ship now, fix in 2 weeks" | "Now we know how it should be"  |
| **Reckless** | "We do not have time for tests" | "What is layering?"          |

- **Prudent + Deliberate:** acceptable. Track the followup, ship.
- **Prudent + Inadvertent:** the most common kind. Refactor when convenient.
- **Reckless + Deliberate:** do NOT accept. Push back at decision time.
- **Reckless + Inadvertent:** training opportunity. Pair-program to fix.

When prioritizing, reckless items get a +1 risk bump.

---

## Cost estimation heuristics

Rough mapping from observable signals to days-to-fix:

| Signal | Typical cost |
|---|---|
| Single function, well-tested module | 0.5d |
| Single file, untested | 1-2d |
| Multi-file refactor in one module | 3-5d |
| Cross-module API change | 5-10d |
| Database migration with downtime risk | 5-15d (plus risk premium) |
| Strangler-fig replacement of a subsystem | 2-8 weeks |

Use these as a starting point; the actual estimate should come from the `estimate` module.

---

## Risk scoring heuristic

```
R = 1 + (production_incidents_last_quarter * 1.5)
  + (touched_in_last_10_PRs ? 1 : 0)
  + (security_or_reliability_category ? 1 : 0)
```

Cap at 5. This favors items that are both visible in the change pattern AND known-fragile.

---

## Top-5 selection rule

After scoring, pick the top 5 by `(R + B) / C`. If two items tie, prefer the one with the lower cost — it ships faster and frees capacity for the next round.

The top 5 are NOT a roadmap. They are a *current attention* list. Re-rank every scan.

---

## When to file an issue vs add to local register

| Situation | Action |
|---|---|
| Team uses GitHub Issues actively | File via `gh issue create` |
| Team uses Jira but not the CLI | File via the local register; user manually copies later |
| Personal project, no team | Local register |
| OSS contribution scan | Local register; submit upstream PRs separately |

The fallback is never the *best* state — push the team toward consolidating in their tracker over time.

---

## Anti-pattern: the perpetual debt list

A debt register that grows monotonically is a confession that debt is being filed but not paid. After every quarter, **at least one** of the top 5 must be closed before the next scan. If not, the team is in debt-management failure and the situation should be raised in the next retrospective.
