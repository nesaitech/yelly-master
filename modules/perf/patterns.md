# Performance Patterns

## Database Performance

### N+1 Database Queries
- **Pattern**: Fetching a list, then querying for each item's related data in a loop
- **Symptom**: Page load time grows linearly with data size
- **Fix**: Use eager loading (JOIN), batch queries, or DataLoader pattern
- **Example**: Instead of querying each user's posts separately, use `SELECT * FROM posts WHERE user_id IN (...)`

### Missing Database Indexes
- **Pattern**: Queries filtering or sorting on unindexed columns
- **Symptom**: Slow queries that scan entire tables
- **Fix**: Add indexes on columns used in WHERE, ORDER BY, and JOIN clauses

### Unoptimized Queries
- **Pattern**: `SELECT *` when only a few columns are needed
- **Fix**: Select only required columns, use pagination for large result sets

## Frontend Performance

### Unnecessary Re-renders (React)
- **Pattern**: Parent re-render triggers child re-render even when props unchanged
- **Symptom**: UI jank, slow interactions, high CPU usage
- **Fix**: Use `React.memo`, `useMemo`, `useCallback` where measured benefit exists
- **Warning**: Do not wrap everything in memo — measure first

### Large Bundle / Missing Code Splitting
- **Pattern**: Single JavaScript bundle contains all application code
- **Symptom**: Slow initial page load, high Time to Interactive
- **Fix**: Use dynamic `import()`, route-based code splitting, tree shaking
- **Measure**: `npx webpack-bundle-analyzer` or framework equivalent

### Unoptimized Images
- **Pattern**: Full-resolution images served to all viewports
- **Symptom**: Large page weight, slow LCP
- **Fix**: Use responsive images (srcset), modern formats (WebP/AVIF), lazy loading, CDN

## Server Performance

### Synchronous Operations Blocking Event Loop
- **Pattern**: CPU-intensive computation or synchronous file I/O on the main thread
- **Symptom**: All requests stall while one operation completes
- **Fix**: Offload to worker threads, use async I/O, or move to a background job queue

### Missing API Response Caching
- **Pattern**: Identical expensive computations repeated for every request
- **Symptom**: Consistently high response times for cacheable data
- **Fix**: Add HTTP cache headers, use Redis/in-memory caching, implement ETags

### Memory Leaks from Event Listeners
- **Pattern**: Event listeners or subscriptions added but never removed
- **Symptom**: Memory usage grows over time, eventual OOM crash
- **Fix**: Remove listeners in cleanup/teardown, use weak references where appropriate
