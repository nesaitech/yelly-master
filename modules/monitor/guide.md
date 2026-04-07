# Post-Deploy Monitoring

A guide for monitoring applications after deployment to catch issues early and decide when to rollback.

## Steps

1. **Set up canary checks.** Immediately after deployment, begin polling the health endpoint at a regular interval (every 30 seconds is a good default). Compare each response against the expected status code and response body. Log any deviations.

2. **Watch for console errors.** If browser-based monitoring is available, load key pages and capture JavaScript console errors. New errors that did not exist before the deploy are strong signals of a regression. Track both error count and unique error messages.

3. **Track response times.** Measure response latency for critical endpoints. Establish a baseline from pre-deploy metrics. Alert if p50 increases by more than 25% or p95 increases by more than 50%. Latency regressions often indicate N+1 queries, missing indexes, or inefficient new code paths.

4. **Compare against baseline.** Every monitoring check should compare current metrics against the pre-deploy baseline. Baselines should include: error rate, response time percentiles, memory usage, CPU usage, and request throughput. Store baselines so they can be referenced during the monitoring window.

5. **Alert on anomalies.** Define clear thresholds for alerting. An error rate above 5 errors per minute, latency above 2000ms, or health check failure should trigger immediate investigation. Alerts should include context: which endpoint, what the error was, and when it started.

6. **Decide when to rollback.** Automatic rollback should trigger when: health check fails 3 consecutive times, error rate exceeds threshold for more than 2 minutes, or latency regression persists for more than 5 minutes. Manual investigation is appropriate for ambiguous signals.

## Health Endpoints

A good health endpoint checks:
- Application process is running
- Database connection is alive
- Cache (Redis/Memcached) is reachable
- Critical external services respond

Return a structured JSON response with individual component statuses.

## Log Monitoring

Monitor application logs for:
- Unhandled exceptions and promise rejections
- Database connection errors
- Timeout errors
- Authentication failures spike
- New error patterns not seen before the deploy

## Performance Regression Detection

Compare pre-deploy and post-deploy metrics over equivalent time windows. Account for natural traffic variation (e.g., higher load during business hours). Use statistical significance rather than raw numbers when traffic volume is low.
