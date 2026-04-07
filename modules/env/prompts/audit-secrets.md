# Audit Secrets in Codebase

## Context
Search the codebase for exposed secrets, hardcoded credentials, and sensitive data that should be in environment variables.

## Audit Steps

1. **Search for common secret patterns.**
   ```bash
   # API keys and tokens
   grep -rn "api[_-]key\|api[_-]token\|secret[_-]key" --include="*.{js,ts,py,rb,go}" .
   
   # Hardcoded passwords
   grep -rn "password\s*=\s*[\"']" --include="*.{js,ts,py,rb,go}" .
   
   # Connection strings with credentials
   grep -rn "://.*:.*@" --include="*.{js,ts,py,yml,yaml,json}" .
   ```

2. **Check for .env files in git.**
   ```bash
   git ls-files | grep -i '\.env'
   ```
   Only `.env.example` and `.env.test` (with no real secrets) should be tracked.

3. **Search git history for leaked secrets.**
   ```bash
   git log --all --diff-filter=A --name-only | grep -i env
   ```

4. **Check .gitignore coverage.**
   Verify these patterns are in `.gitignore`:
   - `.env`
   - `.env.local`
   - `.env.production`
   - `.env.*.local`

5. **Scan for high-entropy strings.** Look for long random strings that may be API keys or tokens. Common lengths: 32, 40, 64 characters of alphanumeric text.

## What to Do When Secrets Are Found

1. **Rotate the secret immediately.** Assume it has been compromised.
2. **Remove from code.** Replace with `process.env.SECRET_NAME`.
3. **Add to environment.** Set the value in all relevant environments.
4. **Update .env.example.** Add the variable name (not value) with a description comment.
5. **If in git history**, use BFG Repo-Cleaner to remove from all commits.
