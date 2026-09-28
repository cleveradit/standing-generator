import { readFile } from 'node:fs/promises';

async function loadIgnoredEnvironment() {
  try {
    const content = await readFile('.env.local.admin', 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2];
    }
  } catch (error) { if (error?.code !== 'ENOENT') throw error; }
}
function required(name) { const value = process.env[name]?.trim(); if (!value) throw new Error(`${name} wajib diisi.`); return value; }
await loadIgnoredEnvironment();
const url = required('SUPABASE_URL');
const serviceKey = required('SUPABASE_SERVICE_ROLE_KEY');
const serviceHeaders = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' };
const invokeResponse = await fetch(`${url}/rest/v1/rpc/trigger_local_scheduled_pandascore_sync`, { method: 'POST', headers: serviceHeaders, body: '{}' });
if (!invokeResponse.ok) throw new Error('Trigger pg_net scheduler lokal gagal dimulai.');
for (let attempt = 0; attempt < 30; attempt += 1) {
  const response = await fetch(`${url}/rest/v1/sync_logs?select=id,status&trigger=eq.scheduled&order=created_at.desc&limit=1`, { headers: serviceHeaders });
  const logs = await response.json().catch(() => []);
  const log = Array.isArray(logs) ? logs[0] : null;
  if (log?.status === 'success') {
    process.stdout.write(`Scheduler lokal menyelesaikan sync ${log.id}.\n`);
    process.exit(0);
  }
  if (log?.status === 'failed') throw new Error('Scheduler lokal mencatat sync gagal.');
  await new Promise((resolve) => setTimeout(resolve, 500));
}
throw new Error('Scheduler lokal tidak membuat sync log dalam batas waktu.');
