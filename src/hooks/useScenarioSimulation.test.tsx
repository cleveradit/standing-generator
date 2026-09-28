import { act, renderHook } from '@testing-library/react';
import type { SeasonSnapshot } from '../domain/season-snapshot';
import { useScenarioSimulation } from './useScenarioSimulation';

const snapshot: SeasonSnapshot = {
  fetchedAt: '2026-09-21T00:00:00Z',
  season: {
    id: 'season', providerId: 'season', name: 'Season', startsAt: null, endsAt: null,
    rules: { regularSeasonBestOf: 3, playoffCutoff: 2, upperBracketCutoff: 1, tiebreakers: ['match_wins', 'game_difference', 'head_to_head'] },
  },
  teams: [
    { id: 'a', providerId: 'a', name: 'Team A', acronym: 'A', logoUrl: null },
    { id: 'b', providerId: 'b', name: 'Team B', acronym: 'B', logoUrl: null },
  ],
  matches: [{
    id: 'match', providerId: 'match', seasonId: 'season', tournamentId: 'regular', tournamentName: 'Regular Season',
    homeTeamId: 'a', awayTeamId: 'b', scheduledAt: '2026-09-21T10:00:00Z', status: 'scheduled', bestOf: 3,
    scoreline: null, isRegularSeason: true,
  }],
};

describe('useScenarioSimulation', () => {
  it('locks, unlocks, and resets scenario state locally', () => {
    const { result } = renderHook(() => useScenarioSimulation(snapshot));

    act(() => result.current.setLock('match', { home: 2, away: 0 }));
    expect(result.current.locks).toEqual({ match: { home: 2, away: 0 } });

    act(() => result.current.setLock('match', null));
    expect(result.current.locks).toEqual({});

    act(() => result.current.setLock('match', { home: 2, away: 1 }));
    act(() => result.current.reset());
    expect(result.current.locks).toEqual({});
  });
});
