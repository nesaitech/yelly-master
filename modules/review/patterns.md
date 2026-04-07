# Review Module — Anti-Patterns to Catch

A practical reference of code anti-patterns that should be flagged during review, with examples and suggested fixes.

---

## God Objects / Functions

Functions or classes that do too many things. If a function is longer than 40 lines or has more than 3 levels of nesting, it likely needs decomposition.

```typescript
// BAD — does validation, transformation, API call, and error handling
async function processOrder(order: unknown) {
  // 200 lines of mixed concerns...
}

// GOOD — each function has one job
async function processOrder(rawOrder: unknown) {
  const order = validateOrder(rawOrder);
  const enriched = enrichOrderData(order);
  await submitOrder(enriched);
}
```

---

## Premature Abstraction

Creating abstractions before there are at least 2-3 concrete use cases. Abstractions built on one example often get the interface wrong.

- Prefer duplication over the wrong abstraction.
- Wait until you see the pattern repeat, then extract.

---

## Copy-Paste with Slight Variations

Two blocks of code that are 90% identical with minor differences. This is a signal that a shared function with parameters should be extracted.

Look for: adjacent functions with similar names, switch statements where each case has near-identical bodies.

---

## Magic Numbers / Strings

Literal values embedded in logic without explanation.

```typescript
// BAD
if (retries > 3) { ... }
if (status === 'xyz_active') { ... }

// GOOD
const MAX_RETRIES = 3;
const STATUS_ACTIVE = 'xyz_active';
if (retries > MAX_RETRIES) { ... }
if (status === STATUS_ACTIVE) { ... }
```

---

## Inconsistent Error Handling

Some code paths handle errors while others silently swallow them. This is especially dangerous in async code.

```typescript
// BAD — errors silently swallowed
try { await save(data); } catch (e) {}

// GOOD — at minimum, log the error
try {
  await save(data);
} catch (error) {
  logger.error('Failed to save data', { error, data });
  throw error;
}
```

---

## Missing Input Validation at Boundaries

System boundaries (API endpoints, message handlers, file readers) must validate their inputs. Internal functions can trust their callers, but boundary functions cannot.

- API handlers should validate request body, query params, and path params.
- File parsers should handle malformed input gracefully.
- Message consumers should validate message shape before processing.

---

## Overly Clever Code

Code that uses advanced language features, bitwise hacks, or obscure patterns when a straightforward approach would work. Cleverness trades readability for a small performance gain that almost never matters.

```typescript
// BAD — clever but unreadable
const isEven = (n: number) => !(n & 1);

// GOOD — obvious
const isEven = (n: number) => n % 2 === 0;
```

Rule of thumb: if a teammate would need to look it up, simplify it.
