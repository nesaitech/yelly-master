# Safe Rollback Procedure

## Context
A production deployment has caused issues. You need to rollback safely and quickly.

## Immediate Actions

1. **Confirm the issue.** Verify the problem is caused by the deployment, not an external factor. Check error logs, metrics, and user reports.

2. **Communicate.** Notify the team that a rollback is in progress. Include what was deployed and what symptoms were observed.

3. **Rollback the application.**

### Vercel
```bash
vercel rollback
```

### Fly.io
```bash
# List recent releases
fly releases
# Deploy the previous working image
fly deploy --image registry.fly.io/app:previous-sha
```

### Docker / AWS
```bash
# Tag the previous working image as current
docker tag myapp:previous-sha myapp:latest
docker push myapp:latest
# Trigger deployment of the latest tag
```

4. **Handle database migrations.** If a migration ran as part of the deploy:
   - Check if the migration is backward-compatible. If yes, no DB rollback needed.
   - If not backward-compatible, run the down migration before or alongside the code rollback.
   - Never drop data in a rollback migration. Use soft deletes.

5. **Verify the rollback.** Hit the health endpoint. Run smoke tests. Check that error rates return to pre-deploy levels.

6. **Post-mortem.** Document what went wrong, why it was not caught in staging, and what process improvements will prevent recurrence.

## Key Principle
Speed matters during rollback. Have the rollback commands ready before every deploy. Practice rollbacks in staging regularly.
