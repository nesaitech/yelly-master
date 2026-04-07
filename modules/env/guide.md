# Environment Variable Management

A guide for auditing, managing, and securing environment variables across development, staging, and production environments.

## Steps

1. **Audit current environment variables.** List all env vars used by the application. Check `.env` files, platform dashboards (Vercel, Fly.io, AWS), and CI/CD secrets. Create a complete inventory. For each variable, document: name, purpose, which environments need it, and whether it contains a secret.

2. **Detect missing or unused variables.** Search the codebase for `process.env.`, `os.environ`, or equivalent patterns. Cross-reference against the actual env vars set in each environment. Missing vars cause runtime crashes. Unused vars are clutter and potential security exposure. Remove any that are no longer referenced in code.

3. **Sync across environments.** Ensure all environments have the required variables set. Use `.env.example` as the canonical list of required variables (without secret values). Platform-specific tools help: `vercel env pull`, `fly secrets list`, `aws ssm get-parameters-by-path`. Flag any variable present in production but missing from staging or development.

4. **Validate .env files.** Check that `.env` files are listed in `.gitignore`. Verify `.env.example` exists and is up to date. Validate that variable values match expected formats (URLs should be valid URLs, ports should be numbers, booleans should be true/false).

5. **Check for secrets in code.** Search for hardcoded secrets: API keys, database credentials, tokens, and passwords. Common patterns to search for: long alphanumeric strings in quotes, `Bearer` tokens, connection strings with passwords. Use tools like `git log --all -p | grep` for historical leaks.

6. **Manage secret rotation.** Secrets should be rotated periodically: API keys every 90 days, database passwords every 60 days. Document the rotation procedure for each secret. After rotation, update all environments and verify the application still works.

## Platform-Specific Management

- **Vercel**: `vercel env ls`, `vercel env add`, `vercel env pull`
- **Fly.io**: `fly secrets list`, `fly secrets set KEY=value`
- **AWS**: SSM Parameter Store or Secrets Manager
- **Heroku**: `heroku config`

## Best Practices

- Never commit `.env` files containing real secrets
- Always maintain an up-to-date `.env.example`
- Use descriptive variable names with consistent prefixes (e.g., `DB_`, `API_`, `SMTP_`)
- Validate required env vars at application startup, fail fast if missing
