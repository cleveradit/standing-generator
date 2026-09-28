import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;

function readPublicEnvironment(name: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_PUBLISHABLE_KEY'): string {
  const value = import.meta.env[name]?.trim();
  if (value === undefined || value.length === 0) {
    throw new Error(`${name} belum dikonfigurasi. Jalankan npm run supabase:status lalu isi .env.local.`);
  }
  return value;
}

export function getSupabaseClient(): SupabaseClient {
  if (browserClient === null) {
    browserClient = createClient(
      readPublicEnvironment('VITE_SUPABASE_URL'),
      readPublicEnvironment('VITE_SUPABASE_PUBLISHABLE_KEY'),
    );
  }
  return browserClient;
}

export function resetSupabaseClientForTest(): void {
  browserClient = null;
}
