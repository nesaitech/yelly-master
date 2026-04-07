# API Documentation Generation

Generate comprehensive API documentation from source code annotations and type definitions.

## Process

1. **Discover public APIs.** Scan for exported functions, classes, types, and interfaces. Use Glob to find source files and Grep to identify exports.

2. **Check existing annotations.** For each public symbol, check whether JSDoc/TSDoc/docstring exists. Flag symbols that are missing documentation.

3. **Generate documentation for unannotated symbols.** Read the implementation to understand:
   - What the function does (purpose)
   - What each parameter means and its constraints
   - What it returns and under what conditions
   - What errors it can throw
   - A usage example

4. **Format consistently.** Use the project's existing documentation style. If no style exists, default to:
   - TypeScript: TSDoc with `@param`, `@returns`, `@throws`, `@example`
   - Python: Google-style docstrings
   - Go: Standard godoc comment format

5. **Generate API reference page.** Compile all public symbols into a single reference document organized by module. Include a table of contents.

## Quality Checks

- Every public function has at least a one-line description
- Every parameter is documented with type and purpose
- Return values are documented
- At least one example per major function
- Cross-references use `{@link}` or equivalent
- No documentation references removed or renamed symbols
