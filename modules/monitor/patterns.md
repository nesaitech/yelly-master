# Monitoring Patterns

## Canary Deployment Monitoring

- **Traffic splitting**: Route 5-10% of traffic to the canary instance. Monitor error rates and latency independently for canary vs fleet.
- **Promotion criteria**: Canary runs clean for the observation window (typically 15-30 minutes). Error rate within 0.1% of fleet baseline.
- **Automatic rollback**: If canary error rate exceeds fleet by more than 1%, automatically pull the canary and alert.

## Error Rate Spike Detection

- **Absolute threshold**: Alert when errors per minute exceed a fixed number (e.g., 5 errors/min for low-traffic apps, 50/min for high-traffic).
- **Relative threshold**: Alert when error rate percentage doubles from the baseline.
- **New error types**: Alert immediately on error messages never seen before in production. These almost always indicate a deploy regression.
- **Error grouping**: Group errors by type and endpoint. A spike in one endpoint is more actionable than a generic count.

## Latency Regression Patterns

- **Gradual degradation**: Latency increases slowly over minutes. Often caused by memory leaks, connection pool exhaustion, or growing queue depth.
- **Step function increase**: Latency jumps and stays elevated. Typically caused by a new slow code path, missing database index, or changed query pattern.
- **Intermittent spikes**: Latency spikes periodically. Often caused by garbage collection pauses, cron jobs, or background task interference.

## Memory and CPU Threshold Alerts

- **Memory leak detection**: Memory usage steadily increasing without returning to baseline after request completion. Compare memory growth rate pre vs post deploy.
- **CPU saturation**: CPU usage consistently above 80%. New code may have introduced an expensive computation or infinite loop.
- **Alert thresholds**: Memory above 85% of available, CPU above 80% sustained for 2 minutes.

## Log Pattern Matching

- **Known bad patterns**: Match against a list of critical log patterns: `FATAL`, `OOM`, `connection refused`, `timeout`, `deadlock`.
- **Rate change detection**: A log message that previously appeared once per hour now appears once per second.
- **Structured logging**: Use JSON logs with consistent fields (level, service, endpoint, duration) for reliable pattern matching.
