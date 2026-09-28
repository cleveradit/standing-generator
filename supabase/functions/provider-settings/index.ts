import { authorizationResponse, requireAdmin, serviceClient } from '../_shared/auth.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { getPandaScoreSettings, setPandaScoreToken } from '../_shared/provider-settings.ts';
import { validatePandaScoreToken } from '../_shared/pandascore.ts';

type SyncLogRow = {
  id: string;
  trigger: 'manual' | 'scheduled';
  status: 'running' | 'success' | 'failed';
  started_at: string;
  finished_at: string | null;
  records_created: number;
  records_updated: number;
  error_message: string | null;
};

async function dashboardResponse(client: ReturnType<typeof serviceClient>) {
  const [settings, { data: logs, error: logsError }] = await Promise.all([
    getPandaScoreSettings(client),
    client.from('sync_logs').select('id, trigger, status, started_at, finished_at, records_created, records_updated, error_message').order('started_at', { ascending: false }).limit(10),
  ]);
  if (logsError !== null) throw new Error('Unable to load sync history.');

  const history = ((logs ?? []) as SyncLogRow[]).map((log) => ({
    id: log.id,
    trigger: log.trigger,
    status: log.status,
    startedAt: log.started_at,
    finishedAt: log.finished_at,
    recordsCreated: log.records_created,
    recordsUpdated: log.records_updated,
    errorMessage: log.error_message,
  }));
  const latest = history[0] ?? null;
  const latestSuccess = history.find((log) => log.status === 'success') ?? null;

  return {
    provider: 'pandascore' as const,
    ...settings,
    sync: {
      status: latest?.status ?? 'idle',
      lastAttemptAt: latest?.startedAt ?? null,
      lastSuccessfulAt: latestSuccess?.finishedAt ?? null,
      history,
    },
  };
}

Deno.serve(async (request: Request): Promise<Response> => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    await requireAdmin(request);
    const client = serviceClient();
    if (request.method === 'GET') {
      return json(200, await dashboardResponse(client));
    }
    if (request.method !== 'PUT') return json(405, { error: 'Method not allowed.' });
    const input = await request.json().catch(() => null) as { apiToken?: unknown } | null;
    const apiToken = typeof input?.apiToken === 'string' ? input.apiToken.trim() : '';
    if (apiToken.length < 8) return json(422, { error: 'Token PandaScore tidak valid.' });
    await validatePandaScoreToken(apiToken);
    await setPandaScoreToken(client, apiToken);
    return json(200, await dashboardResponse(client));
  } catch (error) {
    const response = authorizationResponse(error);
    if (response !== null) return response;
    return json(502, { error: 'Token PandaScore tidak dapat divalidasi atau disimpan.' });
  }
});
