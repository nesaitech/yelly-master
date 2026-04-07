# Incident Response When Monitoring Detects Issues

## Context
Monitoring has detected an anomaly post-deployment. Follow this runbook to respond effectively.

## Severity Assessment

**Critical** (act immediately):
- Health check returning non-200
- Error rate above 10x baseline
- Application completely unresponsive

**High** (act within 5 minutes):
- Error rate above 3x baseline
- Latency regression above 100%
- Memory usage above 90%

**Medium** (investigate within 15 minutes):
- New error types appearing at low rate
- Latency regression between 25-100%
- Elevated but stable error rate

## Response Steps

1. **Acknowledge.** Confirm the alert. Notify the team with a brief summary: what metric is abnormal, when it started, and severity level.

2. **Correlate with deploy.** Check if the anomaly started within the deploy window. If yes, the deploy is the likely cause. If the anomaly predates the deploy, investigate other causes.

3. **Assess impact.** How many users are affected? Is the issue intermittent or total? Is data integrity at risk?

4. **Decide: fix forward or rollback.**
   - If the fix is obvious and small (e.g., missing env var), fix forward.
   - If the cause is unclear or the fix is complex, rollback immediately.
   - When in doubt, rollback. You can always redeploy after fixing.

5. **Execute the decision.** Either apply the fix and monitor, or rollback using the documented rollback procedure.

6. **Verify resolution.** Confirm metrics return to baseline. Monitor for at least 15 minutes after resolution.

7. **Document.** Write a brief incident report: timeline, root cause, impact, resolution, and prevention measures.
