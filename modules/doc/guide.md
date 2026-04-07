# Documentation Generation & Update

Maintain accurate, comprehensive documentation that evolves with the codebase. Follow the documentation-as-code principle: docs live alongside code, are versioned, reviewed, and tested like code.

## When to Document vs When Code is Self-Documenting

Not everything needs a comment. Well-named functions and clear types often speak for themselves. Document **why**, not **what**. Document public APIs, architectural decisions, non-obvious behavior, and setup instructions. Skip documenting trivial getters, obvious logic, or implementation details that change frequently.

## Steps

1. **Scan for undocumented public APIs.** Use Grep and Glob to find exported functions, classes, and types that lack JSDoc/TSDoc/docstring annotations. Prioritize public-facing interfaces over internal helpers.

2. **Check README accuracy.** Compare the README's install instructions, usage examples, and API references against the current code. Flag any drift — outdated commands, removed features, changed defaults.

3. **Generate or update API docs.** For TypeScript projects, use TypeDoc. For Python, use Sphinx or pdoc. Ensure every public symbol has a description, parameter docs, return type, and at least one example.

4. **Verify code examples still work.** Extract code blocks from documentation and confirm they compile/run against the current codebase. Broken examples erode trust faster than missing docs.

5. **Update architecture docs after changes.** When components are added, removed, or restructured, update ARCHITECTURE.md or equivalent. Include component diagrams, data flow descriptions, and key abstractions.

## Coverage Areas

- **JSDoc / TSDoc**: Use `@param`, `@returns`, `@throws`, `@example` tags consistently. Prefer inline `{@link}` references over plain text class names.
- **Python docstrings**: Follow Google or NumPy style consistently within a project. Include type hints in function signatures rather than duplicating in docstrings.
- **README best practices**: Lead with a one-line description, then badges, install, quick start, full API, contributing guide, and license. Keep the quick start under 5 lines of code.

## Principles

- Documentation is a product. Treat it with the same care as user-facing features.
- Stale docs are worse than no docs. If you cannot maintain it, delete it.
- Write for the reader who has zero context about your project.
