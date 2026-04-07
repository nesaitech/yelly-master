# Data Modeling Checklist

Use this prompt when designing a new database schema or modifying an existing one.

## Step 1: Identify Entities

List every entity (table) the feature requires. For each entity:
- What is its primary key? Prefer UUIDs for distributed systems, auto-increment for simple apps.
- What are its attributes? List each column with type and constraints.
- What are the relationships? One-to-many, many-to-many, one-to-one.

## Step 2: Normalize

- Eliminate duplicate data. Each fact should live in exactly one place.
- Use foreign keys to express relationships.
- Do not store derived data unless there is a measured performance need (then denormalize deliberately).

## Step 3: Define Constraints

For each table:
- [ ] Primary key defined.
- [ ] NOT NULL on columns that must always have a value.
- [ ] UNIQUE constraints where business rules require uniqueness (email, slug).
- [ ] Foreign key constraints with appropriate ON DELETE behavior (CASCADE, SET NULL, RESTRICT).
- [ ] CHECK constraints for value ranges or enums.

## Step 4: Plan Indexes

- Index every foreign key column (used in JOINs).
- Index columns used in WHERE clauses for frequent queries.
- Index columns used in ORDER BY for sorted queries.
- Use composite indexes for multi-column queries (leftmost prefix rule).
- Do not over-index: each index slows writes.

## Step 5: Timestamps and Soft Delete

Standard columns to include on most tables:
```sql
created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
deleted_at  TIMESTAMP NULL  -- soft delete (if applicable)
```

## Step 6: Migration Plan

- Write the migration SQL or ORM migration file.
- Test the migration on a copy of production data (not just an empty database).
- Ensure the migration is reversible (write both `up` and `down`).
- For large tables, plan for zero-downtime migration: add new columns as nullable first, backfill, then add constraints.

## Step 7: Review Questions

- Can this schema handle 10x the current data volume?
- Are queries that will be called on every request optimized with indexes?
- Is sensitive data (PII, passwords) stored appropriately (encrypted, hashed)?
- Does the schema support the application's access patterns without expensive JOINs?
