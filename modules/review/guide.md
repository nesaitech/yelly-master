# Review Module — Methodology Guide

This guide defines the systematic code review methodology an AI agent must follow when reviewing pull requests, diffs, or code changes. Every review follows eight phases in order.

## Phase 1: Understand Context

Before reading any code, understand what the change is trying to accomplish.

1. Read the PR description, linked issues, and commit messages.
2. Identify the type of change: feature, bug fix, refactor, infrastructure, documentation.
3. Note the scope: how many files changed, which areas of the codebase are affected.
4. If context is missing, ask the author before proceeding — reviewing without understanding intent leads to bad feedback.

## Phase 2: Architecture Check

Evaluate whether the change fits the existing codebase.

1. Does this change follow the project's established patterns? Check nearby files for conventions.
2. Is the code in the right place? Does the file/module organization make sense?
3. Are new dependencies justified? Check `package.json` changes carefully.
4. Does the change introduce any new patterns? If so, is that intentional and documented?

## Phase 3: Security Scan

Look for vulnerabilities using the OWASP Top 10 as a baseline.

1. **Injection:** Are user inputs sanitized before use in SQL, shell commands, or HTML?
2. **Authentication/Authorization:** Are endpoints protected? Are permissions checked?
3. **XSS:** Is user-generated content escaped before rendering?
4. **Sensitive data:** Are secrets, tokens, or PII handled correctly? Never logged or exposed in responses.
5. **Dependencies:** Do new packages have known vulnerabilities?

## Phase 4: Performance Check

Identify performance issues that could affect production.

1. **Database:** N+1 queries, missing indexes, unbounded queries (no LIMIT).
2. **Frontend:** Unnecessary re-renders, large bundle additions, missing lazy loading.
3. **API:** Missing pagination, overfetching, no caching headers.
4. **Algorithms:** O(n^2) loops that could be O(n), unnecessary array copies.

## Phase 5: Error Handling

Verify that failures are handled gracefully.

1. Are all async operations wrapped in try/catch or .catch()?
2. Are errors logged with enough context to debug later?
3. Are user-facing error messages helpful without leaking internals?
4. Are edge cases handled: empty arrays, null values, network timeouts?

## Phase 6: Naming and Readability

Code is read far more often than it is written.

1. Are variable and function names clear and descriptive?
2. Is the code DRY without being over-abstracted?
3. Does each function do one thing (single responsibility)?
4. Are comments explaining WHY, not WHAT? (Code should explain what.)
5. Is the code complexity justified, or is there a simpler approach?

## Phase 7: Testing

Evaluate whether the change is adequately tested.

1. Are new features covered by tests?
2. Are bug fixes accompanied by a regression test?
3. Are tests testing behavior, not implementation details?
4. Are edge cases tested?
5. Do test names clearly describe what they verify?

## Phase 8: Verdict

Deliver your review with a clear recommendation.

1. **Approve:** The change is good to merge. Minor nits can be noted but do not block.
2. **Request changes:** There are issues that must be fixed before merging. Be specific about what needs to change and why.
3. **Comment:** You have questions or suggestions but are not blocking.

## Severity Levels

Use these labels on each comment to help the author prioritize:

- **critical:** Must fix before merge. Security vulnerability, data loss risk, or broken functionality.
- **important:** Should fix before merge. Performance issue, missing error handling, or architectural concern.
- **minor:** Nice to fix but will not block. Naming, code style, minor simplification.
- **nit:** Trivial suggestion. Take it or leave it.

## Giving Constructive Feedback

- Be specific: point to the exact line and explain what is wrong and how to fix it.
- Explain WHY, not just WHAT. "This could cause a memory leak because..." is better than "Fix this."
- Offer alternatives, not just criticism. Show a code example of what you suggest.
- Acknowledge good work. If something is well done, say so.
- Assume good intent. The author made the best choice they could with the information they had.
