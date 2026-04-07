# ESLint Error Fixes Prompt

You are fixing ESLint errors in the codebase. Follow this systematic approach.

## Common Errors and Fixes

### `no-unused-vars`
- If the variable is truly unused, remove it
- If it is a function parameter required by an interface, prefix with underscore: `_unused`
- If it is a destructured property you need to skip, use rest: `const { unused, ...rest } = obj`

### `@typescript-eslint/no-explicit-any`
- Replace `any` with the actual type if known
- Use `unknown` and add type narrowing if the type varies
- Use generics if the function should work with multiple types

### `react-hooks/exhaustive-deps`
- Add the missing dependency to the array
- If adding it causes infinite loops, restructure (move the function inside useEffect, or use useCallback)
- Only suppress with `// eslint-disable-next-line` as a last resort, with a comment explaining why

### `no-console`
- Replace `console.log` with a proper logger
- If it is intentional debugging, use `console.debug` and configure the rule to allow it
- Remove accidental console.log statements from production code

### `import/order`
- Run auto-fix: `npx eslint --fix --rule 'import/order: error'`
- Group: builtin, external, internal, parent, sibling, index

## Process
1. Run `npx eslint . --format compact` to get a flat list of errors
2. Group errors by rule name
3. Auto-fix what is possible: `npx eslint --fix .`
4. Manually fix remaining errors, starting with the most common rule
5. Re-run lint to verify zero errors
