# Diagnosing Race Conditions

Use this prompt when behavior is non-deterministic: sometimes the code works, sometimes it fails; results depend on timing; tests are flaky.

## Steps

1. **Identify the shared resource.** Race conditions require at least two concurrent operations accessing the same mutable state. Identify what that state is: a variable, a database row, a file, a cache entry.

2. **Add timestamped logging.** Insert `console.log(Date.now(), 'label')` at the entry and exit of each concurrent path. Run multiple times and compare the order of log lines between passing and failing runs.

3. **Check for missing `await`.** The most common cause in JavaScript is a missing `await` on an async call. Search for async functions called without `await`:
   ```bash
   grep -rn 'async function\|\.then(' src/ | head -20
   ```

4. **Look for read-modify-write patterns.** Any code that reads a value, modifies it, and writes it back is vulnerable if another operation can interleave:
   ```typescript
   // RACE: another request can read count between these two lines
   const count = await db.get('counter');
   await db.set('counter', count + 1);
   
   // FIX: use an atomic operation
   await db.increment('counter', 1);
   ```

5. **Test with artificial delays.** Insert `await new Promise(r => setTimeout(r, 100))` between the read and write to widen the race window. If the bug becomes 100% reproducible, you have confirmed the race.

6. **Fix strategies:**
   - **Atomic operations:** Use database-level atomics (INCREMENT, compare-and-swap).
   - **Locking:** Use a mutex or advisory lock. Ensure locks are always released (try/finally).
   - **Serialization:** Queue operations so they run one at a time.
   - **Idempotency:** Design operations so running them twice is safe.

7. **Verify.** Run the test or scenario 10+ times to confirm the flakiness is gone.
