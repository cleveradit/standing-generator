import type { Match, SeasonRules } from '../domain/season-snapshot';
import { rankStandings, UnresolvedTieError } from './tiebreaker';
import type { TeamStanding } from './types';

const rules: SeasonRules = {
  regularSeasonBestOf: 3,
  playoffCutoff: 2,
  upperBracketCutoff: 1,
  tiebreakers: ['match_wins', 'game_difference', 'head_to_head'],
};

const standings: TeamStanding[] = [
  { teamId: 'a', matchWins: 3, matchLosses: 1, gameWins: 6, gameLosses: 3, gameDifference: 3 },
  { teamId: 'b', matchWins: 3, matchLosses: 1, gameWins: 6, gameLosses: 4, gameDifference: 2 },
];

const headToHeadMatch: Match = {
  id: 'a-b', providerId: 'a-b', seasonId: 'season', tournamentId: 'regular', tournamentName: 'Regular Season',
  homeTeamId: 'a', awayTeamId: 'b', scheduledAt: null, status: 'finished', bestOf: 3,
  scoreline: { home: 2, away: 1 }, isRegularSeason: true,
};

describe('rankStandings', () => {
  it('orders standings by configured match wins then game difference', () => {
    expect(rankStandings(standings, [], rules).map(({ teamId, rank }) => ({ teamId, rank }))).toEqual([
      { teamId: 'a', rank: 1 },
      { teamId: 'b', rank: 2 },
    ]);
  });

  it('rejects a tie that the configured rules cannot resolve', () => {
    const tied = standings.map((standing) => ({ ...standing, gameDifference: 2 }));

    expect(() => rankStandings(tied, [] as Match[], rules)).toThrow(UnresolvedTieError);
  });

  it('uses head-to-head only after prior configured metrics remain tied', () => {
    const tied = standings.map((standing) => ({ ...standing, gameDifference: 2 }));

    expect(rankStandings(tied, [headToHeadMatch], rules).map((standing) => standing.teamId)).toEqual(['a', 'b']);
  });
});
