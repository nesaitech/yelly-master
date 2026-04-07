# Common Deployment Patterns

## Zero-Downtime Deployment

- **Rolling update**: Replace instances one at a time. Each new instance must pass health checks before the next is replaced. Requires at least 2 instances.
- **Blue-green swap**: Run two identical environments. Deploy to the inactive one, verify, then swap the router. Instant rollback by swapping back.
- **Graceful shutdown**: Handle SIGTERM by stopping new request acceptance, completing in-flight requests, then exiting. Set appropriate drain timeouts.

## Database Migration + Deploy Coordination

- **Expand-contract pattern**: First deploy code that handles both old and new schema. Then run the migration. Then deploy code that only handles the new schema. Never deploy breaking schema changes in a single step.
- **Backward-compatible migrations**: Add columns as nullable, add new tables freely, never rename or drop columns in the same deploy as code changes.
- **Migration verification**: Run migrations on a staging database clone first. Check query performance on the new schema.

## Environment-Specific Configs

- **Config hierarchy**: Base config < environment overlay < runtime secrets. Never hardcode environment-specific values.
- **Feature flags**: Use feature flags to decouple deployment from release. Deploy code behind a flag, enable in staging, verify, then enable in production.
- **Config drift detection**: Regularly compare staging and production configs. Alert on unexpected differences.

## Rollback Triggers

- **Error rate spike**: If 5xx error rate exceeds 1% of total requests, trigger rollback.
- **Latency regression**: If p95 latency increases by more than 50% from baseline, investigate and potentially rollback.
- **Health check failure**: If the health endpoint returns non-200 for more than 3 consecutive checks, trigger automatic rollback.
- **Memory/CPU spike**: If resource usage jumps significantly post-deploy, the new code may have a leak or inefficiency.

## Health Check Patterns

- **Shallow health**: Returns 200 if the process is running. Fast, but does not catch dependency issues.
- **Deep health**: Checks database connectivity, cache availability, and external service reachability. Slower, but catches more issues.
- **Readiness vs liveness**: Readiness indicates the instance can serve traffic. Liveness indicates the process has not deadlocked. Use both in Kubernetes-style orchestrators.
