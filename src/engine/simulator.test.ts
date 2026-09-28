import type { Match, Season, Team } from '../domain/season-snapshot';
import { legalScorelines, simulate } from './simulator';

const teams: Team[] = [
  { id: 'a', providerId: 'a', name: 'A', acronym: 'A', logoUrl: null },
  { id: 'b', providerId: 'b', name: 'B', acronym: 'B', logoUrl: null },
];
const season: Season = {
  id: 'season',
  providerId: 'season',
  name: 'Season',
  startsAt: null,
  endsAt: null,
  rules: {
    regularSeasonBestOf: 3,
    playoffCutoff: 2,
    upperBracketCutoff: 1,
    tiebreakers: ['match_wins', 'game_difference', 'head_to_head'],
  },
};
const remainingMatch: Match = {
  id: 'match-1',
  providerId: 'match-1',
  seasonId: 'season',
  tournamentId: 'regular',
  tournamentName: 'Regular Season',
  homeTeamId: 'a',
  awayTeamId: 'b',
  scheduledAt: null,
  status: 'scheduled',
  bestOf: 3,
  scoreline: null,
  isRegularSeason: true,
};

describe('simulate', () => {
  it('is deterministic for an equal seed', () => {
    const input = { season, teams, matches: [remainingMatch], locks: {}, iterations: 100, seed: 42 };

    expect(simulate(input)).toEqual(simulate(input));
  });

  it('honours locked results on every iteration', () => {
    const result = simulate({
      season,
      teams,
      matches: [remainingMatch],
      locks: { 'match-1': { home: 2, away: 0 } },
      iterations: 10,
      seed: 9,
    });

    expect(result).toEqual([
      expect.objectContaining({ teamId: 'a', upperBracketProbability: 1, playoffProbability: 1, eliminatedProbability: 0 }),
      expect.objectContaining({ teamId: 'b', upperBracketProbability: 0, playoffProbability: 1, eliminatedProbability: 0 }),
    ]);
  });

  it('uses inclusive cutoffs and rejects invalid simulation input', () => {
    expect(legalScorelines(3)).toEqual([
      { home: 2, away: 0 },
      { home: 0, away: 2 },
      { home: 2, away: 1 },
      { home: 1, away: 2 },
    ]);
    expect(() => simulate({ season, teams, matches: [], locks: {}, iterations: 0 })).toThrow(
      'Simulation iterations must be a positive integer.',
    );
  });
});
