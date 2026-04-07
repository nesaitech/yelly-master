# Onboarding Patterns

## Onboarding Document Structure

### 1. Overview
- Project name and one-line description
- What problem it solves and for whom
- Tech stack summary (language, framework, database, infra)

### 2. Setup
- Prerequisites (Node version, Python version, Docker, etc.)
- Clone and install steps
- Environment variables and secrets
- How to run locally
- How to run tests

### 3. Architecture
- Component diagram (text-based or linked image)
- Data flow from user input to response
- Key abstractions and interfaces
- Database schema overview (if applicable)

### 4. Workflows
- Feature development workflow (branch, code, test, PR, merge)
- Testing strategy (unit, integration, e2e)
- Deployment process
- How to debug common issues

### 5. FAQ
- "Where is X?" — common lookup questions
- "Why did we choose Y?" — architectural decision context
- "What's the deal with Z?" — known quirks and workarounds

## Key File Identification Heuristics

### Entry Points
- `src/index.ts`, `src/main.ts`, `app.py`, `main.go`, `src/lib.rs`
- Framework-specific: `pages/_app.tsx` (Next.js), `src/App.vue` (Vue)

### Configuration
- `package.json`, `tsconfig.json`, `pyproject.toml`, `Cargo.toml`
- CI: `.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile`
- Infra: `Dockerfile`, `docker-compose.yml`, `terraform/`

### Core Business Logic
- Files with the most imports from other modules
- Files that define the primary domain models/types
- Files that other developers modify most frequently (check `git log`)

### Test Strategy
- `test/`, `__tests__/`, `*_test.go`, `*.spec.ts`
- Test config: `vitest.config.ts`, `jest.config.js`, `pytest.ini`

## Architecture Diagram Patterns

### Component Diagram
```
[Client] --> [API Gateway] --> [Auth Service]
                           --> [User Service] --> [Database]
                           --> [Notification Service] --> [Queue]
```

### Data Flow Diagram
```
Request → Middleware (auth, logging) → Router → Controller → Service → Repository → DB
                                                                ↓
                                                            Response
```

### Module Dependency Diagram
```
  core/
   ├── used by → api/
   ├── used by → cli/
   └── used by → workers/
```

## Common Questions New Devs Ask

1. "How do I run this locally?" — always answer first
2. "Where is the main entry point?" — point to the exact file
3. "How are things organized?" — directory map with explanations
4. "How do I add a new feature?" — step-by-step workflow
5. "What should I read first?" — ordered list of 5-10 key files
6. "What are the testing expectations?" — coverage requirements, test types
7. "How does deployment work?" — from merge to production
8. "Who should I ask about X?" — ownership map if available
