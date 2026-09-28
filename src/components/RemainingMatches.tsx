import type { Match, Scoreline, Team } from '../domain/season-snapshot';
import { legalScorelines } from '../engine/simulator';

type RemainingMatchesProps = {
  matches: readonly Match[];
  teams: readonly Team[];
  locks: Readonly<Record<string, Scoreline | undefined>>;
  onLock: (matchId: string, scoreline: Scoreline | null) => void;
  onReset: () => void;
};

function scorelineLabel(scoreline: Scoreline): string {
  return `${scoreline.home}-${scoreline.away}`;
}

function sameScoreline(left: Scoreline | undefined, right: Scoreline): boolean {
  return left?.home === right.home && left.away === right.away;
}

export function RemainingMatches({ matches, teams, locks, onLock, onReset }: RemainingMatchesProps) {
  const teamsById = new Map(teams.map((team) => [team.id, team]));
  const eligible = matches.filter(
    (match) => match.isRegularSeason && (match.status === 'scheduled' || match.status === 'running' || match.status === 'postponed'),
  );
  const groups = new Map<string, Match[]>();

  for (const match of eligible) {
    const date = match.scheduledAt === null
      ? 'Jadwal belum ditentukan'
      : new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date(match.scheduledAt));
    groups.set(date, [...(groups.get(date) ?? []), match]);
  }

  return (
    <section aria-labelledby="matches-title" className="card">
      <div className="section-heading">
        <div><p className="eyebrow">Simulator</p><h2 id="matches-title">Pertandingan tersisa</h2></div>
        <button className="secondary-button" type="button" onClick={onReset} disabled={Object.keys(locks).length === 0}>Reset skenario</button>
      </div>
      {eligible.length === 0 ? <p className="muted">Tidak ada pertandingan regular season tersisa.</p> : null}
      {[...groups.entries()].map(([date, dateMatches]) => (
        <div className="match-day" key={date}>
          <h3>{date}</h3>
          {dateMatches.map((match) => {
            const lock = locks[match.id];
            return (
              <article className="match" key={match.id}>
                <p>{teamsById.get(match.homeTeamId)?.name ?? match.homeTeamId} <span aria-hidden="true">vs</span> {teamsById.get(match.awayTeamId)?.name ?? match.awayTeamId}</p>
                <div aria-label="Pilih hasil pertandingan" className="score-buttons">
                  <button type="button" aria-pressed={lock === undefined} onClick={() => onLock(match.id, null)}>?</button>
                  {legalScorelines(match.bestOf).map((scoreline) => (
                    <button
                      type="button"
                      key={scorelineLabel(scoreline)}
                      aria-pressed={sameScoreline(lock, scoreline)}
                      onClick={() => onLock(match.id, scoreline)}
                    >
                      {scorelineLabel(scoreline)}
                    </button>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      ))}
    </section>
  );
}
