import { getSupabaseClient } from './client';

export type SyncResult = { syncLogId: string; seasonId: string; matchCount: number };

export async function runPandaScoreSync(): Promise<SyncResult> {
  const { data, error } = await getSupabaseClient().functions.invoke('sync-pandascore', { method: 'POST' });
  if (error !== null || typeof data !== 'object' || data === null) {
    throw new Error('Sinkronisasi PandaScore belum dapat dijalankan.');
  }
  const result = data as Record<string, unknown>;
  if (typeof result.syncLogId !== 'string' || typeof result.seasonId !== 'string' || typeof result.matchCount !== 'number') {
    throw new Error('Respons sinkronisasi tidak valid.');
  }
  return { syncLogId: result.syncLogId, seasonId: result.seasonId, matchCount: result.matchCount };
}
