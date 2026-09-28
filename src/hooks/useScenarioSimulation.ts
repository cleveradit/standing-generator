import { useCallback, useEffect, useState } from 'react';
import type { Scoreline, SeasonSnapshot } from '../domain/season-snapshot';
import { simulate } from '../engine/simulator';
import type { TeamSimulationResult } from '../engine/types';

export type ScenarioSimulationState = {
  locks: Readonly<Record<string, Scoreline | undefined>>;
  results: TeamSimulationResult[];
  isSimulating: boolean;
  error: string | null;
  setLock: (matchId: string, result: Scoreline | null) => void;
  reset: () => void;
};

export function useScenarioSimulation(snapshot: SeasonSnapshot | null): ScenarioSimulationState {
  const [locks, setLocks] = useState<Record<string, Scoreline | undefined>>({});
  const [results, setResults] = useState<TeamSimulationResult[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocks({});
  }, [snapshot?.season.id]);

  useEffect(() => {
    if (snapshot === null) {
      setResults([]);
      setError(null);
      setIsSimulating(false);
      return undefined;
    }

    let cancelled = false;
    setIsSimulating(true);
    const timer = window.setTimeout(() => {
      try {
        const nextResults = simulate({
          season: snapshot.season,
          teams: snapshot.teams,
          matches: snapshot.matches,
          locks,
        });

        if (!cancelled) {
          setResults(nextResults);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
          setError('Simulasi belum dapat dijalankan karena aturan atau data season tidak lengkap.');
        }
      } finally {
        if (!cancelled) {
          setIsSimulating(false);
        }
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [locks, snapshot]);

  const setLock = useCallback((matchId: string, result: Scoreline | null) => {
    setLocks((current) => {
      const next = { ...current };

      if (result === null) {
        delete next[matchId];
      } else {
        next[matchId] = result;
      }

      return next;
    });
  }, []);

  const reset = useCallback(() => setLocks({}), []);

  return { locks, results, isSimulating, error, setLock, reset };
}
