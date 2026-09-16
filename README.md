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
4. Open **Project Settings → API** and copy two values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

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
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon public key |
   | `NEXT_PUBLIC_APP_PASSCODE` | optional — see below |

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

## A note on access

You asked for open editing, so the database policies allow anyone to read and write. Worth
knowing exactly what that means: the anon key ships inside the page, which is normal and by
design, but combined with open write policies it means anyone who has the URL — or finds it in a
forwarded text, a screenshot, or a browser history — can edit or delete any event.

Two ways to tighten it without changing the architecture:

**Shared passcode.** Set `NEXT_PUBLIC_APP_PASSCODE` to anything (`ocp2026`) and the app asks for
it once per device. This stops casual access, not a determined person — the passcode is in the
JavaScript. Good enough for keeping a forwarded link from becoming a problem.

**Real accounts.** Turn on Supabase Auth (email magic links work well for a team this size) and
change the three policies in `schema.sql` from `to anon, authenticated` to `to authenticated`.
Then only people you've invited can touch anything. Worth doing if trainers get access.

Either way, turn on **Point-in-Time Recovery** in Supabase (Settings → Database) so an accidental
delete is recoverable.

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
