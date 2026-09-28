import type { ProviderSnapshot } from './pandascore.ts';

export const localPandaScoreFixture: ProviderSnapshot = {
  providerSeasonId: 'fixture-sync-season',
  seasonName: 'PandaScore Local Fixture Season',
  startsAt: '2026-09-01T00:00:00Z',
  endsAt: '2026-10-01T00:00:00Z',
  teams: [
    { providerId: 'sync-a', name: 'Sync A', acronym: 'SA', logoUrl: null },
    { providerId: 'sync-b', name: 'Sync B', acronym: 'SB', logoUrl: null },
    { providerId: 'sync-c', name: 'Sync C', acronym: 'SC', logoUrl: null },
    { providerId: 'sync-d', name: 'Sync D', acronym: 'SD', logoUrl: null },
  ],
  matches: [
    { providerId: 'sync-match-1', tournamentId: 'sync-regular', tournamentName: 'Regular Season', homeProviderId: 'sync-a', awayProviderId: 'sync-b', scheduledAt: '2026-09-10T10:00:00Z', status: 'finished', bestOf: 3, homeScore: 2, awayScore: 0, isRegularSeason: true },
    { providerId: 'sync-match-2', tournamentId: 'sync-regular', tournamentName: 'Regular Season', homeProviderId: 'sync-a', awayProviderId: 'sync-c', scheduledAt: '2026-09-11T10:00:00Z', status: 'finished', bestOf: 3, homeScore: 2, awayScore: 0, isRegularSeason: true },
    { providerId: 'sync-match-3', tournamentId: 'sync-regular', tournamentName: 'Regular Season', homeProviderId: 'sync-a', awayProviderId: 'sync-d', scheduledAt: '2026-09-12T10:00:00Z', status: 'finished', bestOf: 3, homeScore: 2, awayScore: 0, isRegularSeason: true },
    { providerId: 'sync-match-4', tournamentId: 'sync-regular', tournamentName: 'Regular Season', homeProviderId: 'sync-a', awayProviderId: 'sync-b', scheduledAt: '2026-09-13T10:00:00Z', status: 'finished', bestOf: 3, homeScore: 2, awayScore: 1, isRegularSeason: true },
    { providerId: 'sync-match-5', tournamentId: 'sync-regular', tournamentName: 'Regular Season', homeProviderId: 'sync-b', awayProviderId: 'sync-c', scheduledAt: '2026-09-14T10:00:00Z', status: 'finished', bestOf: 3, homeScore: 2, awayScore: 0, isRegularSeason: true },
    { providerId: 'sync-match-6', tournamentId: 'sync-regular', tournamentName: 'Regular Season', homeProviderId: 'sync-b', awayProviderId: 'sync-d', scheduledAt: '2026-09-15T10:00:00Z', status: 'finished', bestOf: 3, homeScore: 2, awayScore: 0, isRegularSeason: true },
    { providerId: 'sync-match-7', tournamentId: 'sync-regular', tournamentName: 'Regular Season', homeProviderId: 'sync-b', awayProviderId: 'sync-c', scheduledAt: '2026-09-16T10:00:00Z', status: 'finished', bestOf: 3, homeScore: 2, awayScore: 1, isRegularSeason: true },
    { providerId: 'sync-match-8', tournamentId: 'sync-regular', tournamentName: 'Regular Season', homeProviderId: 'sync-c', awayProviderId: 'sync-d', scheduledAt: '2026-09-17T10:00:00Z', status: 'finished', bestOf: 3, homeScore: 2, awayScore: 0, isRegularSeason: true },
    { providerId: 'sync-match-9', tournamentId: 'sync-regular', tournamentName: 'Regular Season', homeProviderId: 'sync-d', awayProviderId: 'sync-c', scheduledAt: '2026-09-18T10:00:00Z', status: 'finished', bestOf: 3, homeScore: 2, awayScore: 0, isRegularSeason: true },
    { providerId: 'sync-match-10', tournamentId: 'sync-regular', tournamentName: 'Regular Season', homeProviderId: 'sync-c', awayProviderId: 'sync-d', scheduledAt: '2026-09-25T10:00:00Z', status: 'scheduled', bestOf: 3, homeScore: null, awayScore: null, isRegularSeason: true },
  ],
};
