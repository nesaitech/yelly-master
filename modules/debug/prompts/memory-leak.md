# Diagnosing Memory Leaks

Use this prompt when the application shows increasing memory usage over time, out-of-memory crashes, or degraded performance after prolonged running.

## Steps

1. **Confirm the leak exists.** Monitor memory usage with `process.memoryUsage()` logged at intervals, or use `--max-old-space-size` to trigger an OOM sooner for faster reproduction.

2. **Take a heap snapshot.**
   - In Node.js: use `--inspect` flag and Chrome DevTools, or `v8.writeHeapSnapshot()`.
   - Compare two snapshots taken minutes apart. Sort by "Objects allocated between snapshots."

3. **Identify the retaining path.** In the heap diff, find objects that grow in count. Click through to see what retains them — this is the chain of references preventing garbage collection.

4. **Common causes:**
   - **Event listeners not removed:** Listeners registered in a loop or on every request without cleanup.
   - **Global caches without eviction:** Maps or objects that grow unboundedly. Fix: use an LRU cache with a max size.
   - **Closures holding references:** A closure captures a large object (e.g., a request or response) and is stored long-term.
   - **Timers not cleared:** `setInterval` without a corresponding `clearInterval`.

5. **Allocation tracking.** Use `--heap-prof` to generate allocation profiles. This shows which functions allocate the most memory over time.

6. **Fix and verify.** After fixing, run the application under load and confirm memory stabilizes at a plateau rather than climbing indefinitely.

## Quick check commands

```bash
# Run with heap snapshots on signal
node --inspect src/index.js
# Then in Chrome: chrome://inspect -> Take heap snapshot

# Or programmatically
node -e "const v8 = require('v8'); v8.writeHeapSnapshot();"
```
