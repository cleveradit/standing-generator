import { useState, type FormEvent, type ReactElement } from 'react';
import { savePandaScoreToken, type ProviderSettings } from '../../services/supabase/provider-settings';

export function ProviderSettingsForm(props: { settings: ProviderSettings; onSaved: (settings: ProviderSettings) => void }): ReactElement {
  const [apiToken, setApiToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const saved = await savePandaScoreToken(apiToken);
      setApiToken('');
      props.onSaved(saved);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Token PandaScore belum dapat disimpan.');
      setApiToken('');
    } finally {
      setIsSaving(false);
    }
  }

  return <section className="card admin-card">
    <h2>API key PandaScore</h2>
    <p className="muted">{props.settings.configured ? `Terkonfigurasi${props.settings.updatedAt === null ? '' : ` terakhir diperbarui ${new Date(props.settings.updatedAt).toLocaleString('id-ID')}`}.` : 'Belum dikonfigurasi.'}</p>
    <form onSubmit={onSubmit} className="admin-form">
      <label>Token baru<input required minLength={8} autoComplete="off" type="password" value={apiToken} onChange={(event) => setApiToken(event.target.value)} /></label>
      <p className="muted">Nilai token bersifat write-only dan tidak dapat ditampilkan kembali.</p>
      {error !== null ? <p role="alert">{error}</p> : null}
      <button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Menyimpan…' : 'Simpan token'}</button>
    </form>
  </section>;
}
