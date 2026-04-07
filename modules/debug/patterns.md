# Debug Module — Common Bug Patterns

A categorized reference of common bug patterns, their symptoms, and how to fix them.

---

## Null / Undefined Errors

**Symptoms:** `TypeError: Cannot read properties of undefined`, `null is not an object`

- **Optional chaining missed:** Accessing `obj.nested.value` when `nested` might be undefined. Fix: use `obj.nested?.value` or add a guard.
- **Async race condition:** A value is read before the async call that sets it has completed. Fix: ensure proper `await` or check for loading state.
- **Destructuring defaults missing:** `const { name } = config` when config might be undefined. Fix: `const { name } = config ?? {}`.

```typescript
// BAD
const userId = response.data.user.id;

// GOOD
const userId = response.data?.user?.id;
if (!userId) throw new Error('User ID not found in response');
```

---

## Type Errors

- **Implicit `any`:** TypeScript set to lenient mode, hiding type mismatches. Check `tsconfig.json` for `strict: true`.
- **Wrong type assertion:** Using `as SomeType` to silence the compiler instead of fixing the actual type.
- **Number/string confusion:** Form inputs return strings; arithmetic on `"5" + 3` gives `"53"`. Fix: use `Number()` or `parseInt()`.

---

## Async Bugs

- **Unhandled promise rejection:** Missing `.catch()` or `try/catch` around `await`. Node will crash or silently swallow the error.
- **Race condition:** Two async operations write to the same state. The last one wins, but the order is non-deterministic. Fix: use a mutex, queue, or `Promise.all` for coordinated execution.
- **Deadlock:** Two resources waiting on each other. Common in database transactions. Fix: always acquire locks in the same order.
- **Fire-and-forget:** Calling an async function without `await` — errors are lost, ordering is broken.

```typescript
// BAD — fire and forget
saveToDatabase(data);

// GOOD
await saveToDatabase(data);
```

---

## State Bugs

- **Stale closure:** A callback captures a variable by reference, but the variable changes before the callback runs. Common in React `useEffect` with missing dependencies.
- **Mutation of shared state:** Two modules hold a reference to the same object and mutate it independently. Fix: use immutable patterns or clone before mutating.
- **Stale cache:** Cached data not invalidated after a write. Fix: invalidate or update cache on mutation.

---

## API Bugs

- **Wrong HTTP method:** Using GET when POST is required, or vice versa. Check the API documentation.
- **Missing headers:** `Content-Type: application/json` not set, causing the server to reject the body.
- **CORS errors:** Browser blocks cross-origin requests. Fix: configure CORS on the server, not by disabling it on the client.
- **Incorrect URL encoding:** Special characters in query parameters not encoded. Use `encodeURIComponent()`.
- **Timeout not set:** HTTP client waits forever. Always set a reasonable timeout.

---

## Database Bugs

- **N+1 queries:** Fetching a list, then querying for each item in a loop. Fix: use a JOIN or batch query.
- **Connection leak:** Opening a connection and not closing it in the error path. Fix: use `try/finally` or a connection pool.
- **Migration failure:** Migration runs in production but was only tested locally. Fix: test migrations against a copy of production data.
- **Transaction not committed:** Forgetting to commit or rollback, leaving the connection in a dirty state.

```typescript
// BAD — N+1
const users = await db.query('SELECT * FROM users');
for (const user of users) {
  const orders = await db.query('SELECT * FROM orders WHERE user_id = ?', [user.id]);
}

// GOOD — single query
const usersWithOrders = await db.query(
  'SELECT u.*, o.* FROM users u LEFT JOIN orders o ON u.id = o.user_id'
);
```
