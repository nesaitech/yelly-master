# Containerization with Docker

A practical guide for writing, optimizing, and managing Docker containers for application deployment.

## Steps

1. **Write the Dockerfile.** Start with an official base image appropriate for your language. Use specific version tags, not `latest`. For Node.js, prefer Alpine variants (`node:20-alpine`) for smaller images. For Python, use slim variants (`python:3.12-slim`). For Go, use a multi-stage build with `scratch` or `distroless` as the final stage.

2. **Implement multi-stage builds.** Use separate stages for building and running. The build stage installs dev dependencies and compiles code. The runtime stage copies only the build output and production dependencies. This dramatically reduces final image size.

   ```dockerfile
   # Build stage
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   # Runtime stage
   FROM node:20-alpine
   WORKDIR /app
   COPY --from=builder /app/dist ./dist
   COPY --from=builder /app/node_modules ./node_modules
   CMD ["node", "dist/index.js"]
   ```

3. **Optimize layer caching.** Order Dockerfile instructions from least to most frequently changing. Copy dependency manifests first, install dependencies, then copy source code. This way, dependency installation is cached when only source code changes.

4. **Set up docker-compose.** For local development, use docker-compose to orchestrate the application with its dependencies (database, cache, message queue). Define services, networks, and volumes. Use environment files for configuration.

5. **Security hardening.** Run the application as a non-root user. Do not include secrets in the image. Scan images for vulnerabilities with `docker scout` or `trivy`. Keep base images updated. Minimize installed packages.

6. **Add health checks.** Define a HEALTHCHECK instruction in the Dockerfile so orchestrators know when the container is ready to serve traffic.

   ```dockerfile
   HEALTHCHECK --interval=30s --timeout=3s \
     CMD curl -f http://localhost:3000/api/health || exit 1
   ```

## Image Size Optimization

- Use Alpine or distroless base images
- Multi-stage builds to exclude build tools
- Remove package manager caches: `rm -rf /var/cache/apk/*`
- Use `.dockerignore` to exclude unnecessary files from build context

## Best Practices by Language

- **Node.js**: Use `npm ci` not `npm install`. Copy `package*.json` before source. Set `NODE_ENV=production`.
- **Python**: Use `pip install --no-cache-dir`. Copy `requirements.txt` before source. Use virtual environments.
- **Go**: Build statically with `CGO_ENABLED=0`. Use `scratch` as final image. Binary-only final stage.
