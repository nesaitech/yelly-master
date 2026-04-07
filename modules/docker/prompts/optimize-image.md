# Reduce Docker Image Size

## Context
The Docker image is too large, increasing build times, push times, and pull times. Optimize it.

## Diagnosis

1. **Check current image size.**
   ```bash
   docker images myapp
   ```

2. **Analyze layers.**
   ```bash
   docker history myapp:latest
   ```
   Identify the largest layers. Common culprits: build tools, dev dependencies, package manager caches.

## Optimization Steps

### 1. Use a Smaller Base Image
```dockerfile
# Before: 900MB+
FROM node:20

# After: ~120MB
FROM node:20-alpine
```

### 2. Multi-Stage Build
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
CMD ["node", "dist/index.js"]
```

### 3. Clean Up in Same Layer
```dockerfile
RUN apk add --no-cache curl && \
    curl -o file.tar.gz https://example.com/file.tar.gz && \
    tar xzf file.tar.gz && \
    rm file.tar.gz
```

### 4. Use .dockerignore
```
node_modules
.git
*.md
.env*
tests
coverage
.github
```

### 5. Production Dependencies Only
```dockerfile
RUN npm ci --omit=dev
```

## Targets
- Node.js app: under 200MB
- Go app: under 20MB (with scratch base)
- Python app: under 300MB (with slim base)
