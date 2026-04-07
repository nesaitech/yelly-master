# Safely Extracting a Module from a Large File

Use this prompt when a file has grown too large (300+ lines) or contains multiple unrelated concerns that should be separated.

## Steps

1. **Read the entire file.** Understand all the functions, classes, and exports it contains. List them.

2. **Identify cohesive groups.** Which functions call each other? Which share the same imports? Group them by responsibility. Each group will become a module.

3. **Check for circular dependencies.** If group A calls functions from group B and vice versa, you may need a third shared module. Plan this before moving code.

4. **Run tests.** Confirm all tests pass before you start: `npm test`.

5. **Create the new file.** Copy (do not cut) the first group of functions into the new file. Add the necessary imports.

6. **Export from the new file.** Export the same symbols that were exported from the original file.

7. **Update the original file.** Replace the moved code with an import from the new file. If the original file re-exports for backward compatibility, add re-exports:
   ```typescript
   // Re-export for backward compatibility
   export { validateOrder, sanitizeInput } from './validation';
   ```

8. **Update all importers.** Use `Grep` to find every file that imports from the original file. Update imports to point to the new file if they only use the extracted symbols.

9. **Run tests again.** All tests must pass. If they fail, revert and try a smaller extraction.

10. **Commit.** One commit per extracted module. Clear commit message: "refactor: extract validation logic from orders.ts into validation.ts".

## Pitfalls

- Do not change any function signatures during extraction.
- Do not rename anything during extraction — that is a separate refactoring step.
- Watch for file-scoped variables (module-level state) that the extracted functions depend on. These may need to be passed as parameters or moved together.
