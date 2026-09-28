create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

create table private.local_scheduler_settings (
  id boolean primary key default true check (id),
  secret text not null check (length(secret) >= 32),
  created_at timestamptz not null default now()
);

alter table private.local_scheduler_settings enable row level security;
revoke all on table private.local_scheduler_settings from public, anon, authenticated;

create or replace function public.get_local_scheduler_secret()
returns text
language plpgsql
security definer
set search_path = private, extensions
as $$
declare
  result text;
begin
  select secret into result from private.local_scheduler_settings where id = true;
  if result is null then
    result := encode(extensions.gen_random_bytes(32), 'hex');
    insert into private.local_scheduler_settings (id, secret) values (true, result);
  end if;
  return result;
end;
$$;

create or replace function private.trigger_scheduled_pandascore_sync()
returns bigint
language plpgsql
security definer
set search_path = public, private
as $$
declare
  request_id bigint;
begin
  select net.http_post(
    url := 'http://kong:8000/functions/v1/sync-pandascore',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-local-scheduler-secret', public.get_local_scheduler_secret()),
    body := '{}'::jsonb
  ) into request_id;
  return request_id;
end;
$$;

create or replace function public.trigger_local_scheduled_pandascore_sync()
returns bigint
language sql
security definer
set search_path = private
as $$
  select private.trigger_scheduled_pandascore_sync();
$$;

revoke all on function public.get_local_scheduler_secret() from public;
revoke all on function private.trigger_scheduled_pandascore_sync() from public;
revoke all on function public.trigger_local_scheduled_pandascore_sync() from public;
grant execute on function public.get_local_scheduler_secret() to service_role;
grant execute on function private.trigger_scheduled_pandascore_sync() to service_role;
grant execute on function public.trigger_local_scheduled_pandascore_sync() to service_role;

select cron.unschedule(jobid) from cron.job where jobname = 'standing-generator-pandascore-sync';
select cron.schedule('standing-generator-pandascore-sync', '30 16 * * 5,6,0', $$select private.trigger_scheduled_pandascore_sync();$$);
