## Parent

UI/UX + debugging report (grilling session, 2026-07-21) — see CLAUDE.md.

## What to build

Stakeholder feedback: Live Inventory should show a chart of ABO blood usage over the month, with per-blood-type click-through to a trend view (up/down). Today `HospitalBank.inventory` is a JSON snapshot blob (current counts only, `prisma/schema.prisma` line 118) — there is no record of inventory changing over time, so there's nothing to chart yet.

Resolved during grilling: build real tracking, not a permanent hardcoded/dummy chart.

Add an `InventoryTransaction` model: `id`, `hospitalBankId` (→ `HospitalBank`), `bloodGroup`, `delta` (signed int — positive for restock, negative for draw-down), `reason` (enum or string: e.g. `donation`, `dispatch`, `manual_adjustment`, `expiry`), `createdAt`.

The single write site is `updateHospitalBankInventory()` in `src/servers/hospital.ts` (lines 51-69) — it replaces the *entire* `inventory` JSON blob in one call (Zod-validated per issue #24), it doesn't take a per-blood-group delta. To log transactions, read the current `inventory` value inside that function before the update, diff it against the incoming `parsed.data` per blood group, and write one `InventoryTransaction` row per blood group whose count changed, in the same transaction as the `hospitalBank.update`.

No charting library exists in the repo (`recharts`/`chart.js`/`d3`/etc. all absent from `package.json`) — the only existing chart, `src/components/hospital/request-volume-chart.tsx`, is a hand-rolled CSS bar chart on the Analytics page. Resolved during grilling: add **Recharts** as a new dependency rather than extending the hand-rolled pattern, since per-blood-type click/trend interaction is materially easier with a real charting library.

Build the chart on the Live Inventory page (`src/app/hospital/inventory/inventory-client.tsx`) aggregating `InventoryTransaction` rows by blood group per month; clicking a blood type shows whether its usage (draw-downs) is trending up or down against the prior period.

## Acceptance criteria

- [ ] `InventoryTransaction` model added via migration
- [ ] Existing inventory-write path(s) write a transaction row (find and confirm the actual site(s) first)
- [ ] `recharts` added as a dependency
- [ ] Live Inventory page shows a real monthly usage chart per blood group, backed by `InventoryTransaction` data
- [ ] Clicking a blood type shows an up/down trend indicator
- [ ] No hardcoded/dummy data in the shipped chart

## Blocked by

None
