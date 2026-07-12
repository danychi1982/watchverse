-- Apply this migration in the Supabase SQL Editor.
-- It restores authenticated delete access only for profiles owned by the account.

create or replace function public.owns_profile(target_profile uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = target_profile
      and p.account_id = auth.uid()
  );
$$;

grant execute on function public.owns_profile(uuid) to authenticated;

create or replace function public.clear_profile_data(target_profile uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.owns_profile(target_profile) then
    raise exception 'Profilo non autorizzato';
  end if;

  delete from public.library_records where profile_id = target_profile;
  delete from public.episode_progress where profile_id = target_profile;
end;
$$;

revoke execute on function public.clear_profile_data(uuid) from public, anon;
grant execute on function public.clear_profile_data(uuid) to authenticated;

alter table public.library_records enable row level security;
alter table public.episode_progress enable row level security;

drop policy if exists "library_own" on public.library_records;
create policy "library_own"
on public.library_records
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = library_records.profile_id
      and p.account_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = library_records.profile_id
      and p.account_id = auth.uid()
  )
);

drop policy if exists "progress_own" on public.episode_progress;
create policy "progress_own"
on public.episode_progress
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = episode_progress.profile_id
      and p.account_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = episode_progress.profile_id
      and p.account_id = auth.uid()
  )
);
