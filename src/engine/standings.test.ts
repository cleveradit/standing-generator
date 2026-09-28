import type { Match, Team } from '../domain/season-snapshot';
import { calculateStandings } from './standings';

const team = (id: string): Team => ({ id, providerId: id, name: id, acronym: null, logoUrl: null });
const match = (overrides: Partial<Match>): Match => ({
  id: 'match-1',
  providerId: 'match-1',
  seasonId: 'season',
  tournamentId: 'regular',
  tournamentName: 'Regular Season',
  homeTeamId: 'a',
  awayTeamId: 'b',
  scheduledAt: null,
  status: 'finished',
  bestOf: 3,
  scoreline: { home: 2, away: 0 },
  isRegularSeason: true,
  ...overrides,
});

describe('calculateStandings', () => {
  it('calculates match and game statistics from finished results', () => {
    const standings = calculateStandings(
      [team('a'), team('b')],
      [match({ scoreline: { home: 2, away: 0 } }), match({ id: 'match-2', scoreline: { home: 1, away: 2 } })],
    );

    expect(standings).toEqual([
      { teamId: 'a', matchWins: 1, matchLosses: 1, gameWins: 3, gameLosses: 2, gameDifference: 1 },
      { teamId: 'b', matchWins: 1, matchLosses: 1, gameWins: 2, gameLosses: 3, gameDifference: -1 },
    ]);
  });

  it('keeps teams with no finished match at zero and ignores postponed matches', () => {
    expect(calculateStandings([team('a')], [match({ status: 'postponed', scoreline: null })])).toEqual([
      { teamId: 'a', matchWins: 0, matchLosses: 0, gameWins: 0, gameLosses: 0, gameDifference: 0 },
    ]);
  });

  it('rejects a finished match without a legal scoreline', () => {
    expect(() => calculateStandings([team('a'), team('b')], [match({ scoreline: null })])).toThrow(
      'Finished match match-1 has an invalid scoreline.',
    );
  });
});
