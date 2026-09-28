import { execFileSync, spawn } from 'node:child_process';
import { writeFile, rm } from 'node:fs/promises';

function command(command, args) { return execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }); }
function localStatus() {
  const output = command('npx', ['supabase', 'status', '--output', 'env']);
  return Object.fromEntries(output.split(/\r?\n/).flatMap((line) => { const index = line.indexOf('='); return index > 0 ? [[line.slice(0, index), line.slice(index + 1).replace(/^"|"$/g, '')]] : []; }));
}
async function waitFor(url) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { if ((await fetch(url)).ok) return; } catch { /* retry */ }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${url}`);
}
async function waitForReachable(url) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { await fetch(url); return; } catch { await new Promise((resolve) => setTimeout(resolve, 500)); }
  }
  throw new Error(`Timed out waiting for ${url}`);
}

command('npm', ['run', 'supabase:start']);
await waitForReachable('http://127.0.0.1:54321/auth/v1/health');
command('npm', ['run', 'supabase:reset']);
const status = localStatus();
const url = status.API_URL ?? status.SUPABASE_URL;
const publishableKey = status.PUBLISHABLE_KEY ?? status.ANON_KEY;
const serviceRoleKey = status.SERVICE_ROLE_KEY;
if (!url || !publishableKey || !serviceRoleKey) throw new Error('Supabase local status tidak memuat credential yang dibutuhkan.');
await writeFile('.env.local', `VITE_SUPABASE_URL=${url}\nVITE_SUPABASE_PUBLISHABLE_KEY=${publishableKey}\n`);
await writeFile('.env.local.admin', `SUPABASE_URL=${url}\nSUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}\nLOCAL_ADMIN_EMAIL=local-admin@example.test\nLOCAL_ADMIN_PASSWORD=local-admin-password\n`);
await writeFile('supabase/functions/.env', 'PANDASCORE_SERIES_ID=fixture-series\nPANDASCORE_TEST_MODE=true\n');
const functions = spawn('npx', ['supabase', 'functions', 'serve', '--env-file', 'supabase/functions/.env'], { stdio: 'inherit' });
try {
  await waitForReachable(`${url}/functions/v1/provider-settings`);
  const anonymousSettings = await fetch(`${url}/functions/v1/provider-settings`);
  if (anonymousSettings.status !== 401) throw new Error('Endpoint provider-settings harus menolak request tanpa JWT.');
  command('npm', ['run', 'admin:create-local']);
  command('npm', ['run', 'build']);
  command('npm', ['run', 'test', '--', '--run']);
  const vite = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1'], { stdio: 'ignore' });
  try {
    await waitFor('http://127.0.0.1:5173');
    command('npx', ['playwright', 'test']);
    command('npm', ['run', 'scheduler:trigger-local']);
  } finally { vite.kill('SIGTERM'); }
} finally {
  functions.kill('SIGTERM');
  await rm('.env.local.admin', { force: true });
  await rm('supabase/functions/.env', { force: true });
}
