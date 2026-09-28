import type { SeasonSnapshot } from '../domain/season-snapshot';
import { getSupabaseClient } from './supabase/client';
import { loadActiveSeasonSnapshot } from './supabase/season-snapshot';

export class SeasonApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SeasonApiError';
  }
}

export async function getSeasonSnapshot(signal?: AbortSignal): Promise<SeasonSnapshot> {
  if (signal?.aborted) {
    throw new SeasonApiError('Permintaan data season dibatalkan.');
  }
  try {
    return await loadActiveSeasonSnapshot(getSupabaseClient());
  } catch {
    throw new SeasonApiError('Database lokal belum dapat memuat season aktif.');
  }
}
