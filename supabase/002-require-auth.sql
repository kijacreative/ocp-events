-- ============================================================
-- Require a signed-in user for all access.
--
-- Run this in Supabase > SQL Editor AFTER you have invited the team
-- under Authentication > Users. Running it first locks everyone out,
-- including you.
--
-- Safe to re-run. Touches policies only, never data.
-- ============================================================

-- The old policies granted the anon role — anyone holding the publishable
-- key, which ships in the browser bundle — full read and write.
drop policy if exists "open access" on events;
drop policy if exists "open access" on event_staff;
drop policy if exists "open access" on deliverables;

create policy "team access" on events
  for all to authenticated using (true) with check (true);
create policy "team access" on event_staff
  for all to authenticated using (true) with check (true);
create policy "team access" on deliverables
  for all to authenticated using (true) with check (true);

-- Revoke the blanket grant the original schema handed to anon.
revoke all on all tables in schema public from anon;
grant all on all tables in schema public to authenticated;

-- Everyone signed in is a peer: all six can see and edit every event.
-- To scope people to their own deliverables later, swap `using (true)`
-- for a check against auth.jwt() ->> 'email'.
