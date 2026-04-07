# Performance-Focused Review Checklist

Use this prompt when performing a performance-focused review of a pull request or code change.

## Database

- [ ] No N+1 queries: queries inside loops should be replaced with JOINs or batch fetches.
- [ ] Large queries use LIMIT and pagination, not unbounded SELECT *.
- [ ] Indexes exist for columns used in WHERE, JOIN, and ORDER BY clauses.
- [ ] Transactions are kept short — no network calls or user interaction inside a transaction.

## API and Network

- [ ] Responses include appropriate cache headers (`Cache-Control`, `ETag`).
- [ ] Large lists are paginated. No endpoint returns unbounded arrays.
- [ ] Requests set timeouts. No infinite waits on external services.
- [ ] Batch endpoints exist for operations that would otherwise require many individual calls.

## Frontend

- [ ] Large components or routes use code splitting / lazy loading.
- [ ] Images are optimized and use appropriate formats (WebP, AVIF).
- [ ] React components do not re-render unnecessarily — check `useMemo`, `useCallback`, and `React.memo` usage.
- [ ] Bundle size impact is checked for new dependencies.

## Algorithms and Data Structures

- [ ] No O(n^2) or worse algorithms where O(n) or O(n log n) solutions exist.
- [ ] Large arrays are not copied unnecessarily (spread operator in loops).
- [ ] Set or Map is used for lookups instead of Array.find/includes on large collections.

## Memory

- [ ] Event listeners are cleaned up (removeEventListener, unsubscribe).
- [ ] Large objects are not held in closures longer than needed.
- [ ] Caches have a maximum size or eviction policy.
- [ ] Streams are used for large file processing instead of loading everything into memory.
