# ADR Module — Reference Patterns

A catalog of common ADR types with templates and examples.

---

## Pattern: Build vs Buy

When deciding whether to build a capability in-house or adopt a third-party solution.

**Context section should cover:**
- What capability is needed and why
- Cost of building (engineering time, ongoing maintenance)
- Cost of buying (license, integration effort, vendor risk)
- Strategic value of owning the capability

**Decision form:** "We adopt <vendor> for <capability>" or "We build <capability> in-house."

**Required alternatives:** at least one of the unchosen options, with cost comparison.

---

## Pattern: Framework or Library Choice

When picking among multiple libraries that solve the same problem.

**Context section should cover:**
- The problem and constraints (size, ecosystem, team familiarity)
- Specific deal-breakers (license, SSR support, bundle size, etc.)

**Decision form:** "We use <library> for <purpose>."

**Alternatives:** the top 2-3 contenders with specific reasons for rejection (not "less popular").

---

## Pattern: Data Model Decision

When choosing a database, schema strategy, or data architecture.

**Context section should cover:**
- Read/write patterns (ratio, peak load)
- Consistency requirements (strong vs eventual)
- Query complexity (analytical vs transactional)
- Operational constraints (managed service availability, team skills)

**Decision form:** "We store <data> in <database> using <schema strategy>."

**Common neutral consequence:** vendor lock-in is rarely worth fighting in the early phase.

---

## Pattern: Architectural Boundary

When deciding how to split a monolith, where to draw service boundaries, or which module owns a capability.

**Context section should cover:**
- Why the current boundary is wrong (or why a new one is needed)
- What the new boundary protects against
- The cost of getting the boundary wrong

**Decision form:** "<Module A> owns <capability>. <Module B> consumes <capability> via <interface>."

**Required alternatives:** at least one alternative split, with a concrete scenario showing why it is worse.

---

## Pattern: Process Decision

When deciding how the team will work — branching strategy, code review process, deployment frequency.

**Context section should cover:**
- The problem the current process causes
- Constraints (team size, geography, compliance)

**Decision form:** "We <do this> for <reason>. The <person/role> is responsible."

**Common pitfall:** process ADRs that nobody reads. Keep them short and post the link in the team channel.

---

## Anti-pattern: "Status quo" ADRs

Do NOT write an ADR to document something that was never a decision. ADRs record forks in the road, not defaults. If everyone always knew we would use TypeScript, there is no ADR to write.

## Status field reference

```yaml
status: proposed              # drafted, awaiting review
status: accepted              # agreed and active
status: superseded-by-0007    # replaced; original kept for history
status: rejected              # considered, not adopted
status: deprecated            # no longer relevant; rarely used directly
```

When an ADR is superseded, also update `superseded_by:` in the original's frontmatter.
