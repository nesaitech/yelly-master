# CI/CD Pipeline Management

A practical guide for diagnosing, fixing, and optimizing continuous integration and deployment pipelines across GitHub Actions, GitLab CI, and Jenkins.

## Steps

1. **Identify the failure point.** Start by reading the CI logs from the bottom up. The root cause is usually near the first error, not the last. Look for exit codes, failed commands, and timeout messages. On GitHub Actions, expand the failing step and check the raw log output.

2. **Diagnose build failures.** Classify the failure: is it a compilation error, test failure, dependency issue, or infrastructure problem? Compilation errors point to code changes. Test failures may be flaky or legitimate. Dependency issues often involve lockfile mismatches or registry timeouts. Infrastructure problems include runner out-of-memory or disk space errors.

3. **Fix pipeline configuration.** For GitHub Actions, validate workflow YAML syntax and ensure correct `runs-on` labels. For GitLab CI, check stage ordering and `needs`/`dependencies` declarations. For Jenkins, verify Jenkinsfile pipeline blocks and agent labels. Always test config changes on a branch before merging to main.

4. **Handle flaky tests.** Flaky tests erode trust in CI. Identify them by checking if the same test passes on retry without code changes. Common causes: timing-dependent assertions, shared mutable state, order-dependent tests, and external service calls without mocks. Quarantine flaky tests, fix them, then re-enable.

5. **Optimize build times.** Enable dependency caching (npm cache, pip cache, Docker layer cache). Use parallel job execution where possible. Split large test suites across multiple runners. Avoid redundant steps like installing dev dependencies for production builds.

6. **Set up new pipelines.** Start minimal: lint, test, build. Add complexity incrementally. Use matrix builds for multi-version testing. Pin action versions to SHAs for security. Store secrets in the platform's secret manager, never in code.

## Reading CI Logs

- Scroll to the first red line or error keyword
- Check the exit code of failed commands
- Look for `ENOMEM`, `ENOSPC`, or timeout indicators
- Compare against the last successful run's log

## Caching Strategies

- Cache `node_modules` keyed on lockfile hash
- Cache Docker layers with `--cache-from`
- Use GitLab CI `cache:` with `key: files` for automatic invalidation
- Set `restore-keys` fallbacks in GitHub Actions for partial cache hits
