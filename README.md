# Oak Cliff Pilates — Event Call Sheet

A web app for tracking every event and every deadline leading up to it. Next.js + Supabase,
deployed on Vercel. Anyone with the link can read and edit.

**The core idea:** set an event date once, and all fifteen deliverables date themselves — each
one counts backward from the event by its own lead time. Move the date and every deadline moves
with it.

---

## What's in it

| Page | What it does |
|---|---|
| `/` | Call sheet. Next deadline up top, events on the books, what's due next with owners, workload by person, recap numbers for events that already happened. |
| `/events/new` | Create an event. Seeds the 15-item default checklist. |
| `/events/[id]` | The full brief — basics, what to bring, instructors, helpers, creative, marketing, post-event recap. Everything saves as you go. |
| `/tasks` | Every open deadline across every event, filterable by owner. |

Events move from "On the books" to "Already happened" on their own, the day after the event
date. Past events show attendance, revenue, leads and conversions instead of progress bars.

---

## Setup — about 15 minutes

### 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project. Save the database
   password somewhere safe; you won't need it for this app but you will if you ever connect
   directly.
2. Wait for it to finish provisioning (a minute or two).
3. Open **SQL Editor → New query**, paste the entire contents of `supabase/schema.sql`, and
   click **Run**. This creates three tables, sets up access, and inserts one example event.
   Then run `supabase/003-seed-events.sql` to replace that example with the 20 real events.
4. Open **Project Settings → API** and copy two values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **publishable** key (`sb_publishable_…`) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

   Older projects show an **anon public** JWT instead of a publishable key. That works too —
   set it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 2. Put the code on GitHub

```bash
cd ocp-events
git init
git add .
git commit -m "Event call sheet"
gh repo create ocp-events --private --source=. --push
```

No `gh` CLI? Create an empty repo on github.com, then:

```bash
git remote add origin https://github.com/YOURNAME/ocp-events.git
git push -u origin main
```

### 3. Deploy on Vercel

1. [vercel.com/new](https://vercel.com/new) → import the repo. Framework detects as Next.js;
   leave every build setting alone.
2. Before deploying, open **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | your project URL |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | your publishable key |

3. Deploy. You'll get a URL like `ocp-events.vercel.app`. Add a custom domain under
   **Settings → Domains** if you want something like `events.oakcliffpilates.com`.

If you deployed before adding the env vars, add them and hit **Redeploy** — they only take
effect on a fresh build.

### 4. Run it locally (optional)

```bash
cp .env.example .env.local   # fill in your two keys
npm install
npm run dev                  # http://localhost:3000
```

---

## The SQL files

Run them in order. Each is safe to re-run except where noted.

| File | What it does |
|---|---|
| `schema.sql` | Creates the three tables. **Drops and rebuilds them**, so running it again wipes everything. |
| `003-seed-events.sql` | Loads the 20 events from the Google Sheet and removes the example event. Adds the `format` column and the `Partner Event` type. Seeds the 15-item checklist for upcoming events only — past events get recap figures instead. |
| `002-require-auth.sql` | Revokes anonymous access. Run it **last**, and only after the team has been invited. |

Numbered out of order on purpose: seed the data while access is still open, then close it.

## Who can get in

Access is by invitation. The app signs nobody up: it emails a one-time link to an address that
already has an account, and does nothing at all for one that doesn't. The publishable key on its
own opens nothing, which matters because it ships in the browser bundle where anyone can read it.

### Setting it up — order matters

Tightening the database before the accounts exist locks everyone out, including you.

1. **Invite the team.** Supabase → **Authentication → Users → Invite user**, one address each:

   | | |
   |---|---|
   | Kiel | Owner |
   | Amanda | Owner |
   | Charley | Studio Manager |
   | Stephanie | Social Media Manager |
   | Abby | PR Manager |
   | Isabel | Events Manager |

   Everyone signed in is a peer — all six see and edit every event.

2. **Turn off public signups.** Authentication → Providers → Email, and disable *Enable signups*.
   Belt and braces: the app already passes `shouldCreateUser: false`, but this closes the door at
   the database too.

3. **Add the site URL.** Authentication → URL Configuration → Site URL, set to your Vercel domain.
   Magic links redirect there, so a wrong value sends people to localhost.

4. **Run the migration.** Paste `supabase/002-require-auth.sql` into the SQL Editor and run it.
   This is the step that actually revokes anonymous access. Do it last.

### Adding or removing someone

Invite them under Authentication → Users, and add their first name to `OWNERS` in
`src/lib/types.ts` so they show up in the owner dropdowns. Removing is the reverse — delete the
user to cut off access. Taking a name out of `OWNERS` only hides it from the pickers; deliverables
already assigned to that person keep showing it.

---

## Backups

Free Supabase projects get **no automatic backups at all**. Daily backups start on the Pro plan,
and Point-in-Time Recovery is a paid add-on on top of that (Database → Backups → PITR in the
dashboard), starting around $100/month. We're staying on free, so backups are a script.

```bash
npm run backup
```

Dumps all three tables to timestamped JSON over the REST API. No database password, no CLI login.
The newest 30 dumps are kept and older ones pruned; override with `OCP_BACKUP_KEEP`.

Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` (Project Settings → API Keys → service_role).
Once access is restricted to signed-in users, the publishable key belongs to a person and a
script has no session, so a backup run with it would return nothing and report success. The
service role key bypasses row-level security, which is what a backup wants — and why it has no
`NEXT_PUBLIC_` prefix and must never be committed. The script warns loudly if it's missing.

**Where the dumps go.** By default `./backups`, which is gitignored. A backup that lives on the
same laptop as nothing else isn't much of a backup, and these files hold staff pay rates and
revenue — so point them somewhere private and off-machine:

```bash
export OCP_BACKUP_DIR="$HOME/Dropbox/OCP/event-backups"
npm run backup
```

Never put dumps in this repo or in a GitHub Actions artifact. The repo is public, and so are
artifacts built from one.

**Restoring.** Rows are matched by id and overwritten, so a restore undoes edits and brings back
deleted rows without duplicating anything that's still there:

```bash
npm run restore -- backups/ocp-events-2026-09-16-1447.json --yes
```

It refuses to run without `--yes`.

---

## Changing things

**Default deliverables and lead times** — `src/lib/templates.ts`. Edit the list, commit, push.
Vercel redeploys on its own. New events pick up the changes; existing events keep their copy.

**Event types, owners, statuses, roles** — `src/lib/types.ts`. If you add an event type, also add
it to the `check` constraint in `schema.sql` and re-run just that constraint, or the database
will reject it:

```sql
alter table events drop constraint events_event_type_check;
alter table events add constraint events_event_type_check
  check (event_type in ('Private Party','Pop-Up','Community Event','Brand Collab',
                        'OCP Event','Pilates in the Park','Workshop','Other','Your New Type'));
```

**Colors and type** — `src/app/globals.css`, in the `@theme` block at the top. Black, white, and
one signal red used only for urgency and the primary action.

**Status rules** (Ready / Overdue / At risk / On track) — `eventStatus` in `src/lib/derive.ts`.

---

## Worth adding later

- **Live sync between editors.** Right now the app refetches when a tab regains focus, which
  covers most of it. Supabase Realtime would make edits appear instantly.
- **Reminder emails.** A Supabase scheduled function could email each owner their deadlines
  every Monday. This is the piece that would make the app actually chase people.
- **Importing from the Google Sheet.** Nothing migrates automatically. For the handful of events
  in the sheet, retyping is faster than writing an importer.
- **Photo uploads** for recaps, via Supabase Storage.
