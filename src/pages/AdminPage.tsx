import { useCallback, useEffect, useState } from 'react';
import { AdminSignInForm } from '../components/admin/AdminSignInForm';
import { ProviderSettingsForm } from '../components/admin/ProviderSettingsForm';
import { getAdminSession, signOutAdmin } from '../services/supabase/auth';
import { getProviderSettings, type ProviderSettings } from '../services/supabase/provider-settings';
import { runPandaScoreSync } from '../services/supabase/sync';

type AdminState = 'loading' | 'signed-out' | 'ready' | 'error';

function formatTime(value: string | null): string {
  return value === null ? 'Belum ada' : new Date(value).toLocaleString('id-ID');
}

export function AdminPage() {
  const [state, setState] = useState<AdminState>('loading');
  const [settings, setSettings] = useState<ProviderSettings | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const load = useCallback(async () => {
    setState('loading');
    setMessage(null);
    try {
      const session = await getAdminSession();
      if (session === null) {
        setState('signed-out');
        return;
      }
      setSettings(await getProviderSettings());
      setState('ready');
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : 'Panel admin belum dapat dimuat.');
      setState('error');
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function syncNow() {
    setIsSyncing(true);
    setMessage(null);
    try {
      const result = await runPandaScoreSync();
      setMessage(`Sinkronisasi selesai: ${result.matchCount} pertandingan diperbarui.`);
      setSettings(await getProviderSettings());
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : 'Sinkronisasi gagal.');
    } finally {
      setIsSyncing(false);
    }
  }

  async function logout() {
    await signOutAdmin();
    setSettings(null);
    setState('signed-out');
  }

  return <main className="app-shell">
    <header className="page-header">
      <div><p className="eyebrow">Standing Generator</p><h1>Admin lokal</h1></div>
      {state === 'ready' ? <button className="secondary-button" type="button" onClick={() => void logout()}>Keluar</button> : <a className="secondary-button link-button" href="/">Simulator publik</a>}
    </header>
    {state === 'loading' ? <p className="status-card" role="status">Memeriksa sesi admin…</p> : null}
    {state === 'signed-out' ? <AdminSignInForm onSuccess={() => void load()} /> : null}
    {state === 'error' ? <section className="status-card" role="alert"><p>{message}</p><button className="primary-button" type="button" onClick={() => void load()}>Coba lagi</button></section> : null}
    {state === 'ready' && settings !== null ? <div className="page-grid">
      <ProviderSettingsForm settings={settings} onSaved={setSettings} />
      <section className="card admin-card"><h2>Sinkronisasi</h2><p className="muted">Pembaruan manual memakai service yang sama dengan scheduler lokal.</p><button className="primary-button" type="button" disabled={!settings.configured || isSyncing} onClick={() => void syncNow()}>{isSyncing ? 'Menyinkronkan…' : 'Sinkronkan sekarang'}</button>{!settings.configured ? <p className="muted">Simpan token PandaScore terlebih dahulu.</p> : null}</section>
      <section className="card admin-card">
        <h2>Status sinkronisasi</h2>
        <p className="muted">Status saat ini: <strong>{settings.sync.status}</strong></p>
        <p className="muted">Sinkronisasi terakhir: {formatTime(settings.sync.lastAttemptAt)}</p>
        <p className="muted">Sinkronisasi terakhir berhasil: {formatTime(settings.sync.lastSuccessfulAt)}</p>
        {settings.sync.history.length === 0 ? <p className="muted">Belum ada riwayat sinkronisasi.</p> : (
          <div className="table-scroll">
            <table>
              <caption>Riwayat sinkronisasi</caption>
              <thead><tr><th>Waktu</th><th>Pemicu</th><th>Status</th><th>Perubahan</th></tr></thead>
              <tbody>{settings.sync.history.map((entry) => <tr key={entry.id}>
                <td>{formatTime(entry.startedAt)}</td><td>{entry.trigger}</td><td>{entry.status}</td><td>{entry.recordsCreated + entry.recordsUpdated}</td>
              </tr>)}</tbody>
            </table>
          </div>
        )}
      </section>
      {message !== null ? <p className="status-card" role="status">{message}</p> : null}
    </div> : null}
  </main>;
}
