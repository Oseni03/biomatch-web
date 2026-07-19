## Parent

Codebase optimization & page-decomposition audit (2026-07-19) — see CLAUDE.md.

## What to build

`getHospitalAnalytics()` in `servers/analytics.ts` fetches every `EmergencyRequest` + nested `alerts` for a hospital with no `take` limit, then computes counts/averages/status breakdowns in JS. Replace with Prisma `groupBy`/`aggregate`/`count` (or raw SQL) so aggregation happens in the DB, and scope by the date range already supported in the analytics UI's date-range picker instead of loading full history every time.

## Acceptance criteria

- [ ] `getHospitalAnalytics()` uses `groupBy`/`aggregate`/`count` instead of loading full rows and reducing in JS
- [ ] Date-range filtering happens in the query's WHERE clause, not by fetching-then-filtering
- [ ] Analytics dashboard numbers (stat cards, request volume chart, coverage gaps) are unchanged for existing data

## Blocked by

None — can start immediately
