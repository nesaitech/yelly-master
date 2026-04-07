# Secrets Scan Prompt

You are scanning the codebase and git history for exposed secrets. Follow this process.

## Step 1: Scan Current Source
Search for common secret patterns in the working tree:
```bash
grep -rn "API_KEY\|SECRET\|PASSWORD\|TOKEN\|PRIVATE_KEY" --include='*.ts' --include='*.js' --include='*.py' --include='*.env' .
```

Look for patterns that suggest real credentials:
- Strings starting with `sk-`, `pk-`, `ghp_`, `xoxb-`, `AKIA`
- Base64-encoded strings longer than 40 characters
- `.env` files committed to version control

## Step 2: Scan Git History
Check if secrets were committed and later removed:
```bash
git log --all --diff-filter=D -- "*.env"
git log -p --all -S "API_KEY" -- "*.ts" "*.js"
```

## Step 3: Check .gitignore
Verify that sensitive files are ignored:
- `.env`, `.env.local`, `.env.production`
- `credentials.json`, `serviceAccountKey.json`
- `*.pem`, `*.key`

## Step 4: Remediate
- Rotate any exposed credentials immediately
- Remove secrets from git history using `git filter-branch` or BFG Repo-Cleaner
- Move secrets to environment variables or a secret manager
- Add patterns to `.gitignore` to prevent future commits

## Step 5: Report
For each finding, document:
- File path and line number
- Type of secret (API key, password, token)
- Whether it appears to be a real credential or a placeholder
- Recommended action
