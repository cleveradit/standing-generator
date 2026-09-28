create extension if not exists supabase_vault with schema vault;
create schema if not exists private;

create table private.provider_settings (
  provider text primary key check (provider = 'pandascore'),
  secret_id uuid not null references vault.secrets(id) on delete restrict,
  updated_at timestamptz not null default now()
);

alter table private.provider_settings enable row level security;
revoke all on schema private from public, anon, authenticated;
revoke all on table private.provider_settings from public, anon, authenticated;

create or replace function public.get_pandascore_token()
returns text
language plpgsql
security definer
set search_path = private, vault
as $$
declare
  result text;
begin
  select secrets.secret into result
  from private.provider_settings settings
  join vault.decrypted_secrets secrets on secrets.id = settings.secret_id
  where settings.provider = 'pandascore';

  if result is null or length(trim(result)) = 0 then
    raise exception 'PandaScore token is not configured';
  end if;
  return result;
end;
$$;

create or replace function public.set_pandascore_token(next_token text)
returns timestamptz
language plpgsql
security definer
set search_path = private, vault
as $$
declare
  next_secret_id uuid;
  old_secret_id uuid;
  updated_at_value timestamptz;
begin
  if length(trim(next_token)) < 8 then
    raise exception 'Token is invalid';
  end if;

  select secret_id into old_secret_id from private.provider_settings where provider = 'pandascore';
  select vault.create_secret(next_token, 'pandascore_api_token', 'Standing Generator PandaScore API token') into next_secret_id;

  insert into private.provider_settings (provider, secret_id, updated_at)
  values ('pandascore', next_secret_id, now())
  on conflict (provider) do update set secret_id = excluded.secret_id, updated_at = excluded.updated_at
  returning updated_at into updated_at_value;

  if old_secret_id is not null then
    delete from vault.secrets where id = old_secret_id;
  end if;

  return updated_at_value;
end;
$$;

create or replace function public.get_pandascore_settings()
returns table(provider text, configured boolean, updated_at timestamptz)
language sql
stable
security definer
set search_path = private
as $$
  select settings.provider, true, settings.updated_at from private.provider_settings settings where settings.provider = 'pandascore';
$$;

revoke all on function public.get_pandascore_token() from public;
revoke all on function public.set_pandascore_token(text) from public;
revoke all on function public.get_pandascore_settings() from public;
grant execute on function public.get_pandascore_token() to service_role;
grant execute on function public.set_pandascore_token(text) to service_role;
grant execute on function public.get_pandascore_settings() to service_role;
