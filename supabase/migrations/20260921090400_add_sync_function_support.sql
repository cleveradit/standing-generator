create or replace function public.latest_sync_log()
returns table(status text, finished_at timestamptz, records_created integer, records_updated integer, error_message text)
language sql
stable
security definer
set search_path = public
as $$
  select logs.status, logs.finished_at, logs.records_created, logs.records_updated, logs.error_message
  from public.sync_logs logs
  order by logs.created_at desc
  limit 1;
$$;

revoke all on function public.latest_sync_log() from public;
grant execute on function public.latest_sync_log() to service_role;
