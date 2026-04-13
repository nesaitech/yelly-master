# Risk Module — Reference Patterns

---

## Risk heatmap (ASCII)

Quick visualization of the register, severity = impact × probability.

```
              Probability →
            1     2     3     4     5
        +-----+-----+-----+-----+-----+
      1 |  1  |  2  |  3  |  4  |  5  |
        +-----+-----+-----+-----+-----+
      2 |  2  |  4  |  6  |  8  | 10  |
        +-----+-----+-----+-----+-----+
Imp   3 |  3  |  6  |  9  | 12  | 15  |
        +-----+-----+-----+-----+-----+
      4 |  4  |  8  | 12  | 16  | 20  |
        +-----+-----+-----+-----+-----+
      5 |  5  | 10  | 15  | 20  | 25  |
        +-----+-----+-----+-----+-----+

  1-6:   Low
  7-12:  Medium
  13-19: High
  20-25: Critical
```

---

## STRIDE for security risks

When categorizing security risks, use STRIDE (from Microsoft):

| Letter | Threat | Example |
|---|---|---|
| S | Spoofing | impersonation, session hijacking |
| T | Tampering | data integrity attacks |
| R | Repudiation | "I did not do that" with no audit trail |
| I | Information disclosure | leakage, side-channel |
| D | Denial of service | flooding, resource exhaustion |
| E | Elevation of privilege | privilege escalation |

Each category has its own typical mitigations. Cross-reference `modules/security/guide.md` for technical detail.

---

## Standard mitigation patterns

| Risk type | Mitigation pattern |
|---|---|
| Third-party API failure | Circuit breaker + cached fallback |
| Database migration | Reversible migration + dry-run on staging copy |
| Estimate slip | Time-box + early warning at 50% / 75% / 90% of estimate |
| Key-person dependency | Pairing + documented runbook |
| Data corruption | Daily backup + restore drill |
| Vendor lock-in | Abstraction layer + documented exit path |
| Scope creep | Written acceptance criteria + change-control gate |

---

## When to elevate a risk

Promote severity when **any** of these signal:

- The mitigation has been pending past its due date
- A near-miss occurred (the risk almost materialized)
- An external change made the trigger more likely (new regulation, vendor pricing, etc.)
- A senior team member loses confidence in the mitigation

Demote severity ONLY when the mitigation is verified in production AND a review interval has passed.

---

## Anti-pattern: severity-by-vibe

Severity must be I × P, not "feels critical." If you are tempted to score 5×5=25 because it feels right, slow down: rate I and P separately, justify each in one sentence, then multiply. This forces the explicit thinking that separates risk management from anxiety.

---

## Owner reassignment rule

If a risk owner changes role, leaves the team, or is unavailable for >1 week, the risk **must** be reassigned within 48 hours. An ownerless risk has no defense and rotates to "no owner — escalate" within the next review cycle.
