-- Idempotent migration for an existing Watchverse Supabase project.
-- Run this once in Supabase SQL Editor after the initial schema.sql.

alter table public.profile_settings add column if not exists revision bigint not null default 1;
alter table public.library_records add column if not exists revision bigint not null default 1;
alter table public.library_records add column if not exists deleted_at timestamptz;
alter table public.library_records add column if not exists updated_at timestamptz not null default now();
alter table public.episode_progress add column if not exists revision bigint not null default 1;
alter table public.episode_progress add column if not exists deleted_at timestamptz;
alter table public.episode_progress add column if not exists updated_at timestamptz not null default now();

create unique index if not exists library_records_sync_key on public.library_records(profile_id, kind, local_id);
create unique index if not exists episode_progress_sync_key on public.episode_progress(profile_id, series_local_id, season, episode);
create index if not exists library_records_profile_updated_idx on public.library_records(profile_id, updated_at desc);
create index if not exists episode_progress_profile_updated_idx on public.episode_progress(profile_id, updated_at desc);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists settings_touch on public.profile_settings;
create trigger settings_touch before update on public.profile_settings for each row execute function public.touch_updated_at();
drop trigger if exists library_touch on public.library_records;
create trigger library_touch before update on public.library_records for each row execute function public.touch_updated_at();
drop trigger if exists progress_touch on public.episode_progress;
create trigger progress_touch before update on public.episode_progress for each row execute function public.touch_updated_at();
