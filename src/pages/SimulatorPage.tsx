import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SeasonSnapshot } from '../domain/season-snapshot';
import { calculateStandings } from '../engine/standings';
import { rankStandings } from '../engine/tiebreaker';
import { ProbabilityTable } from '../components/ProbabilityTable';
import { RemainingMatches } from '../components/RemainingMatches';
import { SeasonHeader } from '../components/SeasonHeader';
import { StandingsTable } from '../components/StandingsTable';
import { useScenarioSimulation } from '../hooks/useScenarioSimulation';
import { getSeasonSnapshot } from '../services/season-api';

type LoadState = 'loading' | 'ready' | 'error';

export function SimulatorPage() {
  const [snapshot, setSnapshot] = useState<SeasonSnapshot | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadSnapshot = useCallback(async (signal?: AbortSignal) => {
    setLoadState('loading');
    setLoadError(null);

    try {
      const nextSnapshot = await getSeasonSnapshot(signal);
      setSnapshot(nextSnapshot);
      setLoadState('ready');
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setSnapshot(null);
      setLoadState('error');
      setLoadError(error instanceof Error ? error.message : 'Data season belum dapat dimuat.');
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadSnapshot(controller.signal);
    return () => controller.abort();
  }, [loadSnapshot]);

  const simulation = useScenarioSimulation(snapshot);
  const rankedStandings = useMemo(() => {
    if (snapshot === null) {
      return { standings: [], error: null };
    }

    try {
      const standings = calculateStandings(snapshot.teams, snapshot.matches);
      return {
        standings: rankStandings(standings, snapshot.matches, snapshot.season.rules),
        error: null,
      };
    } catch {
      return {
        standings: [],
        error: 'Klasemen belum dapat diurutkan karena aturan atau data season tidak lengkap.',
      };
    }
  }, [snapshot]);

  return (
    <main className="app-shell">
      <SeasonHeader
        season={snapshot?.season ?? null}
        fetchedAt={snapshot?.fetchedAt ?? null}
        isRefreshing={loadState === 'loading'}
        onRefresh={() => void loadSnapshot()}
      />

      {loadState === 'loading' ? <p role="status" className="status-card">Memuat data season…</p> : null}
      {loadState === 'error' ? (
        <section className="status-card" role="alert">
          <h2>Data belum tersedia</h2>
          <p>{loadError}</p>
          <button className="primary-button" type="button" onClick={() => void loadSnapshot()}>Coba lagi</button>
        </section>
      ) : null}

      {snapshot !== null ? (
        <div className="page-grid">
          <ProbabilityTable results={simulation.results} teams={snapshot.teams} isSimulating={simulation.isSimulating} />
          {simulation.error !== null ? <p className="status-card" role="alert">{simulation.error}</p> : null}
          {rankedStandings.error !== null ? <p className="status-card" role="alert">{rankedStandings.error}</p> : null}
          {rankedStandings.standings.length > 0 ? <StandingsTable standings={rankedStandings.standings} teams={snapshot.teams} /> : null}
          {snapshot.teams.length === 0 ? <p className="status-card">Tidak ada tim atau pertandingan pada season ini.</p> : null}
          <RemainingMatches
            matches={snapshot.matches}
            teams={snapshot.teams}
            locks={simulation.locks}
            onLock={simulation.setLock}
            onReset={simulation.reset}
          />
        </div>
      ) : null}
    </main>
  );
}
