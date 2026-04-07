# Biome Migration Prompt

You are migrating a project from ESLint (and optionally Prettier) to Biome. Follow this process.

## Step 1: Audit Current Setup
- Read the ESLint config (`.eslintrc.*` or `eslint.config.js`)
- List all plugins and custom rules in use
- Read the Prettier config if it exists
- Note any rules that are project-specific or non-standard

## Step 2: Install Biome
```bash
npm install --save-dev @biomejs/biome
npx biome init
```

## Step 3: Migrate Configuration
```bash
npx biome migrate eslint
```
- Review the generated `biome.json`
- Verify formatter settings match Prettier config (tab width, quotes, semicolons)
- Check that equivalent lint rules are enabled
- Note any ESLint rules that have no Biome equivalent

## Step 4: Test the Migration
- Run `npx biome check .` and compare output to `npx eslint .`
- Fix any new errors introduced by different rule interpretations
- Run `npx biome format --write .` and review formatting changes

## Step 5: Clean Up
- Remove ESLint packages: `npm uninstall eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier ...`
- Remove Prettier packages: `npm uninstall prettier`
- Delete `.eslintrc.*`, `.prettierrc.*`, `.eslintignore`, `.prettierignore`
- Update `package.json` scripts: replace `eslint` and `prettier` commands with `biome`
- Update CI pipeline configuration
- Update editor settings (VS Code: install Biome extension, remove ESLint/Prettier extensions)

## Step 6: Verify
- Run `npx biome check .` — should pass cleanly
- Run the test suite — no behavior changes expected
- Verify CI passes with the new linter
