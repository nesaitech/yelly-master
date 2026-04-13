# Risk Module — Methodology Guide

Risk management is the discipline of naming what could go wrong **before** it does, scoring it, mitigating what is mitigable, and accepting the rest with eyes open. The output is a *living* register — not a one-time exercise.

A risk register that nobody reads is worse than no register: it creates the illusion of preparedness. This module is built around making the register integrate with workflows that already exist (deploy, code review, estimate) so risks are surfaced where engineers already look.

## What counts as a risk

A risk has three properties:

1. **It has not happened yet.** (After it happens, it is an *incident*, not a risk.)
2. **It is uncertain.** (Certainties are *facts* — handle them in the plan.)
3. **It would matter if it happened.** (Trivial what-ifs are not risks.)

If any property is missing, do not file it as a risk.

## Workflow

### Step 1: Identify

Walk through these categories:

- **Technical:** scaling limits, third-party API failures, data corruption, race conditions
- **Schedule:** estimate slip, dependency delays, key-person availability
- **Scope:** moving requirements, undocumented assumptions, feature creep
- **Team:** burnout, knowledge silos, hiring gaps, churn
- **External:** regulatory changes, market shifts, supplier risk, vendor lock-in
- **Security:** new CVE in a dependency, weakened auth, data leak surface

For each candidate, write one sentence: "If <X> happens, then <Y>." If you cannot finish the sentence, it is not a risk yet.

### Step 2: Score

Each risk gets two scores, 1-5:

- **Impact (I):** how bad is Y? (1 = annoyance, 5 = company-ending)
- **Probability (P):** how likely is X in the next 90 days? (1 = remote, 5 = expected)

**Severity = I × P** (range 1-25).

| Severity | Interpretation | Action |
|---|---|---|
| 1-6 | Low | Note in register, no immediate action |
| 7-12 | Medium | Owner + due date for mitigation |
| 13-19 | High | Active mitigation, weekly review |
| 20-25 | Critical | Block dependent work until mitigated |

### Step 3: Mitigate

For each risk, name:

- **Owner** — single named person responsible (not "the team")
- **Mitigation** — what we do to reduce probability OR impact
- **Contingency** — what we do *if* it happens
- **Due date** — when the mitigation is in place

Mitigation reduces P or I. Contingency caps the damage if mitigation fails. Both are valuable; mitigation alone is not enough for high-severity risks.

### Step 4: Save

Write each risk to `docs/8hour/risks/active.md`, one risk per H2 section. Use `templates/risk.md.tmpl` from Plan 1 as the format.

### Step 5: Update 8HOUR.md

- `replaceSection("top-risks", <top 5 by severity, formatted>)`
- `appendToSection("decision-log", "- YYYY-MM-DD — Risk added: <title> (severity <S>)")`
- `stampFrontmatter(...)`

### Step 6: Commit

```bash
git add docs/8hour/risks/active.md 8HOUR.md
git commit -m "docs(risk): <action> — <title> (severity <S>)"
```

## Closing a risk

A risk closes when **either** condition holds:

1. The mitigation is complete and the residual severity is ≤6
2. The risk is confirmed as no longer applicable (e.g., the feature was cancelled)

Move closed risks from `active.md` to `docs/8hour/risks/archive/YYYY-MM.md`. Append the resolution note: what mitigation worked, what did not, what was learned. Closed risks are part of the team's memory.

## Integration with other modules

This is the part that makes a risk register useful instead of decorative.

### deploy gate

When the user invokes `/8hour-lead risk deploy-gate`, the module reads `active.md` and reports any risks with severity ≥`severity_threshold_block` (default 20). The deploy module's pre-flight should call this gate and refuse to deploy without an explicit override (`--accept-risk-<id>` per blocking risk).

### review

When the `review` module sees a PR diff that touches files mentioned in any active risk's "Description" or "Mitigation" section, it surfaces the risk in the review output.

### estimate

The `estimate` module's risk adjustment factor (default 1.2×) increases when active high-severity risks affect the estimated work. Use the configured `risk_factor_default` plus a per-risk multiplier when applicable.

These integrations are **best effort** in MVP — the risk module exposes the data, the other modules opt-in to consume it. Plan 3 wires up the actual gate.

## Anti-patterns

- **Risks without owners.** A risk owned by "the team" is owned by nobody. Always name a person.
- **Risks without contingencies.** Mitigation can fail. If the contingency section is blank, you are gambling.
- **Treating high-severity risks as decoration.** Critical risks should block work. If they do not, the team is not actually managing risk.
- **Mass-adding risks during a planning meeting and never updating them.** Risks must be reviewed weekly while active.

## Cross-module references

- `templates/risk.md.tmpl` — file format
- `lib/8hour-lead/8hour-md-updater.ts` — for 8HOUR.md updates
- `modules/deploy` — consumes the risk gate
- `modules/review` — consumes the risk-files mapping
- `modules/estimate` — consumes the risk adjustment factor
- `modules/security` — security risks can be filed here, with the security module supplying the technical detail
