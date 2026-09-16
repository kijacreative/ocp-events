-- ============================================================
-- Oak Cliff Pilates — seed 20 events from the Google Sheet
-- Run AFTER supabase/schema.sql. Paste into SQL Editor and Run.
-- ============================================================

-- 1. The sheet uses an event type the schema doesn't allow yet.
alter table events drop constraint if exists events_event_type_check;
alter table events add constraint events_event_type_check
  check (event_type in ('Private Party','Pop-Up','Community Event','Brand Collab',
                        'OCP Event','Pilates in the Park','Workshop','Partner Event','Other'));

-- 2. The sheet tracks class format separately from event type. Keeping both.
alter table events add column if not exists format text default '';

-- 3. Remove the example event the schema inserted.
delete from events where name = 'Pilates in the Park — Fall Edition';


-- ---------- Pilates and Brunch at Sixty Vines — 8/23/2026 ----------
with e as (
  insert into events (name, event_type, format, location, event_date, date_status, start_time, end_time, capacity, target_attendance, goals, description, price, discounts, promo_items, giveaways, equipment, actual_attendance, revenue, leads_captured, memberships_converted, recap_notes)
  values ('Pilates and Brunch at Sixty Vines', 'Partner Event', 'Mat Class', 'Off Site', '2026-08-23', 'Confirmed', '10:00', '13:00', 120, null, 'Looking for new members, new partnerships with neighbors and a fun experience
Audience: Potential new members in the Uptown area', '2 x 45 minute mat classes followed by brunch with other vendors', 30.00, 'Free for members', 'Specialty drinks and a souvenir glass', 'Free Pilates Class', 'Reformer machine', 10, 100.00, null, null, 'Need to be better about promoting and filling the classes sooner')
  returning id
)
insert into event_staff (event_id, kind, name, role, pay_rate, expectations, sort_order)
select e.id, s.kind, s.name, s.role, s.pay::numeric, s.exp, s.ord::int from e, (values
  ('instructor', 'PEPE', 'Lead Instructor', 100.00, 'Show up, lead the class, make drinks and stay after. Clean up as needed.', 1)
) as s(kind, name, role, pay, exp, ord);

-- ---------- Gentlemen's Night — 8/27/2026 ----------
with e as (
  insert into events (name, event_type, format, location, event_date, date_status, start_time, end_time, capacity, target_attendance, goals, description, price, discounts, promo_items, giveaways, equipment, actual_attendance, revenue, leads_captured, memberships_converted, recap_notes)
  values ('Gentlemen''s Night', 'OCP Event', 'Reformer Class', 'Uptown', '2026-08-27', 'Confirmed', '20:30', '22:00', 12, 12, 'We want men, husbands and boyfriends of members to try Pilates and become members.', 'A 45 minute class with cocktails served after and time to socialize.', 20.00, 'Free for members', 'Specialty drinks and a souvenir glass', 'Free Pilates Class', 'Reformer machine', 10, 100.00, null, null, 'Need to be better about promoting and filling the classes sooner')
  returning id
)
insert into event_staff (event_id, kind, name, role, pay_rate, expectations, sort_order)
select e.id, s.kind, s.name, s.role, s.pay::numeric, s.exp, s.ord::int from e, (values
  ('instructor', 'PEPE', 'Lead Instructor', 100.00, 'Show up, lead the class, make drinks and stay after. Clean up as needed.', 1)
) as s(kind, name, role, pay, exp, ord);

-- ---------- Private Party for Kiara Graham — 8/29/2026 ----------
with e as (
  insert into events (name, event_type, format, location, event_date, date_status, start_time, end_time, capacity, target_attendance, goals, description, price, discounts, promo_items, giveaways, equipment, actual_attendance, revenue, leads_captured, memberships_converted, recap_notes)
  values ('Private Party for Kiara Graham', 'Private Party', 'Reformer Class', 'Uptown', '2026-08-29', 'Confirmed', '16:30', '18:00', 12, null, 'Create best party atmosphere- get potetial new clients
Audience: Party members', 'Private Party for Kiara Graham- wants to listen to hip hop and is animal print theme', 400.00, 'na', 'na', 'Free class giveaway', 'Reformer', null, null, null, null, null)
  returning id
)
insert into event_staff (event_id, kind, name, role, pay_rate, expectations, sort_order)
select e.id, s.kind, s.name, s.role, s.pay::numeric, s.exp, s.ord::int from e, (values
  ('instructor', 'Verandah Mims', 'Lead Instructor', 100.00, null, 1)
) as s(kind, name, role, pay, exp, ord);

-- ---------- Private Party for Jamie Humphries — 8/30/2026 ----------
with e as (
  insert into events (name, event_type, format, location, event_date, date_status, start_time, end_time, capacity, target_attendance, goals, description, price, discounts, promo_items, giveaways, equipment, actual_attendance, revenue, leads_captured, memberships_converted, recap_notes)
  values ('Private Party for Jamie Humphries', 'Private Party', 'Reformer Class', 'Lower Greenville', '2026-08-30', 'Confirmed', '14:00', '15:30', 12, null, 'Create new members and provide the best party experience
Audience: Party members', 'Private party for 12', 400.00, 'na', 'na', 'Free class to the guess', 'Reformer', null, null, null, null, null)
  returning id
)
insert into event_staff (event_id, kind, name, role, pay_rate, expectations, sort_order)
select e.id, s.kind, s.name, s.role, s.pay::numeric, s.exp, s.ord::int from e, (values
  ('instructor', 'Alyson Wells', 'Lead Instructor', 100.00, null, 1)
) as s(kind, name, role, pay, exp, ord);

-- ---------- Private Party for Brunch in Colour — 8/30/2026 ----------
with e as (
  insert into events (name, event_type, format, location, event_date, date_status, start_time, end_time, capacity, target_attendance, goals, description, price, discounts, promo_items, giveaways, equipment, actual_attendance, revenue, leads_captured, memberships_converted, recap_notes)
  values ('Private Party for Brunch in Colour', 'Private Party', 'Reformer Class', 'Lower Greenville', '2026-08-30', 'Confirmed', '12:30', '14:00', 12, null, 'Build a partnership with a local women''s group
Audience: Members of Brunch in Color', 'Private party for members of Brunch in color', 0, 'na', 'na', 'Free class card', 'Reformer', 4, null, null, null, null)
  returning id
)
insert into event_staff (event_id, kind, name, role, pay_rate, expectations, sort_order)
select e.id, s.kind, s.name, s.role, s.pay::numeric, s.exp, s.ord::int from e, (values
  ('instructor', 'Verandah Mims', 'Lead Instructor', 50.00, null, 1)
) as s(kind, name, role, pay, exp, ord);

-- ---------- Photoshoot 1 — 8/30/2026 ----------
with e as (
  insert into events (name, event_type, format, location, event_date, date_status, start_time, end_time, capacity, target_attendance, goals, description, price, discounts, promo_items, giveaways, equipment, actual_attendance, revenue, leads_captured, memberships_converted, recap_notes)
  values ('Photoshoot 1', 'OCP Event', 'Other', 'Lower Greenville', '2026-08-30', 'Confirmed', '16:30', '19:30', 24, null, 'Get new pictures for OCP
Audience: Instructors', 'Editorial style of pictures', 0, 'na', 'na', 'na', 'Reformer', 16, null, null, null, null)
  returning id
)
select id from e;

-- ---------- Book Club — 9/4/2026 ----------
with e as (
  insert into events (name, event_type, format, location, event_date, date_status, start_time, end_time, capacity, target_attendance, goals, description, price, discounts, promo_items, giveaways, equipment, actual_attendance, revenue, leads_captured, memberships_converted, recap_notes)
  values ('Book Club', 'OCP Event', 'Reformer Class', 'Uptown', '2026-09-04', 'Confirmed', '18:30', '21:30', 24, null, 'Get member together
Audience: Memebers of the book clubs', 'OCP members get together to discuss the choosen book while drinking wine', 0, 'na', 'na', 'na', 'Reformer', null, null, null, null, null)
  returning id
)
insert into event_staff (event_id, kind, name, role, pay_rate, expectations, sort_order)
select e.id, s.kind, s.name, s.role, s.pay::numeric, s.exp, s.ord::int from e, (values
  ('instructor', 'Amanda Lauro', 'Lead Instructor', 50.00, null, 1),
  ('helper', 'Isabel', 'Other', null, 'Make charcuterie board', 2)
) as s(kind, name, role, pay, exp, ord);

-- ---------- Pop-up: Nurse Injector Cesi Nunes — 9/4/2026 ----------
with e as (
  insert into events (name, event_type, format, location, event_date, date_status, start_time, end_time, capacity, target_attendance, goals, description, price, discounts, promo_items, giveaways, equipment, actual_attendance, revenue, leads_captured, memberships_converted, recap_notes)
  values ('Pop-up: Nurse Injector Cesi Nunes', 'Partner Event', 'Pop-Up', 'Lower Greenville', '2026-09-04', 'Confirmed', '07:00', '12:00', 72, null, 'Give our members a good recovery experience
Audience: Our members', 'After class members can go to her table', null, '20% off all of her products', null, null, null, null, null, null, null, null)
  returning id
)
select id from e;

-- ---------- Photoshoot 2 — 9/6/2026 ----------
with e as (
  insert into events (name, event_type, format, location, event_date, date_status, start_time, end_time, capacity, target_attendance, goals, description, price, discounts, promo_items, giveaways, equipment, actual_attendance, revenue, leads_captured, memberships_converted, recap_notes)
  values ('Photoshoot 2', 'OCP Event', 'Other', 'Lower Greenville', '2026-09-06', 'Confirmed', '16:30', '19:30', 24, null, 'Get new pictures for OCP
Audience: Instructors', 'Editorial style of pictures', 0, 'na', 'na', 'na', 'Reformer', null, null, null, null, null)
  returning id
)
insert into event_staff (event_id, kind, name, role, pay_rate, expectations, sort_order)
select e.id, s.kind, s.name, s.role, s.pay::numeric, s.exp, s.ord::int from e, (values
  ('helper', 'Folake', 'Front Desk / Check-In', null, null, 1)
) as s(kind, name, role, pay, exp, ord);

-- ---------- Fit Drop Wellness Event — 9/12/2026 ----------
with e as (
  insert into events (name, event_type, format, location, event_date, date_status, start_time, end_time, capacity, target_attendance, goals, description, price, discounts, promo_items, giveaways, equipment, actual_attendance, revenue, leads_captured, memberships_converted, recap_notes)
  values ('Fit Drop Wellness Event', 'Partner Event', 'Mat Class', 'Off Site', '2026-09-12', 'Confirmed', '09:00', '10:00', null, null, 'Reach a new audience and build relationship with Fitness ambassadors
Audience: Instructors', 'This class will take place on Saturday, September 12 at 9 AM and the sound check time will be at 8:30 AM  The class happens outside of North Italia in the green space at the Galleria mall. I will get you connected with the team so that you can be outfitted by Macy’s they’ll schedule a time when you’re able to come in and get your outfit for the class. If OCP would like to give you any flyers or any type of goodies to be able to hand out or have a table at the class absolutely can pop up and join. This will be a 45 minute mat Pilates class and I asked that you program it in a way that is accessible for all levels. You may be teaching from people that have never seen a yoga mat in their life to some of your regulars, so we just like to make sure that the class is absolutely accessible for all people to join.', null, null, null, 'Free Pilates Class', 'Yoga Mat', null, null, null, null, null)
  returning id
)
insert into event_staff (event_id, kind, name, role, pay_rate, expectations, sort_order)
select e.id, s.kind, s.name, s.role, s.pay::numeric, s.exp, s.ord::int from e, (values
  ('instructor', 'Jesika', 'Lead Instructor', 100.00, 'Arrive at 8:30am', 1),
  ('helper', 'Isabel', 'Setup + Breakdown', 50.00, 'Set up table for event', 2)
) as s(kind, name, role, pay, exp, ord);

-- ---------- Round table dinner — 9/19/2026 ----------
with e as (
  insert into events (name, event_type, format, location, event_date, date_status, start_time, end_time, capacity, target_attendance, goals, description, price, discounts, promo_items, giveaways, equipment, actual_attendance, revenue, leads_captured, memberships_converted, recap_notes)
  values ('Round table dinner', 'OCP Event', 'Other', 'Lower Greenville', '2026-09-19', 'Confirmed', '17:00', '19:30', 24, null, 'Introduce instructors to new events page and explain exoectation
Audience: Instructors', 'Dinner at the studio', 0, 'na', 'na', 'na', 'Reformer', null, null, null, null, null)
  returning id
)
insert into event_staff (event_id, kind, name, role, pay_rate, expectations, sort_order)
select e.id, s.kind, s.name, s.role, s.pay::numeric, s.exp, s.ord::int from e, (values
  ('instructor', 'Amanda Mecsey', 'Lead Instructor', null, null, 1),
  ('helper', 'Isabel', 'Setup + Breakdown', 50.00, 'Get dinner', 2)
) as s(kind, name, role, pay, exp, ord);

-- ---------- Cold Plunge — 9/19/2026 ----------
with e as (
  insert into events (name, event_type, format, location, event_date, date_status, start_time, end_time, capacity, target_attendance, goals, description, price, discounts, promo_items, giveaways, equipment, actual_attendance, revenue, leads_captured, memberships_converted, recap_notes)
  values ('Cold Plunge', 'Partner Event', 'Mat Class', 'Off Site', '2026-09-19', 'Confirmed', '11:00', '14:00', 128, null, 'Networking, Brand awareness, new clients
Audience: New clients from HG', 'HG Sply Co. + Oak Cliff Pilates: Cold Club  Mat Pilates, Breathwork, Cold Plunge and Wellness Vendors Sunday, September 19th from 11 am - 2 pm HG Rooftop: 2008 Greenville Ave, Dallas, TX 75206  Tina and Daisy will teach thirty-minute mat Pilates classes every 45 minutes. Ideally they should be booked in advance.   Ten minutes of breathwork will be followed by a cold plunge.', 50.00, 'na', 'robes/towels for sale', 'free reformer class', 'matts, cold plunge tubes and a table set up', null, null, null, null, null)
  returning id
)
insert into event_staff (event_id, kind, name, role, pay_rate, expectations, sort_order)
select e.id, s.kind, s.name, s.role, s.pay::numeric, s.exp, s.ord::int from e, (values
  ('instructor', 'Tina Darling', 'Lead Instructor', null, null, 1),
  ('instructor', 'Daisy Llamas', 'Lead Instructor', null, null, 2),
  ('helper', 'Isabel', 'Setup + Breakdown', null, 'help with the event', 3),
  ('helper', 'Laura', 'Front Desk / Check-In', null, 'Help with the table', 4)
) as s(kind, name, role, pay, exp, ord);

-- ---------- Athena — 9/26/2026 ----------
with e as (
  insert into events (name, event_type, format, location, event_date, date_status, start_time, end_time, capacity, target_attendance, goals, description, price, discounts, promo_items, giveaways, equipment, actual_attendance, revenue, leads_captured, memberships_converted, recap_notes)
  values ('Athena', 'OCP Event', 'Reformer Class', 'Lower Greenville', '2026-09-26', 'Confirmed', '14:30', '18:00', 24, null, 'Creat community
Audience: OCP members', 'Two pilates classes back to back with partner vendors and a special speaker', 25.00, 'na', 'Socks and Goodie Bags', 'Socks and Goodie Bags', 'Reformer', null, null, null, null, null)
  returning id
)
insert into event_staff (event_id, kind, name, role, pay_rate, expectations, sort_order)
select e.id, s.kind, s.name, s.role, s.pay::numeric, s.exp, s.ord::int from e, (values
  ('instructor', 'Nikita', 'Lead Instructor', null, null, 1),
  ('helper', 'Isabel', 'Setup + Breakdown', null, 'help with the event', 2),
  ('helper', 'Stephanie', 'Setup + Breakdown', null, 'Help with the table', 3)
) as s(kind, name, role, pay, exp, ord);

-- ---------- Pilates in the Park Sundays — 9/13/2026 ----------
with e as (
  insert into events (name, event_type, format, location, event_date, date_status, start_time, end_time, capacity, target_attendance, goals, description, price, discounts, promo_items, giveaways, equipment, actual_attendance, revenue, leads_captured, memberships_converted, recap_notes)
  values ('Pilates in the Park Sundays', 'OCP Event', 'Pilates in the Park', 'Off Site', '2026-09-13', 'Confirmed', '09:00', '10:00', 200, 100, 'Provide a free class and reach the Oak Cliff area with our brand and studio offers. Focus on pushing the 1-Week Unlimited.', 'Mat Pilates taught at Halperin Park', 0, null, null, 'Special intro offers.', null, null, null, null, null, null)
  returning id
)
insert into event_staff (event_id, kind, name, role, pay_rate, expectations, sort_order)
select e.id, s.kind, s.name, s.role, s.pay::numeric, s.exp, s.ord::int from e, (values
  ('instructor', 'Amber', 'Lead Instructor', 50.00, null, 1),
  ('helper', 'Laura', 'Setup + Breakdown', 50.00, null, 2)
) as s(kind, name, role, pay, exp, ord);

-- ---------- Pilates in the Park Sundays — 9/27/2026 ----------
with e as (
  insert into events (name, event_type, format, location, event_date, date_status, start_time, end_time, capacity, target_attendance, goals, description, price, discounts, promo_items, giveaways, equipment, actual_attendance, revenue, leads_captured, memberships_converted, recap_notes)
  values ('Pilates in the Park Sundays', 'OCP Event', 'Pilates in the Park', 'Off Site', '2026-09-27', 'Confirmed', '09:00', '10:00', 200, 100, 'Provide a free class and reach the Oak Cliff area with our brand and studio offers. Focus on pushing the 1-Week Unlimited.', 'Mat Pilates taught at Halperin Park', 0, null, null, 'Special intro offers.', null, null, null, null, null, null)
  returning id
)
insert into event_staff (event_id, kind, name, role, pay_rate, expectations, sort_order)
select e.id, s.kind, s.name, s.role, s.pay::numeric, s.exp, s.ord::int from e, (values
  ('instructor', 'Gianna', 'Lead Instructor', 50.00, null, 1),
  ('helper', 'Isabel', 'Setup + Breakdown', 50.00, null, 2),
  ('helper', 'madison', 'Setup + Breakdown', 50.00, null, 3)
) as s(kind, name, role, pay, exp, ord);

-- ---------- Pilates in the Park Sundays — 10/11/2026 ----------
with e as (
  insert into events (name, event_type, format, location, event_date, date_status, start_time, end_time, capacity, target_attendance, goals, description, price, discounts, promo_items, giveaways, equipment, actual_attendance, revenue, leads_captured, memberships_converted, recap_notes)
  values ('Pilates in the Park Sundays', 'OCP Event', 'Pilates in the Park', 'Off Site', '2026-10-11', 'Confirmed', '09:00', '10:00', 200, 100, 'Provide a free class and reach the Oak Cliff area with our brand and studio offers. Focus on pushing the 1-Week Unlimited.', 'Mat Pilates taught at Halperin Park', 0, null, null, 'Special intro offers.', null, null, null, null, null, null)
  returning id
)
insert into event_staff (event_id, kind, name, role, pay_rate, expectations, sort_order)
select e.id, s.kind, s.name, s.role, s.pay::numeric, s.exp, s.ord::int from e, (values
  ('instructor', 'Tracy', 'Lead Instructor', 50.00, null, 1),
  ('helper', 'Isabel', 'Setup + Breakdown', 50.00, null, 2)
) as s(kind, name, role, pay, exp, ord);

-- ---------- Movie Night at Leelas — 10/16/2026 ----------
with e as (
  insert into events (name, event_type, format, location, event_date, date_status, start_time, end_time, capacity, target_attendance, goals, description, price, discounts, promo_items, giveaways, equipment, actual_attendance, revenue, leads_captured, memberships_converted, recap_notes)
  values ('Movie Night at Leelas', 'OCP Event', 'Reformer Class', 'Off Site', '2026-10-16', 'Tentative', '14:30', '18:00', 50, null, 'Audience: Leelas', null, null, null, null, null, null, null, null, null, null, null)
  returning id
)
select id from e;

-- ---------- Pilates and Brunch at Sixty Vines — 10/1/2026 ----------
with e as (
  insert into events (name, event_type, format, location, event_date, date_status, start_time, end_time, capacity, target_attendance, goals, description, price, discounts, promo_items, giveaways, equipment, actual_attendance, revenue, leads_captured, memberships_converted, recap_notes)
  values ('Pilates and Brunch at Sixty Vines', 'OCP Event', 'Reformer Class', 'Off Site', '2026-10-01', 'Tentative', '14:30', '18:00', 120, null, null, null, null, null, null, null, null, null, null, null, null, null)
  returning id
)
select id from e;

-- ---------- National Night Out — 10/6/2026 ----------
with e as (
  insert into events (name, event_type, format, location, event_date, date_status, start_time, end_time, capacity, target_attendance, goals, description, price, discounts, promo_items, giveaways, equipment, actual_attendance, revenue, leads_captured, memberships_converted, recap_notes)
  values ('National Night Out', 'OCP Event', 'Community Event', 'Off Site', '2026-10-06', 'Confirmed', '17:00', '19:00', null, null, null, 'We are joining Junius Height Neighborhood Association for National Night Out and setting up a table to promote the studio.', null, null, null, null, null, null, null, null, null, null)
  returning id
)
insert into event_staff (event_id, kind, name, role, pay_rate, expectations, sort_order)
select e.id, s.kind, s.name, s.role, s.pay::numeric, s.exp, s.ord::int from e, (values
  ('helper', 'Isabel', 'Setup + Breakdown', null, null, 1)
) as s(kind, name, role, pay, exp, ord);

-- ---------- Mat Pilates Class at Madabolics — 10/3/2026 ----------
with e as (
  insert into events (name, event_type, format, location, event_date, date_status, start_time, end_time, capacity, target_attendance, goals, description, price, discounts, promo_items, giveaways, equipment, actual_attendance, revenue, leads_captured, memberships_converted, recap_notes)
  values ('Mat Pilates Class at Madabolics', 'Partner Event', 'Mat Class', 'Off Site', '2026-10-03', 'Confirmed', '10:30', '11:30', 30, null, null, 'Targeting the MAD members and providing a free class to promote the studio', null, null, null, 'Special offers for MAD members and trainers', null, null, null, null, null, null)
  returning id
)
select id from e;


-- ============================================================
-- Default 15-item checklist, applied ONLY to events still ahead.
-- Past events get no deliverables so the dashboard isn't flooded
-- with deadlines that can no longer be met.
-- ============================================================
insert into deliverables (event_id, category, title, owner, lead_days, sort_order)
select ev.id, d.category, d.title, d.owner, d.lead_days, d.sort_order
from events ev, (values
  ('creative','Event calendar graphic','Kiel',30,1),
  ('creative','Event page graphic','Kiel',28,2),
  ('creative','App graphic','Kiel',26,3),
  ('creative','Email graphic','Kiel',24,4),
  ('creative','Social graphic','Kiel',21,5),
  ('marketing','Event page live on site','Kiel',25,1),
  ('marketing','Social — creative concept locked','Stephanie',24,2),
  ('marketing','App promo live in Arketa','Charley',21,3),
  ('marketing','Email — announcement','Abby',21,4),
  ('marketing','Social — general post','Stephanie',18,5),
  ('marketing','Email confirmation to trainers','Isabel',14,6),
  ('marketing','Social — post with trainer','Stephanie',12,7),
  ('marketing','Trainer confirmation received','Isabel',10,8),
  ('marketing','Email — event email','Abby',7,9),
  ('marketing','Email — reminder','Abby',2,10)
) as d(category,title,owner,lead_days,sort_order)
where ev.event_date >= current_date;

-- These are real events already under way, so the backdated deadlines are
-- fiction: 84 of the 135 items below are past due the moment they're created.
-- A permanently red dashboard is a dashboard nobody reads, so anything whose
-- deadline already passed is marked N/A and drops out of the progress bars.
--
-- N/A is not "cancelled" — it means "this lead time never applied to this
-- event." If a row is genuinely still outstanding, set it back to In Progress
-- in the app and it starts counting again.
update deliverables d set status = 'N/A'
from events e
where d.event_id = e.id
  and e.event_date - d.lead_days < current_date;

-- Prefer to see them instead of hide them? Use this rather than the above:
-- update deliverables d set status = 'Blocked'
-- from events e
-- where d.event_id = e.id and e.event_date - d.lead_days < current_date;

select name, event_date, event_type, format from events order by event_date;
