# Canary Verification Steps

## Context
A new deployment is live on a canary instance. Verify it is healthy before promoting to full rollout.

## Step-by-Step Verification

1. **Health endpoint check.**
   ```bash
   curl -sf https://canary.example.com/api/health
   ```
   Expected: HTTP 200 with all components reporting healthy.

2. **Response time measurement.**
   ```bash
   curl -w "%{time_total}\n" -o /dev/null -sf https://canary.example.com/
   ```
   Expected: Response time within 50% of baseline. If baseline is 200ms, canary should respond under 300ms.

3. **Error log inspection.** Check application logs for the canary instance. Look for:
   - Unhandled exceptions
   - Database connection errors
   - New warning patterns

4. **Functional smoke test.** Hit 3-5 critical endpoints:
   - Homepage / main entry point
   - Authentication endpoint
   - Primary API endpoint
   - Static asset loading

5. **Comparison against fleet.** Compare canary metrics to the rest of the fleet:
   - Error rate: canary should not exceed fleet by more than 0.5%
   - Latency: canary p95 should be within 25% of fleet p95
   - Memory: canary memory usage should be within 20% of fleet average

6. **Decision point.**
   - All checks pass: Promote canary to full rollout
   - Any check fails: Hold promotion, investigate, and potentially rollback canary
   - Ambiguous results: Extend observation window by another 15 minutes

## Monitoring Duration
Observe for at least 15 minutes under real traffic before promoting. For high-risk changes, extend to 30 minutes.
