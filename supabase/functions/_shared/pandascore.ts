import { localPandaScoreFixture } from './pandascore-fixture.ts';

export type ProviderTeam = { providerId: string; name: string; acronym: string | null; logoUrl: string | null };
export type ProviderMatch = {
  providerId: string; tournamentId: string | null; tournamentName: string | null; homeProviderId: string; awayProviderId: string;
  scheduledAt: string | null; status: 'scheduled' | 'running' | 'finished' | 'cancelled' | 'postponed'; bestOf: number;
  homeScore: number | null; awayScore: number | null; isRegularSeason: boolean;
};
export type ProviderSnapshot = { providerSeasonId: string; seasonName: string; startsAt: string | null; endsAt: string | null; teams: ProviderTeam[]; matches: ProviderMatch[] };

const origin = 'https://api.pandascore.co';
type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue | null => typeof value === 'object' && value !== null && !Array.isArray(value) ? value as RecordValue : null;
const id = (value: unknown): string | null => typeof value === 'string' && value.trim() ? value : typeof value === 'number' && Number.isSafeInteger(value) ? String(value) : null;
const text = (value: unknown): string | null => typeof value === 'string' && value.trim() ? value : null;
const positive = (value: unknown): number | null => typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : null;

function status(value: unknown): ProviderMatch['status'] {
  if (value === 'finished' || value === 'running' || value === 'postponed') return value;
  if (value === 'cancelled' || value === 'canceled') return 'cancelled';
  return 'scheduled';
}

async function pandaFetch(path: string, token: string, query?: URLSearchParams): Promise<unknown> {
  const url = new URL(path, origin);
  if (url.origin !== origin) throw new Error('Invalid provider request.');
  if (query !== undefined) url.search = query.toString();
  const response = await fetch(url, { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error(`PandaScore HTTP ${response.status}`);
  return response.json();
}

export async function validatePandaScoreToken(token: string): Promise<void> {
  if (Deno.env.get('PANDASCORE_TEST_MODE') === 'true') return;
  await pandaFetch('/videogames', token, new URLSearchParams({ 'page[size]': '1' }));
}

export async function fetchPandaScoreSeasonSnapshot(apiToken: string, seriesId: string, regularSeasonTournamentId?: string): Promise<ProviderSnapshot> {
  if (Deno.env.get('PANDASCORE_TEST_MODE') === 'true') {
    return localPandaScoreFixture;
  }
  const rawSeason = record(await pandaFetch(`/series/${encodeURIComponent(seriesId)}`, apiToken));
  const providerSeasonId = id(rawSeason?.id);
  const seasonName = text(rawSeason?.full_name) ?? text(rawSeason?.name);
  if (providerSeasonId === null || seasonName === null) throw new Error('PandaScore season response is incomplete.');
  const rawMatches: unknown[] = [];
  for (let page = 1; page <= 100; page += 1) {
    const response = await pandaFetch(`/series/${encodeURIComponent(seriesId)}/matches`, apiToken, new URLSearchParams({ 'page[number]': String(page), 'page[size]': '100' }));
    if (!Array.isArray(response)) throw new Error('PandaScore matches response is invalid.');
    rawMatches.push(...response);
    if (response.length < 100) break;
    if (page === 100) throw new Error('PandaScore pagination safety limit reached.');
  }
  const teams = new Map<string, ProviderTeam>();
  const matches = rawMatches.map((raw): ProviderMatch => {
    const match = record(raw);
    const providerId = id(match?.id);
    const opponents = Array.isArray(match?.opponents) ? match?.opponents : [];
    if (providerId === null || opponents.length !== 2) throw new Error('PandaScore match is incomplete.');
    const resolveTeam = (value: unknown): ProviderTeam => {
      const opponent = record(record(value)?.opponent); const providerIdValue = id(opponent?.id); const name = text(opponent?.name);
      if (providerIdValue === null || name === null) throw new Error('PandaScore opponent is incomplete.');
      const team = { providerId: providerIdValue, name, acronym: text(opponent?.acronym), logoUrl: text(opponent?.image_url) };
      teams.set(team.providerId, team); return team;
    };
    const home = resolveTeam(opponents[0]); const away = resolveTeam(opponents[1]); const tournament = record(match?.tournament);
    const scores = new Map<string, number>();
    if (Array.isArray(match?.results)) for (const result of match.results) { const item = record(result); const teamId = id(item?.team_id); const score = positive(item?.score) ?? (item?.score === 0 ? 0 : null); if (teamId !== null && score !== null) scores.set(teamId, score); }
    const nextStatus = status(match?.status); const homeScore = scores.get(home.providerId) ?? null; const awayScore = scores.get(away.providerId) ?? null;
    if (nextStatus === 'finished' && (homeScore === null || awayScore === null)) throw new Error('Finished PandaScore match is missing scores.');
    const tournamentId = id(tournament?.id); const tournamentName = text(tournament?.name);
    return { providerId, tournamentId, tournamentName, homeProviderId: home.providerId, awayProviderId: away.providerId, scheduledAt: text(match?.scheduled_at), status: nextStatus, bestOf: positive(match?.number_of_games) ?? 3, homeScore, awayScore, isRegularSeason: regularSeasonTournamentId ? tournamentId === regularSeasonTournamentId : /regular\s+season/i.test(tournamentName ?? '') };
  });
  return { providerSeasonId, seasonName, startsAt: text(rawSeason?.begin_at), endsAt: text(rawSeason?.end_at), teams: [...teams.values()], matches };
}
