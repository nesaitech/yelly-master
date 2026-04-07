# Docker Compose Development Setup

## Context
Set up docker-compose for local development with live reload and service dependencies.

## Basic Structure

```yaml
version: "3.8"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    ports:
      - "3000:3000"
    volumes:
      - ./src:/app/src
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgres://user:pass@db:5432/myapp
      - REDIS_URL=redis://cache:6379
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: myapp
    volumes:
      - db-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 5s
      timeout: 3s
      retries: 5

  cache:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  db-data:
```

## Key Patterns

### Live Reload
Mount source code as a bind mount. Use `nodemon`, `watchexec`, or framework-specific dev servers. Exclude `node_modules` with an anonymous volume to avoid overwriting container dependencies.

### Health Checks and Startup Order
Use `depends_on` with `condition: service_healthy` to ensure databases are ready before the app starts. Define health checks for stateful services.

### Environment Variables
Use `environment:` for non-sensitive dev values. Use `env_file:` for larger sets. Never put production secrets in docker-compose files.

### Useful Commands
```bash
docker compose up -d          # Start all services
docker compose logs -f app    # Follow app logs
docker compose exec app sh    # Shell into app container
docker compose down -v        # Stop and remove volumes
```
