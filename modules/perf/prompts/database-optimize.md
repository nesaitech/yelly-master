# Database Query Optimization Prompt

You are optimizing slow database queries. Follow this process.

## Step 1: Identify Slow Queries
- Check application logs for queries exceeding threshold (e.g., > 100ms)
- Use `EXPLAIN ANALYZE` (PostgreSQL) or `EXPLAIN` (MySQL) on suspect queries
- Look for sequential scans on large tables

## Step 2: Analyze Query Plans
- Check if indexes are being used (Index Scan vs Seq Scan)
- Look for high row estimates vs actual rows (cardinality mismatches)
- Identify joins that produce large intermediate result sets

## Step 3: Common Fixes
- **Add missing indexes**: Create indexes on columns in WHERE, JOIN, and ORDER BY
- **Fix N+1 queries**: Replace loops with JOINs or batch IN queries
- **Reduce data fetched**: Use SELECT with specific columns, add LIMIT
- **Optimize joins**: Ensure join columns are indexed, prefer INNER JOIN when possible
- **Add pagination**: Never fetch unbounded result sets

## Step 4: Caching Layer
- Cache frequently-read, rarely-changed data (user profiles, config)
- Use cache invalidation on writes
- Set appropriate TTLs based on data freshness requirements

## Step 5: Verify
- Run EXPLAIN ANALYZE on the optimized query
- Compare execution time before and after
- Load test to confirm improvement under concurrent access
- Verify application behavior is unchanged
