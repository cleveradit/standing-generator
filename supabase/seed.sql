insert into public.games (id, provider, provider_id, name, slug)
values ('00000000-0000-4000-8000-000000000001', 'pandascore', 'mobile-legends', 'Mobile Legends: Bang Bang', 'mobile-legends')
on conflict (provider, provider_id) do update set name = excluded.name;

insert into public.competitions (id, game_id, provider, provider_id, name, slug, region)
values ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'pandascore', 'mpl-id-local', 'MPL Indonesia Local Fixture', 'mpl-id-local', 'ID')
on conflict (provider, provider_id) do update set name = excluded.name;

insert into public.seasons (id, competition_id, provider, provider_id, name, status, starts_at, ends_at, rules, last_synced_at)
values (
  '00000000-0000-4000-8000-000000000003',
  '00000000-0000-4000-8000-000000000002',
  'pandascore', 'mpl-id-local-season', 'MPL Indonesia Local Season', 'active',
  '2026-09-01T00:00:00Z', '2026-10-01T00:00:00Z',
  '{"regularSeasonBestOf":3,"playoffCutoff":3,"upperBracketCutoff":2,"tiebreakers":["match_wins","game_difference","head_to_head"]}',
  now()
)
on conflict (competition_id, provider, provider_id) do update set status = excluded.status, rules = excluded.rules, last_synced_at = excluded.last_synced_at;

insert into public.teams (id, provider, provider_id, name, acronym, logo_url) values
  ('00000000-0000-4000-8000-000000000011', 'pandascore', 'fixture-a', 'Fixture A', 'FA', null),
  ('00000000-0000-4000-8000-000000000012', 'pandascore', 'fixture-b', 'Fixture B', 'FB', null),
  ('00000000-0000-4000-8000-000000000013', 'pandascore', 'fixture-c', 'Fixture C', 'FC', null),
  ('00000000-0000-4000-8000-000000000014', 'pandascore', 'fixture-d', 'Fixture D', 'FD', null)
on conflict (provider, provider_id) do update set name = excluded.name;

insert into public.season_teams (season_id, team_id) values
  ('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000011'),
  ('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000012'),
  ('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000013'),
  ('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000014')
on conflict do nothing;

insert into public.matches (id, provider, provider_id, season_id, tournament_id, tournament_name, home_team_id, away_team_id, scheduled_at, status, best_of, home_score, away_score, is_regular_season) values
  ('00000000-0000-4000-8000-000000000021', 'pandascore', 'fixture-1', '00000000-0000-4000-8000-000000000003', 'fixture-regular', 'Regular Season', '00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000012', '2026-09-10T10:00:00Z', 'finished', 3, 2, 0, true),
  ('00000000-0000-4000-8000-000000000022', 'pandascore', 'fixture-2', '00000000-0000-4000-8000-000000000003', 'fixture-regular', 'Regular Season', '00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000013', '2026-09-11T10:00:00Z', 'finished', 3, 2, 0, true),
  ('00000000-0000-4000-8000-000000000023', 'pandascore', 'fixture-3', '00000000-0000-4000-8000-000000000003', 'fixture-regular', 'Regular Season', '00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000014', '2026-09-12T10:00:00Z', 'finished', 3, 2, 0, true),
  ('00000000-0000-4000-8000-000000000024', 'pandascore', 'fixture-4', '00000000-0000-4000-8000-000000000003', 'fixture-regular', 'Regular Season', '00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000012', '2026-09-13T10:00:00Z', 'finished', 3, 2, 1, true),
  ('00000000-0000-4000-8000-000000000025', 'pandascore', 'fixture-5', '00000000-0000-4000-8000-000000000003', 'fixture-regular', 'Regular Season', '00000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000013', '2026-09-14T10:00:00Z', 'finished', 3, 2, 0, true),
  ('00000000-0000-4000-8000-000000000026', 'pandascore', 'fixture-6', '00000000-0000-4000-8000-000000000003', 'fixture-regular', 'Regular Season', '00000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000014', '2026-09-15T10:00:00Z', 'finished', 3, 2, 0, true),
  ('00000000-0000-4000-8000-000000000027', 'pandascore', 'fixture-7', '00000000-0000-4000-8000-000000000003', 'fixture-regular', 'Regular Season', '00000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000013', '2026-09-16T10:00:00Z', 'finished', 3, 2, 1, true),
  ('00000000-0000-4000-8000-000000000028', 'pandascore', 'fixture-8', '00000000-0000-4000-8000-000000000003', 'fixture-regular', 'Regular Season', '00000000-0000-4000-8000-000000000013', '00000000-0000-4000-8000-000000000014', '2026-09-17T10:00:00Z', 'finished', 3, 2, 0, true),
  ('00000000-0000-4000-8000-000000000029', 'pandascore', 'fixture-9', '00000000-0000-4000-8000-000000000003', 'fixture-regular', 'Regular Season', '00000000-0000-4000-8000-000000000014', '00000000-0000-4000-8000-000000000013', '2026-09-18T10:00:00Z', 'finished', 3, 2, 0, true),
  ('00000000-0000-4000-8000-000000000030', 'pandascore', 'fixture-10', '00000000-0000-4000-8000-000000000003', 'fixture-regular', 'Regular Season', '00000000-0000-4000-8000-000000000013', '00000000-0000-4000-8000-000000000014', '2026-09-25T10:00:00Z', 'scheduled', 3, null, null, true)
on conflict (provider, provider_id) do update set status = excluded.status, home_score = excluded.home_score, away_score = excluded.away_score, scheduled_at = excluded.scheduled_at;
