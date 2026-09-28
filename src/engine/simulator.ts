import type { Match, Scoreline } from '../domain/season-snapshot';
import { createRandom } from './random';
import { calculateStandings } from './standings';
import { rankStandings } from './tiebreaker';
import type { SimulationInput, TeamSimulationResult } from './types';

const DEFAULT_ITERATIONS = 50_000;

export function legalScorelines(bestOf: number): Scoreline[] {
  if (!Number.isInteger(bestOf) || bestOf < 1 || bestOf % 2 === 0) {
    throw new Error(`Best-of value ${bestOf} is not supported.`);
  }

  const winsRequired = Math.ceil(bestOf / 2);
  const results: Scoreline[] = [];

  for (let losingScore = 0; losingScore < winsRequired; losingScore += 1) {
    results.push({ home: winsRequired, away: losingScore });
    results.push({ home: losingScore, away: winsRequired });
  }

  return results;
}

function sameScoreline(left: Scoreline, right: Scoreline): boolean {
  return left.home === right.home && left.away === right.away;
}

function remainingMatches(matches: readonly Match[]): Match[] {
  return matches.filter(
    (match) =>
      match.isRegularSeason &&
      (match.status === 'scheduled' || match.status === 'running' || match.status === 'postponed'),
  );
}

export function simulate(input: SimulationInput): TeamSimulationResult[] {
  const iterations = input.iterations ?? DEFAULT_ITERATIONS;

  if (!Number.isInteger(iterations) || iterations <= 0) {
    throw new Error('Simulation iterations must be a positive integer.');
  }

  if (
    input.season.rules.upperBracketCutoff < 1 ||
    input.season.rules.playoffCutoff < input.season.rules.upperBracketCutoff
  ) {
    throw new Error('Season playoff cutoffs are invalid.');
  }

  const remaining = remainingMatches(input.matches);
  const remainingById = new Map(remaining.map((match) => [match.id, match]));

  for (const [matchId, lockedScoreline] of Object.entries(input.locks)) {
    if (lockedScoreline === undefined) {
      continue;
    }

    const match = remainingById.get(matchId);

    if (match === undefined || !legalScorelines(match.bestOf).some((scoreline) => sameScoreline(scoreline, lockedScoreline))) {
      throw new Error(`Scenario lock for match ${matchId} is invalid.`);
    }
  }

  const random = createRandom(input.seed);
  const counters = new Map(input.teams.map((team) => [team.id, { upper: 0, playoff: 0, eliminated: 0 }]));
  const completed = input.matches.filter((match) => match.status === 'finished');

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const simulated = remaining.map((match) => {
      const locked = input.locks[match.id];
      const outcomes = legalScorelines(match.bestOf);
      const scoreline = locked ?? outcomes[Math.floor(random() * outcomes.length)];
      return { ...match, status: 'finished' as const, scoreline };
    });
    const standings = calculateStandings(input.teams, [...completed, ...simulated]);
    const ranked = rankStandings(standings, [...completed, ...simulated], input.season.rules);

    for (const standing of ranked) {
      const counter = counters.get(standing.teamId);

      if (counter === undefined) {
        throw new Error(`Simulation ranking contains unknown team ${standing.teamId}.`);
      }

      if (standing.rank <= input.season.rules.upperBracketCutoff) {
        counter.upper += 1;
      }

      if (standing.rank <= input.season.rules.playoffCutoff) {
        counter.playoff += 1;
      } else {
        counter.eliminated += 1;
      }
    }
  }

  return input.teams.map((team) => {
    const counter = counters.get(team.id);

    if (counter === undefined) {
      throw new Error(`Simulation counter is missing team ${team.id}.`);
    }

    return {
      teamId: team.id,
      upperBracketProbability: counter.upper / iterations,
      playoffProbability: counter.playoff / iterations,
      eliminatedProbability: counter.eliminated / iterations,
    };
  });
}
