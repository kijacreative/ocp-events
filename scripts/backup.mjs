#!/usr/bin/env node
/**
 * Backup and restore the event tracker over the Supabase REST API.
 *
 * Free-tier Supabase projects get no automatic backups, so this stands in for
 * them. It needs only the publishable key the app already uses — no database
 * password, no CLI login.
 *
 *   npm run backup                 write a timestamped dump
 *   npm run restore -- <file> --yes  push a dump back up
 *
 * Dumps hold staff pay rates and revenue. Keep them out of the public repo —
 * point OCP_BACKUP_DIR at Dropbox, Drive, or anywhere private.
 */

import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const TABLES = ["events", "event_staff", "deliverables"];
const PAGE = 1000;
const KEEP = Number(process.env.OCP_BACKUP_KEEP || 30);

/** Minimal .env.local reader, so the script needs no dependencies. */
function loadEnv() {
  const file = path.join(process.cwd(), ".env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

loadEnv();

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!URL_BASE || !KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or the publishable key.\n" +
      "Set them in .env.local or the environment."
  );
  process.exit(1);
}

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function fetchAll(table) {
  const rows = [];
  for (let offset = 0; ; offset += PAGE) {
    const url =
      `${URL_BASE}/rest/v1/${table}` +
      `?select=*&order=id.asc&limit=${PAGE}&offset=${offset}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`${table}: HTTP ${res.status} ${await res.text()}`);
    const page = await res.json();
    rows.push(...page);
    if (page.length < PAGE) return rows;
  }
}

async function backup() {
  const dir = process.env.OCP_BACKUP_DIR || path.join(process.cwd(), "backups");
  await mkdir(dir, { recursive: true });

  const data = {};
  for (const t of TABLES) {
    data[t] = await fetchAll(t);
    console.log(`  ${t.padEnd(14)} ${data[t].length} rows`);
  }

  const now = new Date();
  const stamp =
    now.toISOString().slice(0, 10) +
    "-" +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0");
  const file = path.join(dir, `ocp-events-${stamp}.json`);

  await writeFile(
    file,
    JSON.stringify({ taken_at: now.toISOString(), source: URL_BASE, tables: data }, null, 2)
  );
  console.log(`\nWrote ${file}`);

  // Retention: keep the newest KEEP dumps, drop the rest.
  const dumps = (await readdir(dir))
    .filter((f) => /^ocp-events-.*\.json$/.test(f))
    .sort();
  const stale = dumps.slice(0, Math.max(0, dumps.length - KEEP));
  for (const f of stale) await unlink(path.join(dir, f));
  if (stale.length) console.log(`Pruned ${stale.length} dump(s) beyond the newest ${KEEP}.`);
}

async function restore(file, confirmed) {
  if (!confirmed) {
    console.error(
      "Restore overwrites rows that share an id with the dump.\n" +
        `Re-run with --yes if that's what you want:\n\n  npm run restore -- ${file} --yes\n`
    );
    process.exit(1);
  }
  const dump = JSON.parse(await readFile(file, "utf8"));
  console.log(`Restoring dump taken ${dump.taken_at}\n`);

  // events first — the other two reference it.
  for (const t of TABLES) {
    const rows = dump.tables[t] ?? [];
    if (!rows.length) {
      console.log(`  ${t.padEnd(14)} nothing to do`);
      continue;
    }
    const res = await fetch(`${URL_BASE}/rest/v1/${t}?on_conflict=id`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(rows),
    });
    if (!res.ok) throw new Error(`${t}: HTTP ${res.status} ${await res.text()}`);
    console.log(`  ${t.padEnd(14)} ${rows.length} rows restored`);
  }
  console.log("\nDone.");
}

const args = process.argv.slice(2);
const restoreIdx = args.findIndex((a) => !a.startsWith("--"));

if (args.includes("--restore") || (restoreIdx !== -1 && args[restoreIdx].endsWith(".json"))) {
  await restore(args[restoreIdx], args.includes("--yes"));
} else {
  await backup();
}
