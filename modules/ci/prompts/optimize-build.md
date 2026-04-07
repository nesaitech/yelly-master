# Optimize CI Build Times

## Context
CI builds are taking too long. Your goal is to identify bottlenecks and reduce total build time.

## Diagnosis

1. **Measure current state.** Note total pipeline time and per-step duration. Identify the slowest steps.

2. **Check for low-hanging fruit:**
   - Is dependency installation slow? Add caching.
   - Are tests running sequentially? Parallelize them.
   - Is Docker building from scratch every time? Add layer caching.
   - Are unnecessary steps running? Skip lint on docs-only changes.

## Optimization Strategies

### Caching
```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      node_modules
    key: deps-${{ hashFiles('**/package-lock.json') }}
    restore-keys: deps-
```

### Parallel Jobs
Split test suites across multiple jobs using matrix strategy:
```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: npm test -- --shard=${{ matrix.shard }}/4
```

### Conditional Execution
Skip irrelevant jobs based on changed files:
```yaml
on:
  push:
    paths:
      - 'src/**'
      - 'tests/**'
```

### Docker Optimization
- Use multi-stage builds
- Order COPY commands from least to most changing
- Use BuildKit inline cache: `DOCKER_BUILDKIT=1 docker build --cache-from=...`

## Targets
- Dependency install: under 30 seconds with warm cache
- Test suite: under 5 minutes with parallelization
- Docker build: under 2 minutes with layer caching
- Total pipeline: under 10 minutes for typical PR
