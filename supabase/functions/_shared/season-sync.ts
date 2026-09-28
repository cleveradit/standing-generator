import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { fetchPandaScoreSeasonSnapshot } from './pandascore.ts';
import { getPandaScoreToken } from './provider-settings.ts';

const RULES = { regularSeasonBestOf: 3, playoffCutoff: 3, upperBracketCutoff: 2, tiebreakers: ['match_wins', 'game_difference', 'head_to_head'] };

export async function syncConfiguredPandaScoreSeason(client: SupabaseClient, trigger: 'manual' | 'scheduled'): Promise<{ syncLogId: string; seasonId: string; matchCount: number }> {
  const { data: log, error: logError } = await client.from('sync_logs').insert({ provider: 'pandascore', trigger, status: 'running' }).select('id').single();
  if (logError !== null || log === null) throw new Error('Unable to start sync log.');
  const syncLogId = log.id as string;
  let seasonId: string | null = null;
  try {
    const token = await getPandaScoreToken(client);
    const seriesId = Deno.env.get('PANDASCORE_SERIES_ID')?.trim();
    if (seriesId === undefined || seriesId.length === 0) throw new Error('PANDASCORE_SERIES_ID is missing.');
    const snapshot = await fetchPandaScoreSeasonSnapshot(token, seriesId, Deno.env.get('PANDASCORE_REGULAR_SEASON_TOURNAMENT_ID')?.trim());

    const { data: game, error: gameError } = await client.from('games').upsert({ provider: 'pandascore', provider_id: 'mobile-legends', name: 'Mobile Legends: Bang Bang', slug: 'mobile-legends' }, { onConflict: 'provider,provider_id' }).select('id').single();
    if (gameError !== null || game === null) throw new Error('Unable to persist game.');
    const { data: competition, error: competitionError } = await client.from('competitions').upsert({ game_id: game.id, provider: 'pandascore', provider_id: `series-${snapshot.providerSeasonId}`, name: snapshot.seasonName, slug: `series-${snapshot.providerSeasonId}`, region: 'ID' }, { onConflict: 'provider,provider_id' }).select('id').single();
    if (competitionError !== null || competition === null) throw new Error('Unable to persist competition.');
    await client.from('seasons').update({ status: 'completed' }).eq('status', 'active');
    const { data: season, error: seasonError } = await client.from('seasons').upsert({ competition_id: competition.id, provider: 'pandascore', provider_id: snapshot.providerSeasonId, name: snapshot.seasonName, status: 'active', starts_at: snapshot.startsAt, ends_at: snapshot.endsAt, rules: RULES, last_synced_at: new Date().toISOString() }, { onConflict: 'competition_id,provider,provider_id' }).select('id').single();
    if (seasonError !== null || season === null) throw new Error('Unable to persist season.');
    seasonId = season.id as string;
    const { error: teamError } = await client.from('teams').upsert(snapshot.teams.map((team) => ({ provider: 'pandascore', provider_id: team.providerId, name: team.name, acronym: team.acronym, logo_url: team.logoUrl })), { onConflict: 'provider,provider_id' });
    if (teamError !== null) throw new Error('Unable to persist teams.');
    const { data: teamRows, error: teamRowsError } = await client.from('teams').select('id, provider_id').eq('provider', 'pandascore').in('provider_id', snapshot.teams.map((team) => team.providerId));
    if (teamRowsError !== null || teamRows === null) throw new Error('Unable to resolve teams.');
    const teamIds = new Map(teamRows.map((team) => [team.provider_id as string, team.id as string]));
    if (teamIds.size !== snapshot.teams.length) throw new Error('Imported team IDs are incomplete.');
    const { error: membershipError } = await client.from('season_teams').upsert([...teamIds.values()].map((teamId) => ({ season_id: seasonId, team_id: teamId })), { onConflict: 'season_id,team_id' });
    if (membershipError !== null) throw new Error('Unable to persist season memberships.');
    const { error: matchError } = await client.from('matches').upsert(snapshot.matches.map((match) => ({ provider: 'pandascore', provider_id: match.providerId, season_id: seasonId, tournament_id: match.tournamentId, tournament_name: match.tournamentName, home_team_id: teamIds.get(match.homeProviderId), away_team_id: teamIds.get(match.awayProviderId), scheduled_at: match.scheduledAt, status: match.status, best_of: match.bestOf, home_score: match.homeScore, away_score: match.awayScore, is_regular_season: match.isRegularSeason })), { onConflict: 'provider,provider_id' });
    if (matchError !== null) throw new Error('Unable to persist matches.');
    const { error: successError } = await client.from('sync_logs').update({ season_id: seasonId, status: 'success', finished_at: new Date().toISOString(), records_created: snapshot.teams.length + snapshot.matches.length, records_updated: 0 }).eq('id', syncLogId);
    if (successError !== null) throw new Error('Unable to close sync log.');
    return { syncLogId, seasonId, matchCount: snapshot.matches.length };
  } catch (error) {
    console.error('PandaScore persistence failed safely:', error instanceof Error ? error.message : 'unknown error');
    await client.from('sync_logs').update({ season_id: seasonId, status: 'failed', finished_at: new Date().toISOString(), error_message: 'PandaScore synchronization failed safely.' }).eq('id', syncLogId);
    throw new Error(error instanceof Error && error.message.includes('PANDASCORE_SERIES_ID') ? 'PandaScore series is not configured.' : 'PandaScore synchronization failed.');
  }
}
