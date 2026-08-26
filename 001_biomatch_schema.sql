-- ============================================================================
-- BioMatch Database Migration
-- Run in Supabase SQL Editor
-- Note: cash payouts are intentionally NOT modeled. Incentives are limited to
-- points, HMO vouchers, and gym/fitness discounts (no monetary blood payment).
-- ============================================================================

-- ---------- ENUMS ----------
create type biomatch_role as enum ('donor', 'hospital', 'admin');
create type biomatch_incentive_type as enum ('hmo_voucher', 'gym_discount');
create type biomatch_claim_status as enum ('pending', 'approved', 'redeemed');
create type biomatch_blood_group as enum ('A+','A-','B+','B-','AB+','AB-','O+','O-');

-- ---------- TABLES ----------

create table public.biomatch_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  blood_group biomatch_blood_group,
  genotype text,
  role biomatch_role not null default 'donor',
  updated_health_info jsonb not null default '{}'::jsonb,
  last_donation_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.biomatch_hospital_banks (
  id uuid primary key default gen_random_uuid(),
  hospital_name text not null,
  location text not null,
  inventory jsonb not null default '{
    "A+": 0, "A-": 0, "B+": 0, "B-": 0,
    "AB+": 0, "AB-": 0, "O+": 0, "O-": 0
  }'::jsonb,
  managed_by uuid references public.biomatch_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Points/voucher wallet only. No cash balance or payout fields by design.
create table public.biomatch_wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.biomatch_profiles(id) on delete cascade,
  points integer not null default 0,
  lifetime_donations integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.biomatch_incentives_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.biomatch_profiles(id) on delete cascade,
  type biomatch_incentive_type not null,
  status biomatch_claim_status not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- INDEXES ----------
create index idx_biomatch_profiles_role on public.biomatch_profiles(role);
create index idx_biomatch_profiles_blood_group on public.biomatch_profiles(blood_group);
create index idx_biomatch_profiles_last_donation on public.biomatch_profiles(last_donation_date);
create index idx_biomatch_claims_user on public.biomatch_incentives_claims(user_id);
create index idx_biomatch_claims_status on public.biomatch_incentives_claims(status);

-- ---------- UPDATED_AT TRIGGER ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated before update on public.biomatch_profiles
  for each row execute function public.set_updated_at();
create trigger trg_banks_updated before update on public.biomatch_hospital_banks
  for each row execute function public.set_updated_at();
create trigger trg_wallets_updated before update on public.biomatch_wallets
  for each row execute function public.set_updated_at();
create trigger trg_claims_updated before update on public.biomatch_incentives_claims
  for each row execute function public.set_updated_at();

-- ---------- HELPER: current user's role ----------
create or replace function public.biomatch_current_role()
returns biomatch_role language sql security definer stable as $$
  select role from public.biomatch_profiles where id = auth.uid();
$$;

-- ---------- ROW LEVEL SECURITY ----------
alter table public.biomatch_profiles enable row level security;
alter table public.biomatch_hospital_banks enable row level security;
alter table public.biomatch_wallets enable row level security;
alter table public.biomatch_incentives_claims enable row level security;

-- profiles: self read/update; hospital & admin can read donor profiles for matching
create policy "profiles_select_self" on public.biomatch_profiles
  for select using (auth.uid() = id);

create policy "profiles_select_staff" on public.biomatch_profiles
  for select using (public.biomatch_current_role() in ('hospital','admin'));

create policy "profiles_update_self" on public.biomatch_profiles
  for update using (auth.uid() = id);

create policy "profiles_insert_self" on public.biomatch_profiles
  for insert with check (auth.uid() = id);

-- hospital banks: all authenticated users can view inventory; only hospital/admin write
create policy "banks_select_all" on public.biomatch_hospital_banks
  for select using (auth.role() = 'authenticated');

create policy "banks_write_staff" on public.biomatch_hospital_banks
  for all using (public.biomatch_current_role() in ('hospital','admin'))
  with check (public.biomatch_current_role() in ('hospital','admin'));

-- wallets: self read only; writes restricted to admin (server-side point awarding)
create policy "wallets_select_self" on public.biomatch_wallets
  for select using (auth.uid() = user_id);

create policy "wallets_select_admin" on public.biomatch_wallets
  for select using (public.biomatch_current_role() = 'admin');

create policy "wallets_write_admin" on public.biomatch_wallets
  for all using (public.biomatch_current_role() = 'admin')
  with check (public.biomatch_current_role() = 'admin');

-- claims: donor can read own + create pending claims; admin manages status
create policy "claims_select_self" on public.biomatch_incentives_claims
  for select using (auth.uid() = user_id);

create policy "claims_select_admin" on public.biomatch_incentives_claims
  for select using (public.biomatch_current_role() = 'admin');

create policy "claims_insert_self" on public.biomatch_incentives_claims
  for insert with check (auth.uid() = user_id and status = 'pending');

create policy "claims_update_admin" on public.biomatch_incentives_claims
  for update using (public.biomatch_current_role() = 'admin');

-- ---------- REALTIME ----------
alter publication supabase_realtime add table public.biomatch_hospital_banks;
alter publication supabase_realtime add table public.biomatch_incentives_claims;
