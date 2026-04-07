# Common CI Issues and Patterns

## Build Cache Invalidation

- **Stale cache causing failures**: Lockfile changed but cache key did not update. Fix by keying cache on `hashFiles('**/package-lock.json')` or equivalent.
- **Cache too broad**: Caching entire `node_modules` when only a subset changed. Use granular cache keys.
- **Cross-branch cache pollution**: A cache from one branch breaks another. Use branch-scoped cache keys with fallback to main.

## Flaky Tests

- **Timing-dependent**: Tests that rely on `setTimeout`, `sleep`, or wall-clock time. Fix with deterministic waits or test clocks.
- **Order-dependent**: Test A leaves state that test B relies on. Fix by isolating test setup/teardown.
- **Resource contention**: Parallel tests hitting the same database or port. Fix with per-test isolation or unique resource allocation.
- **Network-dependent**: Tests calling external APIs. Fix with mocks, stubs, or recorded fixtures.

## Secret and Environment Variable Misconfiguration

- **Missing secrets in CI**: Secret not added to the platform's secret store. Manifests as empty string or undefined.
- **Wrong environment scope**: Secret set for production but not for PR builds. Check environment/scope settings.
- **Secret rotation**: Old secret still cached in CI. Clear caches and re-run.

## Docker Layer Caching

- **Layer invalidation cascade**: Changing an early layer (like `COPY package.json`) invalidates all subsequent layers. Order Dockerfile commands from least to most frequently changed.
- **BuildKit cache mount**: Use `--mount=type=cache` for package manager caches inside Docker builds.
- **Multi-platform builds**: Layer caches are architecture-specific. Use separate cache keys per platform.

## Dependency Version Conflicts

- **Lockfile drift**: `package-lock.json` not committed or out of sync with `package.json`. Always commit lockfiles.
- **Transitive dependency conflicts**: Two packages require incompatible versions of a shared dependency. Use `npm ls` to diagnose, `overrides` to resolve.
- **Registry unavailability**: npm/PyPI/Maven temporarily down. Add retry logic or use a private registry mirror.

## Parallel Job Coordination

- **Race conditions on shared artifacts**: Two jobs writing to the same artifact path. Use unique artifact names per job.
- **Fan-out/fan-in**: Run tests in parallel, then aggregate results. Use `needs:` in GitHub Actions or `dependencies:` in GitLab CI.
- **Resource limits**: Too many parallel jobs exhausting runner pool. Set concurrency limits or use job queues.
