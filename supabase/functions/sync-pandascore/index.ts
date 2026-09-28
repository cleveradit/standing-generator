import { authorizationResponse, isScheduledRequest, requireAdmin, serviceClient } from '../_shared/auth.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { syncConfiguredPandaScoreSeason } from '../_shared/season-sync.ts';

Deno.serve(async (request: Request): Promise<Response> => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json(405, { error: 'Method not allowed.' });
  try {
    const scheduled = await isScheduledRequest(request);
    if (!scheduled) await requireAdmin(request);
    const result = await syncConfiguredPandaScoreSeason(serviceClient(), scheduled ? 'scheduled' : 'manual');
    return json(200, { syncLogId: result.syncLogId, seasonId: result.seasonId, matchCount: result.matchCount });
  } catch (error) {
    const response = authorizationResponse(error);
    if (response !== null) return response;
    console.error('PandaScore sync failed safely:', error instanceof Error ? error.message : 'unknown error');
    return json(502, { error: 'Sinkronisasi PandaScore gagal tanpa mengubah snapshot publik terakhir.' });
  }
});
