import { execFileSync, spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';

function command(commandName, args, options = {}) {
  return execFileSync(commandName, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], ...options });
}

function parseStatus() {
  const output = command('npx', ['supabase', 'status', '--output', 'env']);
  return Object.fromEntries(output.split(/\r?\n/).flatMap((line) => {
    const separator = line.indexOf('=');
    return separator > 0 ? [[line.slice(0, separator), line.slice(separator + 1).replace(/^"|"$/g, '')]] : [];
  }));
}

async function waitForReachable(url) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      await fetch(url);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error(`Edge Function lokal tidak dapat dijangkau: ${url}`);
}

let status;
try {
  status = parseStatus();
} catch {
  command('npx', ['supabase', 'start'], { stdio: 'inherit' });
  status = parseStatus();
}

const url = status.API_URL ?? status.SUPABASE_URL;
const publishableKey = status.PUBLISHABLE_KEY ?? status.ANON_KEY;
const serviceRoleKey = status.SERVICE_ROLE_KEY;

if (!url || !publishableKey || !serviceRoleKey) {
  throw new Error('Supabase lokal tidak mengembalikan credential yang dibutuhkan. Jalankan npm run supabase:status untuk memeriksa stack.');
}

await writeFile('.env.local', `VITE_SUPABASE_URL=${url}\nVITE_SUPABASE_PUBLISHABLE_KEY=${publishableKey}\n`);
command('node', ['scripts/create-local-admin.mjs'], {
  env: {
    ...process.env,
    SUPABASE_URL: url,
    SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
    LOCAL_ADMIN_EMAIL: 'local-admin@example.test',
    LOCAL_ADMIN_PASSWORD: 'local-admin-password',
  },
});

const functions = spawn('npx', ['supabase', 'functions', 'serve', '--env-file', 'supabase/functions/.env.local-fixture'], { stdio: 'inherit' });
let vite;

function stop(signal) {
  functions.kill(signal);
  vite?.kill(signal);
}

process.once('SIGINT', () => { stop('SIGTERM'); process.exitCode = 0; });
process.once('SIGTERM', () => { stop('SIGTERM'); process.exitCode = 0; });

try {
  await waitForReachable(`${url}/functions/v1/provider-settings`);
  vite = spawn('npx', ['vite', ...process.argv.slice(2)], { stdio: 'inherit' });
  await new Promise((resolve, reject) => {
    vite.once('exit', (code) => code === 0 ? resolve() : reject(new Error(`Vite berhenti dengan kode ${code ?? 'tidak diketahui'}.`)));
    vite.once('error', reject);
  });
} finally {
  functions.kill('SIGTERM');
}
