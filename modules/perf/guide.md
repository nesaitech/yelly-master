# Performance Optimization

A measured approach to finding and fixing performance bottlenecks. The cardinal rule: never optimize without profiling first. Premature optimization wastes time and often makes code harder to maintain for negligible gains.

## Workflow

1. **Identify the bottleneck.** Before changing any code, measure. Use browser DevTools, Lighthouse, server-side profilers, or database query analyzers to find where time is actually spent. The bottleneck is rarely where you think it is.

2. **Establish a baseline.** Record current metrics before making changes. For web apps: Largest Contentful Paint (LCP), First Input Delay (FID), Cumulative Layout Shift (CLS), and total bundle size. For APIs: p50, p95, and p99 response times. For databases: query execution time and row scan counts.

3. **Analyze the root cause.** Understand why the bottleneck exists. Is it a large JavaScript bundle? An N+1 query? Unnecessary re-renders? A missing index? A synchronous operation blocking the event loop? Diagnose before prescribing.

4. **Apply targeted optimization.** Choose the right technique for the problem:
   - **Bundle size**: Code splitting, tree shaking, lazy loading, dynamic imports
   - **Rendering**: Memoization, virtualization, reducing DOM nodes
   - **Database**: Add indexes, optimize queries, batch operations, add caching
   - **API**: Response caching, pagination, compression, connection pooling
   - **Images**: Compression, lazy loading, responsive srcset, modern formats (WebP/AVIF)

5. **Measure the improvement.** Run the same benchmarks from step 2. Compare before and after. If the improvement is less than 10%, consider whether the added complexity is worth it.

6. **Verify no regression.** Run the full test suite. Check that other pages or features were not negatively affected. Performance improvements that break functionality are not improvements.

7. **Document the change.** Record what was slow, why, what you changed, and the measured improvement. This helps the team understand the tradeoff and prevents someone from reverting it unknowingly.

8. **Know when to stop.** If the app meets its performance targets (LCP under 2.5s, FID under 100ms, CLS under 0.1), further optimization is likely premature. Ship and move on.
