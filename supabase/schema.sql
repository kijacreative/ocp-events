-- ============================================================
-- Oak Cliff Pilates — Event Tracker schema
-- Paste this whole file into Supabase > SQL Editor > New query > Run.
-- Safe to re-run: it drops and rebuilds the three tables.
-- ============================================================

drop table if exists deliverables cascade;
drop table if exists event_staff cascade;
drop table if exists events cascade;

create extension if not exists "pgcrypto";

-- ---------- events ------------------------------------------
create table events (
  id                     uuid primary key default gen_random_uuid(),
  name                   text not null default 'Untitled event',
  event_type             text not null default 'OCP Event'
                           check (event_type in ('Private Party','Pop-Up','Community Event',
                                                 'Brand Collab','OCP Event','Pilates in the Park',
                                                 'Workshop','Other')),
  location               text default '',
  event_date             date,
  date_status            text not null default 'Tentative'
                           check (date_status in ('Confirmed','Tentative','Hold','Cancelled')),
  start_time             time,
  end_time               time,
  capacity               integer,
  target_attendance      integer,
  goals                  text default '',
  description            text default '',
  price                  numeric(10,2),
  discounts              text default '',
  promo_items            text default '',
  giveaways              text default '',
  equipment              text default '',
  assets_folder_url      text default '',

  -- post-event recap
  actual_attendance      integer,
  revenue                numeric(12,2),
  leads_captured         integer,
  memberships_converted  integer,
  recap_notes            text default '',

  archived               boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index events_date_idx on events (event_date);

-- ---------- instructors + helpers ---------------------------
create table event_staff (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references events(id) on delete cascade,
  kind          text not null check (kind in ('instructor','helper')),
  name          text default '',
  role          text default '',
  pay_rate      numeric(10,2),
  expectations  text default '',
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

create index event_staff_event_idx on event_staff (event_id);

-- ---------- deliverables ------------------------------------
create table deliverables (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references events(id) on delete cascade,
  category    text not null check (category in ('creative','marketing')),
  title       text not null,
  owner       text default 'TBD',
  lead_days   integer not null default 14,
  status      text not null default 'Not Started'
                check (status in ('Not Started','In Progress','In Review','Approved','Blocked','N/A')),
  done        boolean not null default false,
  link_notes  text default '',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index deliverables_event_idx on deliverables (event_id);

-- ---------- keep updated_at honest --------------------------
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger events_touch before update on events
  for each row execute function touch_updated_at();

-- ============================================================
-- Access: anyone with the link can read and write.
-- RLS stays ON so you can tighten this later without a rebuild.
-- ============================================================
alter table events       enable row level security;
alter table event_staff  enable row level security;
alter table deliverables enable row level security;

create policy "open access" on events
  for all to anon, authenticated using (true) with check (true);
create policy "open access" on event_staff
  for all to anon, authenticated using (true) with check (true);
create policy "open access" on deliverables
  for all to anon, authenticated using (true) with check (true);

grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;

-- ============================================================
-- Optional: an example event so the dashboard isn't empty.
-- Delete this block if you'd rather start clean.
-- ============================================================
with e as (
  insert into events (name, event_type, location, event_date, date_status,
                      start_time, end_time, capacity, target_attendance, goals, description,
                      price, discounts, promo_items, giveaways, equipment)
  values ('Pilates in the Park — Fall Edition', 'Pilates in the Park',
          'Kidd Springs Park, Bishop Arts', current_date + 45, 'Confirmed',
          '09:00', '10:30', 120, 90,
          '150 new leads · 25 conversions to 3-for-$25 · 8 UGC clips',
          'Free outdoor mat class open to the public. Live DJ, retail pop-up, check-in table.',
          0, 'Free entry. On-site only: 3 Classes for $25.',
          'Stickers, totes, branded bottles, QR check-in cards',
          'Raffle: 1 month unlimited + 5x single class passes',
          '60 mats, PA + DJ setup, 2 pop-up tents, check-in table, water station')
  returning id
)
insert into deliverables (event_id, category, title, owner, lead_days, sort_order)
select e.id, d.category, d.title, d.owner, d.lead_days, d.sort_order
from e, (values
  ('creative','Event calendar graphic','Kiel',30,1),
  ('creative','Event page graphic','Kiel',28,2),
  ('creative','App graphic','Kiel',26,3),
  ('creative','Email graphic','Kiel',24,4),
  ('creative','Social graphic','Kiel',21,5),
  ('marketing','Event page live on site','Kiel',25,1),
  ('marketing','Social — creative concept locked','Kiel',24,2),
  ('marketing','App promo live in Arketa','Abby',21,3),
  ('marketing','Email — announcement','Abby',21,4),
  ('marketing','Social — general post','Kiel',18,5),
  ('marketing','Email confirmation to trainers','Amanda',14,6),
  ('marketing','Social — post with trainer','Kiel',12,7),
  ('marketing','Trainer confirmation received','Amanda',10,8),
  ('marketing','Email — event email','Abby',7,9),
  ('marketing','Email — reminder','Abby',2,10)
) as d(category,title,owner,lead_days,sort_order);
