import type { SupabaseClient } from '@supabase/supabase-js';
import {
  DEFAULT_SEASON_RULES,
  type Match,
  type MatchStatus,
  type SeasonRules,
  type SeasonSnapshot,
} from '../../domain/season-snapshot';
import type { DatabaseMatchRow, DatabaseSeasonRow, DatabaseTeamRow } from '../../types/database';

export class EmptyActiveSeasonError extends Error {
  constructor() {
    super('Belum ada season aktif pada database lokal. Jalankan sync dari /admin atau reset fixture lokal.');
    this.name = 'EmptyActiveSeasonError';
  }
}

function toRules(value: unknown): SeasonRules {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Aturan season pada database tidak valid.');
  }

  const rules = value as Record<string, unknown>;
  const validNumber = (input: unknown): input is number => typeof input === 'number' && Number.isInteger(input) && input > 0;
  const validTieBreaker = (input: unknown): input is SeasonRules['tiebreakers'][number] =>
    input === 'match_wins' || input === 'game_difference' || input === 'head_to_head';

  if (!validNumber(rules.regularSeasonBestOf)
    || !validNumber(rules.playoffCutoff)
    || !validNumber(rules.upperBracketCutoff)
    || !Array.isArray(rules.tiebreakers)
    || !rules.tiebreakers.every(validTieBreaker)) {
    throw new Error('Aturan season pada database tidak lengkap.');
  }

  return {
    regularSeasonBestOf: rules.regularSeasonBestOf,
    playoffCutoff: rules.playoffCutoff,
    upperBracketCutoff: rules.upperBracketCutoff,
    tiebreakers: rules.tiebreakers,
  };
}

function toMatch(row: DatabaseMatchRow): Match {
  const statuses: readonly MatchStatus[] = ['scheduled', 'running', 'finished', 'cancelled', 'postponed'];
  if (!statuses.includes(row.status as MatchStatus)) {
    throw new Error('Status pertandingan pada database tidak didukung.');
  }

  return {
    id: row.id,
    providerId: row.provider_id,
    seasonId: row.season_id,
    tournamentId: row.tournament_id,
    tournamentName: row.tournament_name,
    homeTeamId: row.home_team_id,
    awayTeamId: row.away_team_id,
    scheduledAt: row.scheduled_at,
    status: row.status as MatchStatus,
    bestOf: row.best_of,
    scoreline: row.home_score === null || row.away_score === null ? null : { home: row.home_score, away: row.away_score },
    isRegularSeason: row.is_regular_season,
  };
}

export async function loadActiveSeasonSnapshot(client: SupabaseClient): Promise<SeasonSnapshot> {
  const { data: seasonData, error: seasonError } = await client
    .from('seasons')
    .select('id, provider_id, name, starts_at, ends_at, rules, last_synced_at')
    .eq('status', 'active')
    .maybeSingle<DatabaseSeasonRow>();

  if (seasonError !== null) {
    throw new Error('Database lokal tidak dapat memuat season aktif.');
  }
  if (seasonData === null) {
    throw new EmptyActiveSeasonError();
  }

  const [{ data: teamsData, error: teamsError }, { data: matchesData, error: matchesError }] = await Promise.all([
    client.from('season_teams').select('teams(id, provider_id, name, acronym, logo_url)').eq('season_id', seasonData.id),
    client.from('matches').select('id, provider_id, season_id, tournament_id, tournament_name, home_team_id, away_team_id, scheduled_at, status, best_of, home_score, away_score, is_regular_season').eq('season_id', seasonData.id).order('scheduled_at', { ascending: true }),
  ]);

  if (teamsError !== null || matchesError !== null) {
    throw new Error('Database lokal tidak dapat memuat pertandingan season.');
  }

  const teams = (teamsData ?? []).flatMap((row) => {
    const candidate = row.teams;
    return Array.isArray(candidate) ? candidate : candidate === null ? [] : [candidate];
  }) as DatabaseTeamRow[];

  return {
    season: {
      id: seasonData.id,
      providerId: seasonData.provider_id,
      name: seasonData.name,
      startsAt: seasonData.starts_at,
      endsAt: seasonData.ends_at,
      rules: toRules(seasonData.rules ?? DEFAULT_SEASON_RULES),
    },
    teams: teams.map((team) => ({ id: team.id, providerId: team.provider_id, name: team.name, acronym: team.acronym, logoUrl: team.logo_url })),
    matches: ((matchesData ?? []) as DatabaseMatchRow[]).map(toMatch),
    fetchedAt: seasonData.last_synced_at ?? new Date(0).toISOString(),
  };
}
