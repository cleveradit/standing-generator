import { createClient } from 'npm:@supabase/supabase-js@2';
import { json } from './cors.ts';

const url = Deno.env.get('SUPABASE_URL') ?? '';
const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

function serviceClient() {
  return createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

export class AuthorizationError extends Error {
  constructor(readonly status: 401 | 403) { super(status === 401 ? 'Unauthenticated' : 'Forbidden'); }
}

export async function requireAdmin(request: Request): Promise<{ userId: string }> {
  const authorization = request.headers.get('authorization');
  if (authorization === null || !authorization.startsWith('Bearer ')) throw new AuthorizationError(401);
  const client = createClient(url, anonKey, { global: { headers: { Authorization: authorization } }, auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await client.auth.getUser();
  if (error !== null || data.user === null) throw new AuthorizationError(401);
  const { data: allowed, error: membershipError } = await serviceClient().from('admin_users').select('user_id').eq('user_id', data.user.id).maybeSingle();
  if (membershipError !== null || allowed === null) throw new AuthorizationError(403);
  return { userId: data.user.id };
}

export async function isScheduledRequest(request: Request): Promise<boolean> {
  const provided = request.headers.get('x-local-scheduler-secret');
  if (provided === null || provided.length === 0) return false;
  const { data, error } = await serviceClient().rpc('get_local_scheduler_secret');
  return error === null && typeof data === 'string' && provided === data;
}

export function authorizationResponse(error: unknown): Response | null {
  return error instanceof AuthorizationError ? json(error.status, { error: error.status === 401 ? 'Authentication is required.' : 'Admin access is required.' }) : null;
}

export { serviceClient };
