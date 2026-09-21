# BioMatch — Setup & Deployment

Single-host deployment (ADR 004): the Next.js app and its server layer
(Route Handlers + Server Actions, ADR 001) deploy together on Vercel.
There is no separate backend service and no cross-domain auth (ADR 002).

Stack: Next.js 16 (App Router) + TypeScript, Prisma 7 with
`@prisma/adapter-pg`, PostgreSQL, Better Auth (email/password +
organization plugin), Resend for email.

## 1. Local setup

```bash
npm install
cp .env.local.example .env.local
npx prisma generate
npm run dev
```

## 2. Environment variables

| Variable | Used for |
|---|---|
| `DATABASE_URL` | Postgres connection string (Prisma adapter) |
| `BETTER_AUTH_SECRET` | Better Auth session encryption (min 32 chars) |
| `APP_URL` | Base URL of the app: auth `baseURL` + links in emails (`BETTER_AUTH_URL` also accepted as fallback) |
| `RESEND_API_KEY` | Resend email sending |
| `EMAIL_FROM` | Sender address for auth and alert emails |

Secrets live in provider env dashboards (and `.env.local` for development).
Never commit them.

## 3. Prototype database

Per ADR 006 the prototype database is reset to the baseline schema:

1. Apply the baseline migration to an empty Postgres database
   (`npx prisma migrate dev` for dev).
2. Apply `prisma/biomatch_constraints.sql` — CHECKs, partial indexes,
   triggers, and the `blood_compatibility` seed data. These live outside
   Prisma migrations by design; if `migrate dev` output ever conflicts with
   them, hand-maintain the SQL file (see its header warning).
3. Run `npx prisma generate` after any schema change.

## 4. Deploy to Vercel

1. Import the GitHub repo at https://vercel.com/new.
2. Set the environment variables above for Preview and Production.
   `APP_URL` must match each environment's public URL.
3. Build with `npm run vercel-build` (`prisma generate && next build`,
   see `vercel.json` + `package.json`).

## 5. Background jobs

Escalation (slice 15) and voucher-expiry (slice 23) workers run as a
scheduled cron polling the existing indexes (ADR 005). No queue
infrastructure. Not configured yet — lands with those slices.

## 6. Before slice 03 (human checklist)

- [ ] Staging and production Postgres databases provisioned.
- [ ] `APP_URL`, `BETTER_AUTH_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`
      set in the Vercel dashboard for Preview and Production.
- [ ] Baseline migration + constraints SQL verified against an empty
      database (slice 03 acceptance criterion).

## Scope note

No cash payouts for blood donations.
