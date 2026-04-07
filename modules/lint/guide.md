# Code Standards Enforcement

A practical approach to maintaining consistent code quality through automated linting and formatting. The goal is to catch style issues and potential bugs automatically so code reviews can focus on logic and architecture.

## Workflow

1. **Detect the project linter.** Check for configuration files in order of preference: `biome.json` (Biome), `.eslintrc.*` or `eslint.config.js` (ESLint), `.prettierrc.*` (Prettier), `ruff.toml` or `pyproject.toml` (Ruff for Python). Use whatever the project already has configured. Do not switch linters without team agreement.

2. **Understand the existing configuration.** Read the linter config file to understand which rules are enabled, which are warnings vs errors, and what plugins are in use. Respect the project's established conventions — do not add or change rules without discussion.

3. **Run the linter on the target files.** Execute the linter with the project's configuration. For a full codebase check: `npx eslint .` or `npx biome check .`. For specific files: pass the file paths directly. Note the distinction between lint errors (code quality) and formatting issues (style).

4. **Auto-fix what is possible.** Most linters support auto-fix: `npx eslint --fix .` or `npx biome check --fix .`. Run auto-fix first to handle trivial issues (missing semicolons, import ordering, trailing whitespace). Review the changes to ensure auto-fix did not alter behavior.

5. **Manually fix remaining issues.** For errors that cannot be auto-fixed, address each one individually. Common manual fixes: unused variables (remove or use them), missing return types, unsafe type assertions. If a rule is consistently wrong for the codebase, consider disabling it in config rather than adding inline suppressions everywhere.

6. **Handle legacy code incrementally.** For projects with many existing violations, do not fix everything at once. Use lint-staged to enforce rules only on changed files. Gradually reduce the violation count over time. Track progress with a lint-violations metric.

7. **Distinguish formatting from linting.** Formatting (Prettier, Biome format) handles whitespace, line breaks, and brackets. Linting (ESLint, Biome lint) handles code quality rules. Keep them separate or use a tool that handles both (Biome). Resolve conflicts between formatters and linters by disabling overlapping rules.

8. **Verify clean output.** Run the linter one final time to confirm zero errors. Commit the fixes. If using CI, verify the lint check passes in the pipeline.
