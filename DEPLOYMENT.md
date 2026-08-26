````markdown
# BioMatch — Setup & Deployment (Prisma + Supabase)

This is a complete, runnable Next.js 14 App Router project using **Prisma** as the ORM and Supabase for Auth + Realtime + Hosting.

## 1. Unzip and install

```bash
cd biomatch
npm install
```
````

## 2. Create your Supabase project

1. Go to https://supabase.com/dashboard → New Project.
2. Once provisioned, go to **Project Settings → API** and copy:
    - Project URL
    - anon public key
    - service_role key (keep server-side only)

## 3. Environment variables

```bash
cp .env.local.example .env.local
```

Add your Supabase connection string to Prisma:

```env
DATABASE_URL="postgresql://postgres.[your-project-ref]:[your-password]@aws-0-[region].pooler.supabase.com:5432/postgres?schema=public"
```

> You can find the direct connection string in Supabase → Project Settings → Database.

## 4. Database migration with Prisma

```bash
# Generate Prisma Client and push schema to Supabase
npx prisma generate
npx prisma db push
```

This applies the Prisma schema (`prisma/schema.prisma`) — creating tables, enums, indexes, and defaults.  
RLS policies are **not** in Prisma. After `db push`, run the RLS + helper functions + realtime config from `001_biomatch_rls.sql` (or equivalent) in the Supabase SQL Editor.

## 5. Run locally

```bash
npm run dev
```

Visit http://localhost:3000, sign up as a donor or hospital, and confirm you land on the correct dashboard.

To test realtime hospital inventory:

- Insert a sample row via Supabase SQL Editor (as before).
- Updates made in Supabase will reflect live on the dashboard.

## 6. Push to GitHub

```bash
git init
git add .
git commit -m "Initial BioMatch build with Prisma"
gh repo create biomatch --private --source=. --push
```

## 7. Deploy to Vercel

**Via dashboard (recommended):**

1. https://vercel.com/new → Import GitHub repo.
2. Add these environment variables in Vercel:
    - `DATABASE_URL` (use the **direct** Supabase connection string)

**Via CLI:**

```bash
npm install -g vercel
vercel link
vercel env add DATABASE_URL
vercel --prod
```

After deploy, run `npx prisma generate` in your build command if needed (or add to `postinstall`).

## 8. Post-deploy: Supabase Auth

In Supabase Dashboard → Authentication → URL Configuration, add your Vercel URL (e.g. `https://biomatch.vercel.app`) to **Site URL** and **Redirect URLs**.

## Prisma Workflow Notes

- Schema changes: Edit `prisma/schema.prisma` → `npx prisma db push` (dev) or `npx prisma migrate dev` (when you want migration files).
- After any schema change that affects the client: `npx prisma generate`.
- For production deploys, Vercel will run `prisma generate` automatically if configured.

## What's intentionally not built yet

- Real-time inventory write UI for hospitals.
- Admin verification flows (placeholders).
- Email confirmation uses Supabase defaults.

## Note on scope

Same as before — no cash payouts for blood donations.

Run `npm install && npx prisma generate && npm run dev` locally to verify. Flag any issues.

```

```
