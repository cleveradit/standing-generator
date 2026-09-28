create extension if not exists pgcrypto;

create table public.games (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'pandascore' check (provider = 'pandascore'),
  provider_id text not null,
  name text not null check (length(trim(name)) > 0),
  slug text not null unique check (length(trim(slug)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_id)
);

create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete restrict,
  provider text not null default 'pandascore' check (provider = 'pandascore'),
  provider_id text not null,
  name text not null check (length(trim(name)) > 0),
  slug text not null check (length(trim(slug)) > 0),
  region text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_id),
  unique (game_id, slug)
);

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete restrict,
  provider text not null default 'pandascore' check (provider = 'pandascore'),
  provider_id text not null,
  name text not null check (length(trim(name)) > 0),
  status text not null check (status in ('upcoming', 'active', 'completed')),
  starts_at timestamptz,
  ends_at timestamptz,
  rules jsonb not null,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competition_id, provider, provider_id),
  check (ends_at is null or starts_at is null or ends_at >= starts_at),
  check (
    rules ? 'regularSeasonBestOf'
    and rules ? 'playoffCutoff'
    and rules ? 'upperBracketCutoff'
    and rules ? 'tiebreakers'
  )
);

create unique index seasons_one_active_idx on public.seasons ((status = 'active')) where status = 'active';

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'pandascore' check (provider = 'pandascore'),
  provider_id text not null,
  name text not null check (length(trim(name)) > 0),
  acronym text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_id)
);

create table public.season_teams (
  season_id uuid not null references public.seasons(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (season_id, team_id)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'pandascore' check (provider = 'pandascore'),
  provider_id text not null,
  season_id uuid not null references public.seasons(id) on delete cascade,
  tournament_id text,
  tournament_name text,
  home_team_id uuid not null references public.teams(id) on delete restrict,
  away_team_id uuid not null references public.teams(id) on delete restrict,
  scheduled_at timestamptz,
  status text not null check (status in ('scheduled', 'running', 'finished', 'cancelled', 'postponed')),
  best_of smallint not null check (best_of > 0 and best_of % 2 = 1),
  home_score smallint,
  away_score smallint,
  is_regular_season boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_id),
  check (home_team_id <> away_team_id),
  check ((home_score is null and away_score is null) or (home_score >= 0 and away_score >= 0)),
  check ((status <> 'finished') or (home_score is not null and away_score is not null)),
  check ((home_score is null and away_score is null) or home_score + away_score <= best_of),
  check ((status <> 'finished') or greatest(home_score, away_score) = ((best_of + 1) / 2))
);

create index matches_public_season_idx on public.matches (season_id, is_regular_season, scheduled_at);

create table public.sync_logs (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider = 'pandascore'),
  season_id uuid references public.seasons(id) on delete set null,
  trigger text not null check (trigger in ('manual', 'scheduled')),
  status text not null check (status in ('running', 'success', 'failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  records_created integer not null default 0 check (records_created >= 0),
  records_updated integer not null default 0 check (records_updated >= 0),
  error_message text,
  created_at timestamptz not null default now(),
  check ((status = 'running' and finished_at is null) or (status <> 'running' and finished_at is not null))
);

create index sync_logs_season_created_idx on public.sync_logs (season_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger games_set_updated_at before update on public.games for each row execute function public.set_updated_at();
create trigger competitions_set_updated_at before update on public.competitions for each row execute function public.set_updated_at();
create trigger seasons_set_updated_at before update on public.seasons for each row execute function public.set_updated_at();
create trigger teams_set_updated_at before update on public.teams for each row execute function public.set_updated_at();
create trigger matches_set_updated_at before update on public.matches for each row execute function public.set_updated_at();
