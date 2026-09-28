export type MatchStatus = 'scheduled' | 'running' | 'finished' | 'cancelled' | 'postponed';

export type TieBreakerRule = 'match_wins' | 'game_difference' | 'head_to_head';

export type SeasonRules = {
  regularSeasonBestOf: number;
  playoffCutoff: number;
  upperBracketCutoff: number;
  tiebreakers: readonly TieBreakerRule[];
};

export type Team = {
  id: string;
  providerId: string;
  name: string;
  acronym: string | null;
  logoUrl: string | null;
};

export type Scoreline = {
  home: number;
  away: number;
};

export type Match = {
  id: string;
  providerId: string;
  seasonId: string;
  tournamentId: string | null;
  tournamentName: string | null;
  homeTeamId: string;
  awayTeamId: string;
  scheduledAt: string | null;
  status: MatchStatus;
  bestOf: number;
  scoreline: Scoreline | null;
  isRegularSeason: boolean;
};

export type Season = {
  id: string;
  providerId: string;
  name: string;
  startsAt: string | null;
  endsAt: string | null;
  rules: SeasonRules;
};

export type SeasonSnapshot = {
  season: Season;
  teams: Team[];
  matches: Match[];
  fetchedAt: string;
};

export const DEFAULT_SEASON_RULES: SeasonRules = {
  regularSeasonBestOf: 3,
  playoffCutoff: 6,
  upperBracketCutoff: 2,
  tiebreakers: ['match_wins', 'game_difference', 'head_to_head'],
};
