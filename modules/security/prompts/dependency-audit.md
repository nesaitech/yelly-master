# Dependency Audit Prompt

You are running a security audit on project dependencies. Follow this process.

## Step 1: Run the Audit
- For npm: `npm audit` (or `npm audit --json` for machine-readable output)
- For yarn: `yarn audit`
- For pip: `pip audit` or `safety check`

## Step 2: Triage by Severity
- **Critical**: Actively exploited or trivially exploitable. Fix immediately.
- **High**: Exploitable with moderate effort. Fix within 24 hours.
- **Medium**: Requires specific conditions. Schedule fix within a week.
- **Low**: Theoretical risk. Fix when convenient.

## Step 3: Resolve Findings
- Try `npm audit fix` for automatic patches
- If a patch is not available, check for alternative packages
- If the vulnerability is in a transitive dependency, check if the direct dependency has an update
- As a last resort, use `overrides` (npm) or `resolutions` (yarn) to force a version

## Step 4: Document Exceptions
- If a vulnerability cannot be fixed, document why
- Note the CVE, affected package, and your mitigation
- Set a reminder to re-check in 30 days
