# Plan Module — Architecture Patterns

A reference of common architecture patterns and when to use them.

---

## Layered Architecture

Organize code into horizontal layers: presentation, business logic, data access.

**When to use:** Most server-side applications. Clear separation of concerns. Easy to test each layer independently.

**Structure:**
```
src/
  routes/        # HTTP handlers (presentation)
  services/      # Business logic
  repositories/  # Data access
  models/        # Type definitions
```

**Rule:** Each layer only depends on the layer below it. Routes call services, services call repositories. Never skip layers.

---

## Event-Driven Architecture

Components communicate by emitting and listening to events instead of direct function calls.

**When to use:** When you need decoupling between modules, when actions trigger multiple side effects, or when you want to add new behaviors without modifying existing code.

**Trade-offs:** Harder to trace execution flow. Debugging requires following event chains. Use structured logging with correlation IDs.

---

## Microservices vs Monolith

**Start with a monolith** unless you have a specific, proven need for microservices.

| Factor | Monolith | Microservices |
|--------|----------|---------------|
| Team size | < 10 engineers | 10+ engineers |
| Deploy frequency | Whole app | Independent services |
| Complexity | In the code | In the infrastructure |
| Debugging | Stack traces | Distributed tracing |
| Data consistency | Transactions | Eventual consistency |

**Decision:** If you are asking "should we use microservices?", the answer is almost always "not yet."

---

## API Design Patterns

### REST
- Use nouns for resources: `/users`, `/orders`.
- Use HTTP methods: GET (read), POST (create), PUT (replace), PATCH (update), DELETE.
- Return appropriate status codes: 200, 201, 400, 401, 403, 404, 500.
- Version your API: `/api/v1/users`.

### GraphQL
- Use when clients need flexible queries (mobile vs web need different data).
- Use when you have many relationships between entities.
- Avoid for simple CRUD with few clients.

### tRPC
- Use in full-stack TypeScript projects where client and server share a codebase.
- End-to-end type safety without code generation.
- Not suitable for public APIs consumed by non-TypeScript clients.

---

## State Management

| Approach | When to use |
|----------|------------|
| Local component state | UI-only state (form inputs, toggles) |
| Context / Provider | Shared state accessed by many components (theme, auth) |
| Server state (React Query, SWR) | Data fetched from APIs — cache, revalidate, sync |
| Global store (Zustand, Redux) | Complex client state with many interactions |

**Rule:** Use the simplest approach that works. Most "state management" problems are actually "server cache" problems solved by React Query or SWR.

---

## Caching Strategies

- **Cache-aside:** Application checks cache first, loads from source on miss, writes to cache. Most common pattern.
- **Write-through:** Application writes to cache and source simultaneously. Ensures consistency.
- **TTL-based:** Cache entries expire after a time. Simple but can serve stale data.
- **Tag-based invalidation:** Invalidate cache entries by tag when underlying data changes. More precise than TTL.

**Rule:** Cache at the highest level possible (CDN > server cache > database cache). Invalidation is the hard part — design for it from the start.
