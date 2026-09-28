alter table public.games enable row level security;
alter table public.competitions enable row level security;
alter table public.seasons enable row level security;
alter table public.teams enable row level security;
alter table public.season_teams enable row level security;
alter table public.matches enable row level security;
alter table public.sync_logs enable row level security;

create policy "public reads games" on public.games for select to anon, authenticated using (true);
create policy "public reads competitions" on public.competitions for select to anon, authenticated using (true);
create policy "public reads active seasons" on public.seasons for select to anon, authenticated using (status = 'active');
create policy "public reads teams" on public.teams for select to anon, authenticated using (true);
create policy "public reads active season memberships" on public.season_teams for select to anon, authenticated using (
  exists (select 1 from public.seasons where seasons.id = season_teams.season_id and seasons.status = 'active')
);
create policy "public reads active season matches" on public.matches for select to anon, authenticated using (
  exists (select 1 from public.seasons where seasons.id = matches.season_id and seasons.status = 'active')
);

revoke all on table public.sync_logs from anon, authenticated;
