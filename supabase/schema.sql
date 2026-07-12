-- Watchverse 2.0 - schema cloud iniziale per Supabase
-- Eseguire nel SQL Editor di un progetto Supabase nuovo.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth.users(id) on delete cascade,
  local_id text not null,
  name text not null check (char_length(name) between 1 and 30),
  role text not null default 'member' check (role in ('owner','member')),
  avatar_type text not null default 'emoji' check (avatar_type in ('emoji','image','initials')),
  avatar_value text,
  pin_hash text,
  pin_salt text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(account_id, local_id)
);

create table if not exists public.profile_settings (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  revision bigint not null default 1,
  updated_at timestamptz not null default now()
);

-- Film e serie sono conservati come record JSON versionati. Questo consente di
-- sincronizzare il modello locale attuale senza perdere campi durante l'evoluzione.
create table if not exists public.library_records (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('series','movie')),
  local_id text not null,
  payload jsonb not null,
  revision bigint not null default 1,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id, kind, local_id)
);

create table if not exists public.episode_progress (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  local_id text not null,
  series_local_id text not null,
  season integer not null,
  episode integer not null,
  watched boolean not null default true,
  watched_at timestamptz,
  rating numeric(2,1) check (rating is null or (rating >= 0.5 and rating <= 5)),
  payload jsonb not null default '{}'::jsonb,
  revision bigint not null default 1,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id, series_local_id, season, episode)
);

create table if not exists public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  source_name text not null,
  status text not null default 'completed',
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.invite_codes (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

-- Audit leggero dei conflitti risolti dal client. Non contiene credenziali: salva
-- soltanto gli identificativi e le versioni dei due valori confrontati.
create table if not exists public.sync_conflicts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  store_name text not null check (store_name in ('series','movies','progress','settings')),
  local_id text not null,
  local_revision bigint not null default 1,
  cloud_revision bigint not null default 1,
  resolution text not null check (resolution in ('cloud_won','local_won')),
  created_at timestamptz not null default now()
);

alter table public.profile_settings add column if not exists revision bigint not null default 1;
alter table public.library_records add column if not exists revision bigint not null default 1;
alter table public.library_records add column if not exists deleted_at timestamptz;
alter table public.library_records add column if not exists updated_at timestamptz not null default now();
alter table public.episode_progress add column if not exists revision bigint not null default 1;
alter table public.episode_progress add column if not exists deleted_at timestamptz;
alter table public.episode_progress add column if not exists updated_at timestamptz not null default now();

-- Indici univoci idempotenti per gli upsert REST usati dalla sincronizzazione.
create unique index if not exists library_records_sync_key on public.library_records(profile_id, kind, local_id);
create unique index if not exists episode_progress_sync_key on public.episode_progress(profile_id, series_local_id, season, episode);

create index if not exists library_records_profile_updated_idx on public.library_records(profile_id, updated_at desc);
create index if not exists episode_progress_profile_updated_idx on public.episode_progress(profile_id, updated_at desc);
create index if not exists sync_conflicts_profile_created_idx on public.sync_conflicts(profile_id, created_at desc);

create or replace function public.owns_profile(target_profile uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = target_profile and p.account_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.profile_settings enable row level security;
alter table public.library_records enable row level security;
alter table public.episode_progress enable row level security;
alter table public.import_jobs enable row level security;
alter table public.invite_codes enable row level security;
alter table public.sync_conflicts enable row level security;

-- L'account autenticato vede e modifica esclusivamente i propri profili.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (account_id = auth.uid());
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (account_id = auth.uid());
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (account_id = auth.uid()) with check (account_id = auth.uid());
drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles for delete using (account_id = auth.uid());

-- Tabelle legate al profilo.
drop policy if exists "settings_own" on public.profile_settings;
create policy "settings_own" on public.profile_settings for all using (public.owns_profile(profile_id)) with check (public.owns_profile(profile_id));
drop policy if exists "library_own" on public.library_records;
create policy "library_own" on public.library_records for all using (public.owns_profile(profile_id)) with check (public.owns_profile(profile_id));
drop policy if exists "progress_own" on public.episode_progress;
create policy "progress_own" on public.episode_progress for all using (public.owns_profile(profile_id)) with check (public.owns_profile(profile_id));
drop policy if exists "imports_own" on public.import_jobs;
create policy "imports_own" on public.import_jobs for all using (public.owns_profile(profile_id)) with check (public.owns_profile(profile_id));

drop policy if exists "invites_own" on public.invite_codes;
create policy "invites_own" on public.invite_codes for all using (account_id = auth.uid()) with check (account_id = auth.uid());
drop policy if exists "sync_conflicts_own" on public.sync_conflicts;
create policy "sync_conflicts_own" on public.sync_conflicts for all using (public.owns_profile(profile_id)) with check (public.owns_profile(profile_id));

-- Mantiene updated_at coerente.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
drop trigger if exists settings_touch on public.profile_settings;
create trigger settings_touch before update on public.profile_settings for each row execute function public.touch_updated_at();
drop trigger if exists library_touch on public.library_records;
create trigger library_touch before update on public.library_records for each row execute function public.touch_updated_at();
drop trigger if exists progress_touch on public.episode_progress;
create trigger progress_touch before update on public.episode_progress for each row execute function public.touch_updated_at();
