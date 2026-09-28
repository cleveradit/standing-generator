import type { Match, SeasonRules, TieBreakerRule } from '../domain/season-snapshot';
import { calculateStandings } from './standings';
import type { RankedStanding, TeamStanding } from './types';

export class UnresolvedTieError extends Error {
  constructor(teamIds: readonly string[]) {
    super(`The configured tiebreakers cannot rank: ${teamIds.join(', ')}.`);
    this.name = 'UnresolvedTieError';
  }
}

type Metric = readonly number[];

function compareMetric(left: Metric, right: Metric): number {
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return right[index] - left[index];
    }
  }

  return 0;
}

function metricFor(
  rule: TieBreakerRule,
  group: readonly TeamStanding[],
  matches: readonly Match[],
): Map<string, Metric> {
  if (rule === 'match_wins') {
    return new Map(group.map((standing) => [standing.teamId, [standing.matchWins]]));
  }

  if (rule === 'game_difference') {
    return new Map(group.map((standing) => [standing.teamId, [standing.gameDifference]]));
  }

  const ids = new Set(group.map((standing) => standing.teamId));
  const groupTeams = group.map((standing) => ({ id: standing.teamId }));
  const headToHeadMatches = matches.filter(
    (match) =>
      match.status === 'finished' &&
      ids.has(match.homeTeamId) &&
      ids.has(match.awayTeamId),
  );
  const headToHead = calculateStandings(groupTeams, headToHeadMatches);
  return new Map(headToHead.map((standing) => [standing.teamId, [standing.matchWins, standing.gameDifference]]));
}

function partitionByMetric(
  standings: readonly TeamStanding[],
  metrics: ReadonlyMap<string, Metric>,
): TeamStanding[][] {
  const sorted = [...standings].sort((left, right) =>
    compareMetric(metrics.get(left.teamId) ?? [], metrics.get(right.teamId) ?? []),
  );
  const groups: TeamStanding[][] = [];

  for (const standing of sorted) {
    const previous = groups.at(-1);
    const previousMetric = previous === undefined ? undefined : metrics.get(previous[0].teamId);
    const metric = metrics.get(standing.teamId);

    if (previous === undefined || compareMetric(previousMetric ?? [], metric ?? []) !== 0) {
      groups.push([standing]);
    } else {
      previous.push(standing);
    }
  }

  return groups;
}

function resolveGroup(
  group: readonly TeamStanding[],
  matches: readonly Match[],
  rules: SeasonRules,
  ruleIndex = 0,
): TeamStanding[] {
  if (group.length <= 1) {
    return [...group];
  }

  const rule = rules.tiebreakers[ruleIndex];

  if (rule === undefined) {
    throw new UnresolvedTieError(group.map((standing) => standing.teamId));
  }

  return partitionByMetric(group, metricFor(rule, group, matches)).flatMap((partition) =>
    resolveGroup(partition, matches, rules, ruleIndex + 1),
  );
}

export function rankStandings(
  standings: readonly TeamStanding[],
  matches: readonly Match[],
  rules: SeasonRules,
): RankedStanding[] {
  const ordered = resolveGroup(standings, matches, rules);

  return ordered.map((standing, index) => ({
    ...standing,
    rank: index + 1,
    tiebreakerReason: rules.tiebreakers.join(' → '),
  }));
}
