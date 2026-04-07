# Documentation Patterns

## README Template

```markdown
# Project Name

[![CI](badge-url)](ci-url) [![npm](badge-url)](npm-url) [![License](badge-url)](license-url)

One-line description of what this project does.

## Installation

\`\`\`bash
npm install project-name
\`\`\`

## Quick Start

\`\`\`typescript
import { main } from 'project-name';
const result = main({ option: true });
\`\`\`

## API Reference

### `functionName(param: Type): ReturnType`
Description of what it does.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| param | `Type` | - | What it controls |

## Configuration

Describe config options here.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
```

## JSDoc / TSDoc Annotation Patterns

```typescript
/**
 * Calculates the total price including tax.
 *
 * @param items - The line items to sum
 * @param taxRate - Tax rate as a decimal (e.g., 0.08 for 8%)
 * @returns The total price with tax applied
 * @throws {InvalidTaxRateError} If taxRate is negative
 *
 * @example
 * ```ts
 * const total = calculateTotal([{ price: 10 }], 0.08);
 * // => 10.80
 * ```
 */
export function calculateTotal(items: LineItem[], taxRate: number): number;
```

## Architecture Decision Records (ADR)

```markdown
# ADR-001: Use PostgreSQL over MongoDB

## Status
Accepted

## Context
We need a database for storing user data with complex relational queries.

## Decision
Use PostgreSQL with Prisma ORM.

## Consequences
- Pro: Strong typing, relational queries, mature ecosystem
- Con: Schema migrations required, less flexible for unstructured data
```

## API Documentation Structure

```markdown
# API: /api/v1/users

## Endpoints

### GET /api/v1/users
List all users with pagination.

**Query Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20) |

**Response:** `200 OK`
\`\`\`json
{ "data": [...], "total": 100, "page": 1 }
\`\`\`
```

## Migration Guide Format

```markdown
# Migrating from v2 to v3

## Breaking Changes

### `oldFunction` renamed to `newFunction`
**Before:**
\`\`\`ts
oldFunction(arg);
\`\`\`
**After:**
\`\`\`ts
newFunction(arg);
\`\`\`

## Deprecations
- `legacyMethod()` is deprecated. Use `modernMethod()` instead. Will be removed in v4.

## New Features
- Added `coolNewFeature()` for improved performance.
```

## Changelog Entry Format

```markdown
## [1.2.0] - 2025-03-15

### Added
- New `export` command for bulk data export (#234)

### Fixed
- Race condition in concurrent writes (#221)

### Changed
- Default timeout increased from 5s to 10s
```
