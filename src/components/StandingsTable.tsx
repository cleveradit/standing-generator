import type { Team } from '../domain/season-snapshot';
import type { RankedStanding } from '../engine/types';

type StandingsTableProps = {
  standings: readonly RankedStanding[];
  teams: readonly Team[];
};

export function StandingsTable({ standings, teams }: StandingsTableProps) {
  const teamsById = new Map(teams.map((team) => [team.id, team]));

  return (
    <section aria-labelledby="standings-title" className="card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Klasemen saat ini</p>
          <h2 id="standings-title">Klasemen</h2>
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Peringkat</th>
              <th scope="col">Tim</th>
              <th scope="col">Match</th>
              <th scope="col">Game</th>
              <th scope="col">Selisih</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing) => {
              const team = teamsById.get(standing.teamId);
              return (
                <tr key={standing.teamId}>
                  <td>{standing.rank}</td>
                  <td>{team?.name ?? standing.teamId}</td>
                  <td>{standing.matchWins}–{standing.matchLosses}</td>
                  <td>{standing.gameWins}–{standing.gameLosses}</td>
                  <td>{standing.gameDifference > 0 ? '+' : ''}{standing.gameDifference}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
