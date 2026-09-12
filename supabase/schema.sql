-- Football Intelligence V.I.B.E.S. Validation Sprint 001
-- Non-live Supabase/PostgreSQL schema. Apply only after reviewing policies and credentials.
extension if not exists pgcrypto;

create table if not exists prospects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone_or_telegram text not null,
  acquisition_source text not null default 'direct' check (acquisition_source in ('telegram','whatsapp','facebook','referral','community','warm-network','organic','direct','other')),
  created_at timestamptz not null default now()
);

create table if not exists pricing_assignments (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references prospects(id),
  variant text not null check (variant in ('A','B')),
  assigned_price integer not null check (assigned_price in (1000,2000)),
  assigned_at timestamptz not null default now(),
  unique (prospect_id),
  check ((variant = 'A' and assigned_price = 1000) or (variant = 'B' and assigned_price = 2000))
);

create table if not exists trial_purchases (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references prospects(id),
  pricing_variant text not null check (pricing_variant in ('A','B')),
  assigned_price integer not null check (assigned_price in (1000,2000)),
  payment_amount integer,
  payment_reference text unique,
  payment_status text not null default 'pending' check (payment_status in ('pending','successful','failed','cancelled')),
  purchased_at timestamptz,
  created_at timestamptz not null default now(),
  check (payment_amount is null or payment_amount = assigned_price)
);

create table if not exists telegram_activations (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references prospects(id),
  telegram_identifier text,
  activation_status text not null default 'pending' check (activation_status in ('pending','activated','failed')),
  activated_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references prospects(id),
  event_name text not null,
  event_properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists prediction_records (
  id uuid primary key default gen_random_uuid(),
  prediction_id text not null unique,
  fixture_id text,
  competition text not null,
  home_team text not null,
  away_team text not null,
  market text not null,
  selection text not null,
  model_probability numeric(6,3) not null check (model_probability >= 0 and model_probability <= 1),
  market_odds numeric(8,3) not null,
  odds_source text not null,
  odds_timestamp timestamptz not null,
  implied_probability numeric(6,3),
  estimated_edge numeric(8,3),
  confidence text not null,
  risk_flags jsonb not null default '[]'::jsonb,
  model_version text not null,
  data_version text not null,
  publication_timestamp timestamptz not null default now(),
  kickoff_timestamp timestamptz not null,
  subscriber_release_timestamp timestamptz not null,
  public_release_timestamp timestamptz not null,
  settlement_status text not null default 'pending' check (settlement_status in ('pending','settled')),
  result text check (result in ('WON','LOST','NO BET')),
  settlement_timestamp timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists prediction_corrections (
  id uuid primary key default gen_random_uuid(),
  prediction_id uuid not null references prediction_records(id),
  original_value jsonb not null,
  corrected_value jsonb not null,
  reason text not null,
  corrected_at timestamptz not null default now(),
  corrected_by text not null
);

alter table prospects enable row level security;
alter table pricing_assignments enable row level security;
alter table trial_purchases enable row level security;
alter table telegram_activations enable row level security;
alter table analytics_events enable row level security;
alter table prediction_records enable row level security;
alter table prediction_corrections enable row level security;

-- Public clients receive no direct table privileges. Server-side service-role operations bypass RLS.
revoke all on prospects, pricing_assignments, trial_purchases, telegram_activations, analytics_events, prediction_records, prediction_corrections from anon, authenticated;

create or replace view public_validation_metrics as
select
  (select count(*) from prospects) as total_prospects,
  (select count(*) from telegram_activations where activation_status = 'activated') as activated_prospects,
  (select count(*) from pricing_assignments where variant = 'A') as cohort_a,
  (select count(*) from pricing_assignments where variant = 'B') as cohort_b,
  (select count(*) from trial_purchases where payment_status = 'successful') as purchases,
  (select coalesce(sum(payment_amount),0) from trial_purchases where payment_status = 'successful') as revenue,
  (select count(*) from prediction_records) as total_predictions,
  (select count(*) from prediction_records where settlement_status = 'settled') as settled_predictions,
  (select count(*) from prediction_records where result = 'WON') as wins,
  (select count(*) from prediction_records where result = 'LOST') as losses,
  (select count(*) from prediction_records where result = 'NO BET') as no_bets;
