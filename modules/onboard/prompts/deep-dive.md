# Comprehensive Architecture Walkthrough

Generate a deep-dive onboarding guide covering architecture, data flow, design decisions, and development workflows.

## Process

1. **Complete the quick overview first.** Stack, directory layout, entry point, and how to run.

2. **Map the architecture.** Identify all major components/modules. For each:
   - What is its responsibility?
   - What does it depend on?
   - What depends on it?
   - Draw a text-based component diagram.

3. **Trace the data flow.** Pick 1-2 representative user actions (e.g., "user signs up", "user fetches data") and trace the request from entry point through every layer to the response.

4. **Document key abstractions.** Identify the interfaces, base classes, and patterns that the codebase is built on. Explain why they exist and how to extend them.

5. **Explain the testing strategy.** What types of tests exist (unit, integration, e2e)? How are they organized? What is the coverage expectation? How to run specific test suites.

6. **Document the deployment pipeline.** From merge to production: what happens at each step? CI checks, build, deploy, monitoring.

7. **Surface tribal knowledge.** Known quirks, workarounds, performance-sensitive areas, and "don't touch this without talking to someone" zones.

## Output Format

```markdown
# [Project Name] — Architecture Deep Dive

## Architecture Overview
[Component diagram and description]

## Data Flow
### Flow: [User Action]
[Step-by-step trace through the code]

## Key Abstractions
### [Pattern/Interface Name]
- Purpose: [why it exists]
- Location: [file path]
- How to extend: [instructions]

## Testing
[Strategy, organization, how to run]

## Deployment
[Pipeline description]

## Known Gotchas
- [Gotcha with context and workaround]
```

## Guidelines

- Reference specific file paths and function names throughout.
- Include "why" explanations for architectural decisions, not just "what."
- Flag areas of technical debt or known fragility.
- Estimate reading time at the top of the document.
