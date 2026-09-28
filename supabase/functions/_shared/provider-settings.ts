import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

export class ProviderSettingsError extends Error {}

export async function getPandaScoreToken(client: SupabaseClient): Promise<string> {
  const { data, error } = await client.rpc('get_pandascore_token');
  if (error !== null || typeof data !== 'string' || data.trim().length === 0) throw new ProviderSettingsError('PandaScore secret is unavailable.');
  return data;
}

export async function getPandaScoreSettings(client: SupabaseClient): Promise<{ configured: boolean; updatedAt: string | null }> {
  const { data, error } = await client.rpc('get_pandascore_settings');
  if (error !== null) throw new ProviderSettingsError('PandaScore settings are unavailable.');
  const row = Array.isArray(data) ? data[0] : null;
  return { configured: row !== null, updatedAt: row?.updated_at ?? null };
}

export async function setPandaScoreToken(client: SupabaseClient, token: string): Promise<{ configured: boolean; updatedAt: string | null }> {
  const { data, error } = await client.rpc('set_pandascore_token', { next_token: token });
  if (error !== null || typeof data !== 'string') throw new ProviderSettingsError('PandaScore token could not be stored.');
  return { configured: true, updatedAt: data };
}
