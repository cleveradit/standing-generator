import { useState, type FormEvent, type ReactElement } from 'react';
import { signInAdmin } from '../../services/supabase/auth';

export function AdminSignInForm(props: { onSuccess: () => void }): ReactElement {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await signInAdmin(email, password);
      props.onSuccess();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Login admin gagal.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return <section className="card admin-card">
    <h2>Login admin</h2>
    <p className="muted">Gunakan akun admin lokal yang dibuat melalui perintah provisioning.</p>
    <form onSubmit={onSubmit} className="admin-form">
      <label>Email<input required autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label>Password<input required autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      {error !== null ? <p role="alert">{error}</p> : null}
      <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Memproses…' : 'Masuk'}</button>
    </form>
  </section>;
}
