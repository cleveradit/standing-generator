import { readFile } from 'node:fs/promises';

async function loadIgnoredEnvironment() {
  try {
    const content = await readFile('.env.local.admin', 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2];
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} wajib diisi melalui environment atau .env.local.admin (file ini di-ignore).`);
  return value;
}

async function request(url, options) {
  const response = await fetch(url, options);
  const body = await response.json().catch(() => null);
  return { response, body };
}

await loadIgnoredEnvironment();
const url = required('SUPABASE_URL');
const key = required('SUPABASE_SERVICE_ROLE_KEY');
const email = required('LOCAL_ADMIN_EMAIL').toLowerCase();
const password = required('LOCAL_ADMIN_PASSWORD');
if (password.length < 8) throw new Error('LOCAL_ADMIN_PASSWORD minimal 8 karakter.');
const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

let { response, body } = await request(`${url}/auth/v1/admin/users`, { method: 'POST', headers, body: JSON.stringify({ email, password, email_confirm: true }) });
let user = body?.user ?? body;
if (!response.ok && response.status === 422) {
  ({ response, body } = await request(`${url}/auth/v1/admin/users?page=1&per_page=1000`, { headers }));
  user = body?.users?.find((candidate) => candidate.email?.toLowerCase() === email);
  if (!response.ok || !user?.id) throw new Error('Akun admin lokal yang ada tidak dapat ditemukan.');
  ({ response, body } = await request(`${url}/auth/v1/admin/users/${user.id}`, { method: 'PUT', headers, body: JSON.stringify({ password, email_confirm: true }) }));
  user = body?.user ?? body;
}
if (!response.ok || !user?.id) throw new Error(`Akun admin lokal tidak dapat dibuat (HTTP ${response.status}).`);

({ response } = await request(`${url}/rest/v1/admin_users?on_conflict=user_id`, { method: 'POST', headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ user_id: user.id }) }));
if (!response.ok) throw new Error('Membership admin lokal tidak dapat disimpan.');
process.stdout.write(`Admin lokal siap untuk ${email}.\n`);
