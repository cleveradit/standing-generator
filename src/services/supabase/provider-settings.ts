import { getSupabaseClient } from './client';

export type SyncHistoryItem = {
  id: string;
  trigger: 'manual' | 'scheduled';
  status: 'running' | 'success' | 'failed';
  startedAt: string;
  finishedAt: string | null;
  recordsCreated: number;
  recordsUpdated: number;
  errorMessage: string | null;
};

export type ProviderSettings = {
  provider: 'pandascore';
  configured: boolean;
  updatedAt: string | null;
  sync: {
    status: 'idle' | SyncHistoryItem['status'];
    lastAttemptAt: string | null;
    lastSuccessfulAt: string | null;
    history: SyncHistoryItem[];
  };
};

function mapHistory(input: unknown): SyncHistoryItem[] {
  if (!Array.isArray(input)) throw new Error('Respons pengaturan provider tidak valid.');
  return input.map((item) => {
    if (typeof item !== 'object' || item === null) throw new Error('Respons pengaturan provider tidak valid.');
    const value = item as Record<string, unknown>;
    if (typeof value.id !== 'string'
      || (value.trigger !== 'manual' && value.trigger !== 'scheduled')
      || (value.status !== 'running' && value.status !== 'success' && value.status !== 'failed')
      || typeof value.startedAt !== 'string'
      || (value.finishedAt !== null && typeof value.finishedAt !== 'string')
      || typeof value.recordsCreated !== 'number'
      || typeof value.recordsUpdated !== 'number'
      || (value.errorMessage !== null && typeof value.errorMessage !== 'string')) {
      throw new Error('Respons pengaturan provider tidak valid.');
    }
    return value as SyncHistoryItem;
  });
}

function mapSettings(data: unknown): ProviderSettings {
  if (typeof data !== 'object' || data === null) throw new Error('Respons pengaturan provider tidak valid.');
  const value = data as Record<string, unknown>;
  if (value.provider !== 'pandascore' || typeof value.configured !== 'boolean' || (value.updatedAt !== null && typeof value.updatedAt !== 'string') || typeof value.sync !== 'object' || value.sync === null) {
    throw new Error('Respons pengaturan provider tidak valid.');
  }
  const sync = value.sync as Record<string, unknown>;
  if ((sync.status !== 'idle' && sync.status !== 'running' && sync.status !== 'success' && sync.status !== 'failed')
    || (sync.lastAttemptAt !== null && typeof sync.lastAttemptAt !== 'string')
    || (sync.lastSuccessfulAt !== null && typeof sync.lastSuccessfulAt !== 'string')) {
    throw new Error('Respons pengaturan provider tidak valid.');
  }
  return {
    provider: 'pandascore',
    configured: value.configured,
    updatedAt: value.updatedAt as string | null,
    sync: {
      status: sync.status,
      lastAttemptAt: sync.lastAttemptAt as string | null,
      lastSuccessfulAt: sync.lastSuccessfulAt as string | null,
      history: mapHistory(sync.history),
    },
  };
}

async function invoke(method: 'GET' | 'PUT', body?: { apiToken: string }): Promise<ProviderSettings> {
  const { data, error } = await getSupabaseClient().functions.invoke('provider-settings', { method, body });
  if (error !== null) throw new Error('Pengaturan PandaScore belum dapat diproses.');
  return mapSettings(data);
}

export function getProviderSettings(): Promise<ProviderSettings> { return invoke('GET'); }
export function savePandaScoreToken(apiToken: string): Promise<ProviderSettings> { return invoke('PUT', { apiToken }); }
