# Common Environment Variable Patterns

## Missing Env Var Causing Runtime Crash

- **Symptom**: Application starts then crashes with `undefined` or `KeyError` when accessing an env var.
- **Diagnosis**: Check the error message for the variable name. Verify it is set in the current environment.
- **Fix**: Add the variable to the environment. Add startup validation to catch this earlier.
- **Prevention**: Validate all required env vars at startup. Use a library like `envalid` (Node.js) or `pydantic` settings (Python).

## Secrets Committed to Git

- **Symptom**: Sensitive values visible in git history, even if the file was later deleted.
- **Detection**: Search git history: `git log --all -p --diff-filter=A -- '*.env'`. Use tools like `trufflehog` or `gitleaks`.
- **Remediation**: Rotate the exposed secret immediately. Use `git filter-branch` or `BFG Repo-Cleaner` to remove from history. Force push (with team coordination).
- **Prevention**: Add `.env` to `.gitignore` before the first commit. Use pre-commit hooks to detect secrets.

## Dev/Staging/Prod Environment Mismatch

- **Symptom**: Feature works in development but fails in staging or production.
- **Diagnosis**: Compare env vars across environments. Look for missing vars, different values, or wrong URLs.
- **Common culprits**: Database URL pointing to wrong host, API keys for wrong environment, feature flags with different values.
- **Fix**: Maintain a comparison matrix of all env vars across environments. Automate mismatch detection.

## Environment Variable Naming Conventions

- **Prefix by service**: `DB_HOST`, `DB_PORT`, `REDIS_URL`, `SMTP_HOST`
- **Boolean conventions**: Use `true`/`false` strings. Avoid `0`/`1` or `yes`/`no` for clarity.
- **URL conventions**: Use `_URL` suffix for full URLs, `_HOST` and `_PORT` for components.
- **Secret conventions**: Use `_SECRET`, `_KEY`, or `_TOKEN` suffix to clearly identify sensitive values.

## Secret Rotation Procedures

- **API keys**: Generate new key, update all environments, verify functionality, revoke old key.
- **Database passwords**: Create new credentials, update connection strings in all environments, verify connections, drop old credentials.
- **JWT secrets**: Generate new secret, deploy with support for both old and new (for in-flight tokens), wait for old tokens to expire, remove old secret.
- **Rotation schedule**: Document rotation frequency per secret. Set calendar reminders. Automate where possible.
