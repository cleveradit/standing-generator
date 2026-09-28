import type { Team } from '../domain/season-snapshot';
import type { TeamSimulationResult } from '../engine/types';

type ProbabilityTableProps = {
  results: readonly TeamSimulationResult[];
  teams: readonly Team[];
  isSimulating: boolean;
};

const asPercentage = (value: number) => new Intl.NumberFormat('id-ID', {
  style: 'percent',
  maximumFractionDigits: 1,
}).format(value);

export function ProbabilityTable({ results, teams, isSimulating }: ProbabilityTableProps) {
  const teamsById = new Map(teams.map((team) => [team.id, team]));

  return (
    <section aria-labelledby="probability-title" className="card">
      <p className="eyebrow">Peluang skenario</p>
      <h2 id="probability-title">Probabilitas playoff</h2>
      <p className="muted">Setiap hasil pertandingan yang belum dikunci diberi bobot sama. Ini bukan prediksi kekuatan tim.</p>
      {isSimulating ? <p role="status">Menghitung simulasi…</p> : null}
      {results.length > 0 ? (
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th scope="col">Tim</th><th scope="col">Upper Bracket</th><th scope="col">Playoff</th><th scope="col">Tidak Lolos</th></tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.teamId}>
                  <td>{teamsById.get(result.teamId)?.name ?? result.teamId}</td>
                  <td>{asPercentage(result.upperBracketProbability)}</td>
                  <td>{asPercentage(result.playoffProbability)}</td>
                  <td>{asPercentage(result.eliminatedProbability)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
