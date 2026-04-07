# Docker Patterns

## Multi-Stage Build Optimization

- **Separate build and runtime**: Build stage includes compilers, dev dependencies, and build tools. Runtime stage contains only the application binary/bundle and production dependencies.
- **Named stages**: Use `AS builder`, `AS tester`, `AS production` for clarity. Reference specific stages with `--from=builder`.
- **Intermediate caching**: Each stage has its own layer cache. A change in the runtime stage does not invalidate the build stage cache.
- **Testing stage**: Add a test stage between build and runtime that runs tests. Use `docker build --target=test` in CI.

## Layer Caching Best Practices

- **Dependency-first pattern**: Copy lockfiles, install dependencies, then copy source. Dependency installation is cached when only code changes.
- **Minimize layer count**: Combine related RUN commands with `&&`. Each RUN creates a new layer.
- **Clean up in the same layer**: Remove temp files in the same RUN command that creates them. `RUN apt-get install -y curl && rm -rf /var/lib/apt/lists/*`
- **BuildKit cache mounts**: Use `--mount=type=cache,target=/root/.npm` to persist package manager caches across builds.

## .dockerignore Essentials

Must ignore:
- `node_modules/` (rebuilt inside container)
- `.git/` (not needed in image)
- `.env` files (secrets should not be in images)
- `*.md` documentation files
- Test files and fixtures (unless needed for test stage)
- IDE configuration (`.vscode/`, `.idea/`)

## Health Check Patterns

- **HTTP health check**: `HEALTHCHECK CMD curl -f http://localhost:3000/health || exit 1`
- **TCP health check**: `HEALTHCHECK CMD nc -z localhost 3000 || exit 1`
- **Custom script**: `HEALTHCHECK CMD /app/healthcheck.sh`
- **Intervals**: Start with `--interval=30s --timeout=5s --retries=3 --start-period=10s`

## Docker Compose Networking

- **Default bridge network**: Services communicate by service name. `db` service is reachable at hostname `db`.
- **Custom networks**: Isolate groups of services. Frontend services on one network, backend on another.
- **Host networking**: Use `network_mode: host` only for specific use cases like monitoring tools.
- **Port mapping**: Map container ports to host ports with `ports: ["3000:3000"]`. Use `expose` for inter-container only.

## Volume Mount Strategies

- **Named volumes**: For persistent data (databases). `volumes: [db-data:/var/lib/postgresql/data]`
- **Bind mounts**: For development (live code reload). `volumes: [./src:/app/src]`
- **Anonymous volumes**: For ephemeral data. Avoid in production.
- **Read-only mounts**: For config files. `volumes: [./config:/app/config:ro]`
