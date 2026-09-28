import type { Match, Team } from '../domain/season-snapshot';
import type { TeamStanding } from './types';

function isValidFinishedMatch(match: Match): boolean {
  const scoreline = match.scoreline;
  return (
    match.status === 'finished' &&
    scoreline !== null &&
    Number.isInteger(scoreline.home) &&
    Number.isInteger(scoreline.away) &&
    scoreline.home >= 0 &&
    scoreline.away >= 0 &&
    scoreline.home !== scoreline.away &&
    Math.max(scoreline.home, scoreline.away) === Math.ceil(match.bestOf / 2)
  );
}

export function calculateStandings(teams: readonly Pick<Team, 'id'>[], matches: readonly Match[]): TeamStanding[] {
  const standings = new Map<string, TeamStanding>();

  for (const team of teams) {
    standings.set(team.id, {
      teamId: team.id,
      matchWins: 0,
      matchLosses: 0,
      gameWins: 0,
      gameLosses: 0,
      gameDifference: 0,
    });
  }

  for (const match of matches) {
    if (match.status !== 'finished') {
      continue;
    }

    const scoreline = match.scoreline;

    if (scoreline === null || !isValidFinishedMatch(match)) {
      throw new Error(`Finished match ${match.id} has an invalid scoreline.`);
    }

    const home = standings.get(match.homeTeamId);
    const away = standings.get(match.awayTeamId);

    if (home === undefined || away === undefined) {
      throw new Error(`Finished match ${match.id} references a team outside the season.`);
    }

    const homeWon = scoreline.home > scoreline.away;
    home.matchWins += homeWon ? 1 : 0;
    home.matchLosses += homeWon ? 0 : 1;
    home.gameWins += scoreline.home;
    home.gameLosses += scoreline.away;
    home.gameDifference = home.gameWins - home.gameLosses;

    away.matchWins += homeWon ? 0 : 1;
    away.matchLosses += homeWon ? 1 : 0;
    away.gameWins += scoreline.away;
    away.gameLosses += scoreline.home;
    away.gameDifference = away.gameWins - away.gameLosses;
  }

  return [...standings.values()];
}
