import type { Match, Scoreline, Season, Team } from '../domain/season-snapshot';

export type TeamStanding = {
  teamId: string;
  matchWins: number;
  matchLosses: number;
  gameWins: number;
  gameLosses: number;
  gameDifference: number;
};

export type RankedStanding = TeamStanding & {
  rank: number;
  tiebreakerReason: string;
};

export type SimulationInput = {
  season: Season;
  teams: readonly Team[];
  matches: readonly Match[];
  locks: Readonly<Record<string, Scoreline | undefined>>;
  iterations?: number;
  seed?: number;
};

export type TeamSimulationResult = {
  teamId: string;
  upperBracketProbability: number;
  playoffProbability: number;
  eliminatedProbability: number;
};
