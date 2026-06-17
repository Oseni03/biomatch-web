# BioMatch — Setup & Deployment

This is a complete, runnable Next.js 14 App Router project. Follow these steps in order.

## 1. Unzip and install
```bash
cd biomatch
npm install
```

## 2. Create your Supabase project
1. Go to https://supabase.com/dashboard -> New Project.
2. Once provisioned, go to Project Settings -> API and copy:
   - Project URL
   - anon public key
   - service_role key (keep this server-side only, never expose to the client)

## 3. Run the database migration
Dashboard -> SQL Editor -> New query -> paste the entire contents of
001_biomatch_schema.sql -> Run.

This creates all tables, enums, RLS policies, and enables Realtime on
biomatch_hospital_banks and biomatch_incentives_claims.

## 4. Environment variables
```bash
cp .env.local.example .env.local
```
Fill in the three values from step 2.

## 5. Run locally
```bash
npm run dev
```
Visit http://localhost:3000, sign up as a donor or hospital, and confirm
you land on the correct dashboard.

To test the hospital inventory dashboard with live data, insert a row
manually in Supabase SQL editor:
```sql
insert into public.biomatch_hospital_banks (hospital_name, location, inventory)
values ('Lagos General', 'Lagos, NG', '{"A+":12,"A-":3,"B+":8,"B-":2,"AB+":1,"AB-":0,"O+":20,"O-":4}');
```
Then update a value from the SQL editor while the page is open -- the grid
should update without a refresh.

## 6. Push to GitHub
```bash
git init
git add .
git commit -m "Initial BioMatch build"
gh repo create biomatch --private --source=. --push
```
(or push manually to a repo you create on github.com)

## 7. Deploy to Vercel
Easiest path -- via the dashboard:
1. Go to https://vercel.com/new
2. Import your GitHub repo.
3. Add the same three environment variables from .env.local in the
   Vercel project settings (Environment Variables section).
4. Deploy.

Or via CLI:
```bash
npm install -g vercel
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel --prod
```

## 8. Post-deploy: Supabase auth redirect URLs
In Supabase Dashboard -> Authentication -> URL Configuration, add your
Vercel production URL (e.g. https://biomatch.vercel.app) to both
"Site URL" and "Redirect URLs", or auth flows will fail in production.

## What's intentionally not built yet
- Real-time inventory writes from hospital staff (the dashboard reads
  live, but there's no UI yet to edit unit counts -- fast follow).
- Admin verification/contracts pages are placeholders.
- Email confirmation uses Supabase's default flow; you may want to
  disable "Confirm email" in Auth settings for faster local testing.

## Note on scope: no cash payouts
The wallet/incentive system uses points and vouchers (HMO access, gym
discounts), not cash payouts for blood donations. Paid/replacement
donation models are restricted or prohibited in most jurisdictions
(including Nigeria) on blood-safety grounds -- paying donors creates an
incentive to conceal risk factors, which is a transfusion-safety issue,
not just a business-model choice. If a cash component is a hard
requirement, get legal/compliance sign-off and a licensed blood-bank
partner before any code is written for it.

## Honesty note on this build
This project's dependencies could not be installed or build-verified in
the sandbox used to write it (no network access there). The code follows
standard Next.js 14 App Router / Supabase conventions throughout, but
your local `npm install && npm run dev` will be the first real compile --
flag anything that breaks and it can be fixed directly.
