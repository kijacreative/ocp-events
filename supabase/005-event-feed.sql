-- ============================================================
-- A read-only feed of events for Trainer HQ (hq.oakcliffpilates.com).
--
-- Run after 002-require-auth.sql. Safe to re-run.
--
-- HQ has no sign-in, so anything reachable from it is effectively public.
-- Rather than hand the feed a key that can read everything, this exposes a
-- view with only the columns a trainer needs, and grants the anon role
-- access to that view alone. Even a bug in the API route cannot leak a
-- column the view does not select.
--
-- Deliberately NOT exposed: pay rates and the whole event_staff table,
-- revenue, leads_captured, memberships_converted, recap_notes, goals,
-- and assets_folder_url.
-- ============================================================

drop view if exists event_feed;

create view event_feed as
  select
    id,
    name,
    event_type,
    format,
    location,
    event_date,
    date_status,
    start_time,
    end_time,
    capacity,
    price,
    description
  from events
  where archived = false
    and date_status <> 'Cancelled'
    and event_date is not null;

-- The view runs with its owner's rights, so the anon role reads it without
-- being granted anything on the events table itself.
revoke all on event_feed from anon, authenticated;
grant select on event_feed to anon, authenticated;

-- Belt and braces: confirm anon still cannot reach the base tables.
--   set role anon;
--   select * from events;        -- expected: permission denied
--   select * from event_staff;   -- expected: permission denied
--   select * from event_feed;    -- expected: rows
--   reset role;
