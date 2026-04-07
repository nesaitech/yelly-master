# Fix GitHub Actions Failure

## Context
A GitHub Actions workflow has failed. Your job is to diagnose the root cause and apply a fix.

## Steps

1. **Read the workflow file.** Find it in `.github/workflows/`. Understand the trigger, jobs, and steps.

2. **Check the error log.** Look at the failed step output. Common patterns:
   - `Error: Process completed with exit code 1` — a command failed
   - `Error: .github/workflows/ci.yml: ...` — YAML syntax error
   - `Run actions/setup-node@v4` failing — action version or input issue

3. **Classify the failure:**
   - **Syntax error**: Validate YAML indentation and structure
   - **Missing secret**: Check if the required secret exists in repo settings
   - **Dependency failure**: Check lockfile, caching, and registry availability
   - **Test failure**: Determine if flaky or legitimate
   - **Permission error**: Check `permissions:` block in workflow

4. **Apply the fix.** Edit the workflow file or source code as needed. Common fixes:
   - Pin action versions: `uses: actions/checkout@v4` not `@main`
   - Add missing `permissions:` block for GITHUB_TOKEN
   - Fix caching key to include lockfile hash
   - Add `continue-on-error: true` for non-critical steps

5. **Verify.** Push the fix and monitor the next run. If the fix involves flaky tests, check at least 2-3 runs.

## Example Fix

```yaml
# Before: cache key doesn't include lockfile
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: npm-cache

# After: cache key includes lockfile hash
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: npm-${{ hashFiles('**/package-lock.json') }}
    restore-keys: npm-
```
