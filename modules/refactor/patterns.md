# Refactor Module — Refactoring Catalog

A practical catalog of common refactorings with before/after examples.

---

## Extract Function

Pull a coherent block of code into a named function. Use when a function is too long or a block of code has a clear single purpose.

```typescript
// BEFORE
function processOrder(order: Order) {
  // validate
  if (!order.items.length) throw new Error('Empty order');
  if (!order.customerId) throw new Error('No customer');
  if (order.total < 0) throw new Error('Invalid total');

  // ... 50 more lines of processing
}

// AFTER
function validateOrder(order: Order) {
  if (!order.items.length) throw new Error('Empty order');
  if (!order.customerId) throw new Error('No customer');
  if (order.total < 0) throw new Error('Invalid total');
}

function processOrder(order: Order) {
  validateOrder(order);
  // ... processing
}
```

---

## Inline Temp Variable

Remove a variable that is used only once and adds no clarity.

```typescript
// BEFORE
const basePrice = order.quantity * order.itemPrice;
return basePrice;

// AFTER
return order.quantity * order.itemPrice;
```

Only inline if the expression is self-explanatory. Keep the variable if it names a concept.

---

## Rename for Clarity

Change names to accurately reflect what something does or represents.

```typescript
// BEFORE
const d = new Date();
function proc(x: any) { ... }

// AFTER
const createdAt = new Date();
function processPayment(paymentRequest: PaymentRequest) { ... }
```

Use `Grep` to find all usages before renaming. Update imports, tests, and documentation.

---

## Replace Conditional with Polymorphism

When a switch or chain of if/else selects behavior based on type, replace with polymorphism.

```typescript
// BEFORE
function getArea(shape: Shape) {
  switch (shape.type) {
    case 'circle': return Math.PI * shape.radius ** 2;
    case 'rectangle': return shape.width * shape.height;
    case 'triangle': return 0.5 * shape.base * shape.height;
  }
}

// AFTER
interface Shape { getArea(): number; }
class Circle implements Shape { getArea() { return Math.PI * this.radius ** 2; } }
class Rectangle implements Shape { getArea() { return this.width * this.height; } }
```

---

## Split Large File into Focused Modules

When a file exceeds 300 lines or contains multiple unrelated concerns, split it.

1. Identify groups of related functions/classes.
2. Create a new file for each group.
3. Move the code, update imports everywhere.
4. If needed, create an index file that re-exports for backward compatibility.

---

## Replace Magic Numbers with Named Constants

```typescript
// BEFORE
if (password.length < 8) { ... }
setTimeout(retry, 30000);

// AFTER
const MIN_PASSWORD_LENGTH = 8;
const RETRY_DELAY_MS = 30_000;
if (password.length < MIN_PASSWORD_LENGTH) { ... }
setTimeout(retry, RETRY_DELAY_MS);
```

---

## Consolidate Duplicate Code

When two or more code blocks are nearly identical, extract the shared logic into a function and parameterize the differences.

```typescript
// BEFORE
function sendWelcomeEmail(user: User) {
  const html = renderTemplate('welcome', { name: user.name });
  await mailer.send({ to: user.email, subject: 'Welcome!', html });
}
function sendResetEmail(user: User, token: string) {
  const html = renderTemplate('reset', { name: user.name, token });
  await mailer.send({ to: user.email, subject: 'Password Reset', html });
}

// AFTER
async function sendEmail(user: User, template: string, subject: string, data: Record<string, unknown> = {}) {
  const html = renderTemplate(template, { name: user.name, ...data });
  await mailer.send({ to: user.email, subject, html });
}
```
