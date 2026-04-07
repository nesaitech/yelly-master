# Sync Environment Variables Across Environments

## Context
Ensure all environments (development, staging, production) have consistent and correct environment variables.

## Steps

1. **Build the canonical list.** Start with `.env.example` as the source of truth. Every env var the application needs should be listed here.

2. **Collect current state from each environment.**

### Local Development
```bash
cat .env | grep -v '^#' | cut -d= -f1 | sort
```

### Vercel
```bash
vercel env ls production
vercel env ls preview
vercel env ls development
```

### Fly.io
```bash
fly secrets list
```

3. **Compare and find gaps.** Create a matrix:

| Variable | .env.example | Development | Staging | Production |
|----------|-------------|-------------|---------|------------|
| DB_URL   | yes         | yes         | yes     | yes        |
| API_KEY  | yes         | yes         | NO      | yes        |

4. **Fill the gaps.** For each missing variable:
   - Determine the correct value for that environment
   - Set it using the platform's CLI or dashboard
   - Verify the application works with the new value

5. **Validate values.** Check that:
   - URLs point to the correct environment (staging DB URL is not production)
   - API keys belong to the correct account/environment
   - Feature flags are set appropriately per environment

6. **Automate ongoing sync.** Set up a CI step that compares required vars against each environment and alerts on mismatches.

## Common Pitfalls
- Copying production values to staging (especially database URLs)
- Forgetting to add new env vars to all environments when adding a feature
- Platform-specific env var naming (some platforms prefix with `NEXT_PUBLIC_` automatically)
