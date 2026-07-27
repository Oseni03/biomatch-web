## Parent

Database schema audit (2026-07-26) — see AGENTS.md "Schema Hardening Issues" section.

## What to build

`createScreening()` and `resolveScreening()` in `servers/screening.ts` both rely on non-atomic check-then-write logic with nothing in the schema to back it up:

- `createScreening()` does a `findFirst` for an existing pending screening (scoped to `donorId` + `alertId`), and only creates a new row if none is found. Two concurrent calls (e.g. two staff members opening the same donor's screening at once) can both pass the `findFirst` check before either insert lands, producing two pending `DonorScreening` rows for the same donor/alert.
- `resolveScreening()` reads the screening, checks `status === "pending"`, then updates it inside a transaction. Two concurrent resolve calls on the same screening can both pass the status check before either update commits, resolving the same screening twice (the second resolution would re-run the defer/blacklist consequence logic against an already-resolved donor).

Add a partial unique index enforcing at most one `pending` `DonorScreening` per `(donorId, alertId)`, and update `createScreening`/`resolveScreening` to treat a unique-constraint violation as "someone else already created/resolved this" (return the existing row, or throw a clear "already resolved" error) instead of relying purely on the upfront check.

## Acceptance criteria

- [ ] A partial unique index exists ensuring at most one `pending`-status `DonorScreening` per `(donorId, alertId)` combination, applied via a migration (Prisma doesn't model partial indexes directly — add via `@@index` + a raw SQL migration step, or via `prisma db execute`)
- [ ] `createScreening()` handles the constraint violation gracefully — concurrent calls for the same donor/alert result in exactly one pending screening, and the losing caller gets back the winning row rather than an unhandled error
- [ ] `resolveScreening()` handles a "no longer pending" race gracefully — a losing concurrent resolve call gets a clear error instead of silently re-applying defer/blacklist consequences
- [ ] Firing two concurrent `createScreening` calls (same donor/alert) and two concurrent `resolveScreening` calls (same screening) via `Promise.all` each produce exactly one effective outcome, verified manually or with a test

## Blocked by

None — can start immediately.
