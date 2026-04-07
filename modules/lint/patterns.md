# Linting Patterns

## Tool Configuration

### ESLint + Prettier Conflict Resolution
- **Problem**: ESLint and Prettier disagree on formatting (semicolons, quotes, trailing commas)
- **Solution**: Use `eslint-config-prettier` to disable all ESLint rules that conflict with Prettier
- **Setup**: Add `"prettier"` as the last item in ESLint's `extends` array
- **Alternative**: Migrate to Biome, which handles both linting and formatting without conflicts

### Biome Migration from ESLint
- **When**: Team wants faster linting, simpler config, or unified lint + format
- **Steps**:
  1. Install Biome: `npm install --save-dev @biomejs/biome`
  2. Run `npx biome migrate eslint` to convert ESLint config
  3. Verify equivalent rules are enabled
  4. Remove ESLint and Prettier packages
  5. Update CI scripts and editor extensions
- **Gotcha**: Some ESLint plugins have no Biome equivalent yet

## Adoption Strategies

### Incremental Lint Adoption (lint-staged)
- **Problem**: Existing codebase has thousands of violations, cannot fix all at once
- **Solution**: Use `lint-staged` with `husky` to lint only staged files on commit
- **Setup**:
  ```json
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
  ```
- **Effect**: New code is always clean, old code is fixed gradually as files are touched

### Custom Rule Creation
- **When**: Project has domain-specific conventions not covered by existing rules
- **ESLint**: Write a custom plugin with AST visitors
- **Biome**: Use `biome.json` `overrides` for file-specific rules; custom rules not yet supported
- **Tip**: Before writing a custom rule, check if an existing plugin covers the case

## Ignore Patterns

### Ignore Patterns for Generated Code
- **Problem**: Generated files (GraphQL codegen, Prisma client, protobuf) fail lint rules
- **Solution**: Add to `.eslintignore` or Biome's `files.ignore`:
  - `src/generated/**`
  - `*.generated.ts`
  - `node_modules`
  - `dist`, `build`, `.next`
- **Rule**: Never lint files that developers do not manually edit
