# Safely Renaming a Symbol Across the Codebase

Use this prompt when a function, variable, class, or type has a misleading or unclear name that should be changed for readability.

## Steps

1. **Identify the symbol and its new name.** Be specific: "Rename `proc` to `processPayment` in `src/payments.ts`."

2. **Find all usages.** Use Grep to locate every reference:
   ```
   Grep: pattern="proc" (or the exact symbol name)
   ```
   Check for: direct calls, imports, re-exports, string references (e.g., in tests or configs), and documentation.

3. **Check for conflicts.** Make sure the new name does not already exist in any scope where it will be used. Search for the new name too.

4. **Run tests.** Confirm all tests pass before starting: `npm test`.

5. **Rename in the source file.** Change the declaration (function name, variable name, class name) in the file where it is defined.

6. **Update the export.** If the symbol is exported, update the export statement.

7. **Update all importers.** For each file that imports the symbol:
   - Update the import statement.
   - Update all usages within the file.
   - If the file re-exports the symbol, update the re-export.

8. **Update tests.** Rename references in test files. Update test descriptions if they mention the old name.

9. **Update string references.** Check for the old name in:
   - Configuration files (YAML, JSON).
   - Documentation and comments.
   - Error messages and log statements.
   - Route definitions or API paths (if the symbol name appears in URLs).

10. **Run tests again.** All tests must pass.

11. **Commit.** One commit for the rename: "refactor: rename proc to processPayment for clarity".

## Tips

- Use `replace_all` in the Edit tool for bulk replacements within a single file.
- If the symbol is used in 20+ files, consider whether an intermediate step (re-exporting old name as an alias) would be safer.
- Never rename and change behavior in the same commit.
