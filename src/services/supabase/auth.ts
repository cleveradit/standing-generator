import { getSupabaseClient } from './client';

export async function signInAdmin(email: string, password: string): Promise<void> {
  const { error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
  if (error !== null) {
    throw new Error('Email atau password admin tidak valid.');
  }
}

export async function signOutAdmin(): Promise<void> {
  const { error } = await getSupabaseClient().auth.signOut();
  if (error !== null) {
    throw new Error('Sesi admin belum dapat diakhiri.');
  }
}

export async function getAdminSession() {
  const { data, error } = await getSupabaseClient().auth.getSession();
  if (error !== null) {
    throw new Error('Sesi admin belum dapat diperiksa.');
  }
  return data.session;
}
