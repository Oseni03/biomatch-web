## Parent

Database schema audit (2026-07-26) — see AGENTS.md "Schema Hardening Issues" section.

## What to build

`updateHospitalBankInventory()` in `servers/hospital.ts` reads `HospitalBank.inventory` (a JSON blob holding current stock per blood group), diffs it against the incoming value to compute per-group deltas, writes those deltas to `InventoryTransaction` (an append-only audit ledger), and then overwrites the JSON blob — all inside a single `$transaction`, but with no row lock (e.g. `SELECT ... FOR UPDATE`) and no optimistic-concurrency check.

Under Postgres's default READ COMMITTED isolation, two concurrent updates to the same hospital bank (e.g. a donation posting while a dispatch/manual adjustment runs) both read the same starting JSON snapshot, both compute deltas against it, and the later `update` silently overwrites the earlier one's result — while the `InventoryTransaction` ledger still gets a row for the discarded update, so the ledger no longer reconciles with the final `inventory` JSON.

The ledger is already the source of truth for the audit trail. Stop treating the JSON blob as writable state that can silently drift from it: derive the currently-displayed inventory by summing `InventoryTransaction.delta` per blood group (grouped `SUM`, filtered by `hospitalBankId`) instead of reading `HospitalBank.inventory`. This makes "current stock" a read-time projection of an insert-only ledger, which is race-safe by construction — concurrent inserts can't lose each other's deltas.

Update the three read call sites that currently read `HospitalBank.inventory` directly: `components/hospital/blood-search-cards.tsx`, `app/hospital/inventory/inventory-client.tsx`, and `components/donor/blood-supply-chart.tsx`. Decide whether `HospitalBank.inventory` stays as a denormalized cache (updated transactionally alongside the ledger insert, still inside a lock) or is dropped entirely in favor of always querying the ledger — either is acceptable as long as the two can never diverge under concurrency.

## Acceptance criteria

- [ ] Two concurrent calls to the inventory-update path for the same hospital bank (verified via `Promise.all` in a test or manual reproduction) never lose either update — final displayed stock reflects both deltas, not just the last writer's
- [ ] `InventoryTransaction` rows always reconcile with whatever value is displayed as "current stock" for a blood group (no drift between ledger sum and displayed value)
- [ ] `blood-search-cards.tsx`, `inventory-client.tsx`, and `blood-supply-chart.tsx` display correct current stock after the change (spot-check in the dev server)
- [ ] `getBloodGroupUsageSummary()` and other existing ledger-based aggregates in `hospital.ts` are unaffected

## Blocked by

None — can start immediately.
