# Estimate Module — Reference Patterns

---

## Reference Class Forecasting

When you have very few data points for the *exact* feature being estimated, find the closest **reference class** — a category of similar past work — and use its average outcome instead.

**Example:** estimating a Stripe integration. Reference class = "third-party API integration with webhook handling." If the team has done 3 of those, averaging 6 days each, start at 6 ± 2 days. Then layer in this feature's specific complexities.

This is the single most reliable estimate adjustment.

---

## Cone of Uncertainty

Estimate ranges should narrow as work progresses, not stay fixed.

| Phase | Uncertainty |
|---|---|
| Pre-spec | 4× (P95 / P50) |
| Spec done | 2× |
| Plan done | 1.5× |
| Implementation midway | 1.2× |
| Last 10% | 1.05× |

If your range is still 4× wide after the plan is written, the plan is not good enough.

---

## Planning Poker (multi-engineer estimates)

When the team is more than one person:

1. Each engineer privately writes O/M/P
2. Reveal simultaneously
3. The two outliers explain their reasoning
4. Re-vote

If two estimates differ by more than 3×, they are estimating different things — clarify scope, do not average.

---

## PERT vs simple estimate

PERT (`E = (O + 4M + P) / 6`) gives slightly more weight to the most-likely case but still surfaces tail risk. It is a small refinement over `(O + M + P) / 3` but matters more for aggregation across many tasks because it propagates standard deviations correctly.

---

## Historical bias examples

| History | Bias (mean actual/estimated) | Calibration action |
|---|---|---|
| 10 estimates, mean 1.0 | none | apply no correction |
| 10 estimates, mean 1.4 | systematic underestimate | multiply current estimate by 1.4 |
| 10 estimates, std 0.3, mean 1.4 | predictable underestimate | apply 1.4× confidently |
| 10 estimates, std 1.2, mean 1.0 | random — no bias, but high variance | widen confidence interval, do not multiply |

The fix for **systematic** bias is multiplication. The fix for **random** variance is widening the interval.

---

## Aggregating variances

When summing N independent task estimates:

- `E_total = sum(E_i)`
- `σ_total = sqrt(sum(σ_i^2))`

Standard deviations do NOT add directly. Adding them produces overly wide intervals. Always sum variances and take the square root.

---

## Forty-percent buffer

If you do not have history data and cannot do reference class forecasting, **add 40% to the most-likely estimate** as a starting point. It is empirically close to the historical bias of new teams. Document this as `bias_correction: 1.4 (no history)` in the output.

---

## Anti-pattern: estimate-by-deadline

If a stakeholder says "we need this by Friday," that is a *constraint*, not an estimate. Estimate the work first, then compare to the constraint. Reporting "we estimate 9 days, the deadline is 5 days, here is what we cut" is honest. Reporting "5 days" is not.
