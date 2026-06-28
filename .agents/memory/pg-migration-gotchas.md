---
name: PostgreSQL schema migration gotchas
description: Lessons on safely migrating existing tables with data in this project
---

## Rule
Do not use `drizzle-kit push` to alter existing tables that already contain data. Use raw SQL via `executeSql` instead.

**Why:** `drizzle-kit push` requires interactive confirmation to add UNIQUE constraints to populated tables (it wants to truncate). This blocks non-interactive execution and risks data loss.

**How to apply:**
1. `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...` to add columns
2. `UPDATE` rows to populate required values before adding constraints
3. Use a `DO $$ BEGIN IF NOT EXISTS ... END $$;` block to add UNIQUE constraints idempotently (plain `ADD CONSTRAINT IF NOT EXISTS` is not supported in this PG version)
4. Then add `NOT NULL` after data is populated

## Also
- `ALTER TABLE products ADD CONSTRAINT IF NOT EXISTS` is NOT valid syntax — use the DO block pattern above.
