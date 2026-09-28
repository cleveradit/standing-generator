export type DatabaseSeasonRow = {
  id: string;
  provider_id: string;
  name: string;
  starts_at: string | null;
  ends_at: string | null;
  rules: unknown;
  last_synced_at: string | null;
};

export type DatabaseTeamRow = {
  id: string;
  provider_id: string;
  name: string;
  acronym: string | null;
  logo_url: string | null;
};

export type DatabaseMatchRow = {
  id: string;
  provider_id: string;
  season_id: string;
  tournament_id: string | null;
  tournament_name: string | null;
  home_team_id: string;
  away_team_id: string;
  scheduled_at: string | null;
  status: string;
  best_of: number;
  home_score: number | null;
  away_score: number | null;
  is_regular_season: boolean;
};
