"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAllEvents } from "@/lib/useData";
import {
  daysFromToday,
  dueDate,
  eventStatus,
  formatDate,
  formatDateShort,
  formatMoney,
  isCounted,
  isPast,
  parseDate,
  progressFor,
  relativeDays,
} from "@/lib/derive";
import { Check, DeliverableTag, Empty, Section, StatusTag } from "@/components/ui";
import type { DeliverableRow, EventRow } from "@/lib/types";

type OpenTask = {
  d: DeliverableRow;
  ev: EventRow;
  due: Date;
  days: number;
};

export default function Dashboard() {
  const { events, deliverables, state, message, patchDeliverable } = useAllEvents();

  const byEvent = useMemo(() => {
    const m = new Map<string, DeliverableRow[]>();
    for (const d of deliverables) {
      const list = m.get(d.event_id) ?? [];
      list.push(d);
      m.set(d.event_id, list);
    }
    return m;
  }, [deliverables]);

  const active = useMemo(
    () => events.filter((e) => !isPast(e) && e.date_status !== "Cancelled"),
    [events]
  );
  const past = useMemo(() => events.filter(isPast), [events]);

  /** Open deliverables across every active event, soonest first. */
  const openTasks = useMemo<OpenTask[]>(() => {
    const out: OpenTask[] = [];
    for (const ev of active) {
      for (const d of byEvent.get(ev.id) ?? []) {
        if (!isCounted(d) || d.done) continue;
        const due = dueDate(ev.event_date, d.lead_days);
        if (!due) continue;
        out.push({ d, ev, due, days: daysFromToday(due) as number });
      }
    }
    return out.sort((a, b) => a.due.getTime() - b.due.getTime());
  }, [active, byEvent]);

  const overdueCount = openTasks.filter((t) => t.days < 0).length;
  const next30 = active.filter((e) => {
    const days = daysFromToday(parseDate(e.event_date));
    return days !== null && days >= 0 && days <= 30;
  }).length;

  const workload = useMemo(() => {
    const m = new Map<string, { open: number; late: number }>();
    for (const t of openTasks) {
      const key = t.d.owner || "Unassigned";
      const cur = m.get(key) ?? { open: 0, late: 0 };
      cur.open += 1;
      if (t.days < 0) cur.late += 1;
      m.set(key, cur);
    }
    return [...m.entries()].sort((a, b) => b[1].open - a[1].open);
  }, [openTasks]);

  if (state === "unconfigured") {
    return (
      <div className="pt-20">
        <h1 className="display text-[44px]">Almost there</h1>
        <p className="mt-3 max-w-[54ch] text-ink-70">
          The app is deployed but not pointed at a database yet. Run the SQL in{" "}
          <code className="bg-ash px-1">supabase/schema.sql</code>, then add your two Supabase keys
          as environment variables in Vercel and redeploy.
        </p>
      </div>
    );
  }

  if (state === "loading") {
    return <p className="pt-20 text-ink-45">Loading events…</p>;
  }

  if (state === "error") {
    // The three failures that actually happen, each with the fix that applies.
    const token = /jwt|issued at future|token is expired|invalid claim/i.test(message);
    const missingTable = /schema cache|does not exist/i.test(message);
    const denied = /permission denied|not authorized/i.test(message);

    return (
      <div className="pt-20">
        <h1 className="display text-[36px]">
          {token ? "Your session needs a refresh" : "Couldn't reach the database"}
        </h1>
        <p className="mt-3 text-[14px] text-flare">{message}</p>
        <p className="mt-2 max-w-[54ch] text-[14px] text-ink-70">
          {token
            ? "This one is harmless — the sign-in token was issued a moment out of step with the database clock. Reloading usually settles it; signing out and back in always does."
            : missingTable
              ? "The database is reachable but the tables are missing. Run supabase/schema.sql, then 003-seed-events.sql."
              : denied
                ? "You're signed in but the database refused the request. Check that 002-require-auth.sql ran and that your account is still invited."
                : "Check that the Supabase keys in Vercel point at the right project, then redeploy."}
        </p>
        <button className="btn btn-solid mt-6" onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>
    );
  }

  const hero = openTasks[0];

  return (
    <>
      {/* ---------- hero: the next thing due ---------- */}
      <div className="pt-10 sm:pt-14">
        {hero ? (
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-10">
            <div className="flex items-end gap-3">
              <span
                className={`numeral text-[86px] sm:text-[124px] ${
                  hero.days < 0 ? "text-flare" : "text-ink"
                }`}
              >
                {Math.abs(hero.days)}
              </span>
              <span className="pb-2 text-[15px] font-semibold text-ink-70">
                {hero.days < 0
                  ? hero.days === -1
                    ? "day late"
                    : "days late"
                  : hero.days === 0
                    ? "due today"
                    : hero.days === 1
                      ? "day out"
                      : "days out"}
              </span>
            </div>
            <div className="pb-2 sm:pb-3">
              <h1 className="display text-[30px] sm:text-[38px]">{hero.d.title}</h1>
              <p className="mt-1.5 text-[14.5px] text-ink-70">
                {hero.d.owner || "Unassigned"} owns it, due {formatDate(hero.due)} for{" "}
                <Link href={`/events/${hero.ev.id}`} className="font-semibold underline">
                  {hero.ev.name}
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="display text-[38px] sm:text-[52px]">Nothing due</h1>
            <p className="mt-2 text-ink-70">
              Every deliverable on the books is checked off. Add an event to get the next run going.
            </p>
          </div>
        )}

        {/* small supporting numbers, kept quiet */}
        <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-rule pt-4">
          <Stat n={active.length} label="events on the books" />
          <Stat n={next30} label="in the next 30 days" />
          <Stat n={overdueCount} label="deliverables late" tone={overdueCount ? "flare" : "ink"} />
          <Stat n={openTasks.length} label="open in total" />
        </div>
      </div>

      {/* ---------- active events ---------- */}
      <Section title="On the books" count={`${active.length} events`}>
        {active.length === 0 ? (
          <Empty
            line="No upcoming events yet."
            action={
              <Link href="/events/new" className="btn btn-solid">
                Create the first one
              </Link>
            }
          />
        ) : (
          <div>
            <div className="hidden grid-cols-[1fr_92px_78px_110px_120px] gap-3 py-2 text-[12px] font-semibold text-ink-45 sm:grid">
              <span>Event</span>
              <span>Date</span>
              <span>Days out</span>
              <span>Progress</span>
              <span>Status</span>
            </div>
            {active.map((ev) => {
              const p = progressFor(ev, byEvent.get(ev.id) ?? []);
              const days = daysFromToday(parseDate(ev.event_date));
              return (
                <Link
                  key={ev.id}
                  href={`/events/${ev.id}`}
                  className="row-grid block py-3 sm:grid sm:grid-cols-[1fr_92px_78px_110px_120px] sm:items-center sm:gap-3"
                >
                  <div>
                    <span className="text-[15.5px] font-semibold">{ev.name}</span>
                    <span className="mt-0.5 block text-[12.5px] text-ink-45">
                      {ev.event_type}
                      {ev.format ? ` · ${ev.format}` : ""}
                      {ev.location ? ` · ${ev.location}` : ""}
                    </span>
                  </div>
                  <span className="mt-1.5 block text-[13.5px] sm:mt-0">
                    {formatDateShort(parseDate(ev.event_date))}
                    {ev.date_status === "Tentative" || ev.date_status === "Hold" ? (
                      <span className="ml-1 text-[11px] text-warn">{ev.date_status}</span>
                    ) : null}
                  </span>
                  <span className="text-[13.5px] text-ink-70">{days === null ? "—" : days}</span>
                  <span className="mt-1 flex items-center gap-2 sm:mt-0">
                    <span className="h-1.5 w-12 bg-ash">
                      <span
                        className="block h-1.5 bg-ink"
                        style={{ width: `${Math.round(p.pct * 100)}%` }}
                      />
                    </span>
                    <span className="text-[12.5px] text-ink-70">
                      {p.done}/{p.total}
                    </span>
                  </span>
                  <span className="mt-2 block sm:mt-0">
                    <StatusTag status={eventStatus(ev, p)} />
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </Section>

      {/* ---------- open deliverables ---------- */}
      <Section
        title="What's due next"
        aside={
          <Link href="/tasks" className="text-[13px] font-semibold text-ink-45 hover:text-flare">
            See all {openTasks.length}
          </Link>
        }
      >
        {openTasks.length === 0 ? (
          <Empty line="Nothing outstanding across any event." />
        ) : (
          <div>
            {openTasks.slice(0, 12).map((t) => (
              <div
                key={t.d.id}
                className="row-grid flex items-start gap-3 py-3 sm:items-center sm:gap-4"
              >
                <Check
                  checked={t.d.done}
                  label={`Mark ${t.d.title} done`}
                  onChange={(v) => patchDeliverable(t.d.id, { done: v })}
                />
                <div className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold">{t.d.title}</span>
                  <Link
                    href={`/events/${t.ev.id}`}
                    className="mt-0.5 block truncate text-[12.5px] text-ink-45 hover:text-flare"
                  >
                    {t.ev.name}
                  </Link>
                </div>
                <span className="w-[72px] shrink-0 text-[13.5px] font-semibold">
                  {t.d.owner || "—"}
                </span>
                <span className="w-[108px] shrink-0 text-right text-[13px] sm:text-left">
                  <span className={t.days < 0 ? "font-semibold text-flare" : "text-ink-70"}>
                    {relativeDays(t.days)}
                  </span>
                  <span className="block text-[11.5px] text-ink-45">{formatDateShort(t.due)}</span>
                </span>
                <span className="hidden w-[92px] shrink-0 sm:block">
                  <DeliverableTag status={t.d.status} />
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ---------- workload ---------- */}
      {workload.length > 0 ? (
        <Section title="Who's carrying what" count="open deliverables by owner">
          <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {workload.map(([owner, w]) => (
              <div key={owner} className="row-grid flex items-baseline gap-3 py-3">
                <span className="numeral text-[30px]">{w.open}</span>
                <span className="text-[14.5px] font-semibold">{owner}</span>
                {w.late > 0 ? (
                  <span className="ml-auto text-[12.5px] font-semibold text-flare">
                    {w.late} late
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ---------- past events ---------- */}
      <Section title="Already happened" count={`${past.length} events`}>
        {past.length === 0 ? (
          <Empty line="No completed events yet. Recap numbers show up here the day after an event." />
        ) : (
          <div>
            <div className="hidden grid-cols-[1fr_88px_92px_96px_72px_80px] gap-3 py-2 text-[12px] font-semibold text-ink-45 sm:grid">
              <span>Event</span>
              <span>Date</span>
              <span>Attendance</span>
              <span>Revenue</span>
              <span>Leads</span>
              <span>Converted</span>
            </div>
            {past.map((ev) => {
              const hitRate =
                ev.actual_attendance && ev.target_attendance
                  ? ev.actual_attendance / ev.target_attendance
                  : null;
              return (
                <Link
                  key={ev.id}
                  href={`/events/${ev.id}`}
                  className="row-grid block py-3 sm:grid sm:grid-cols-[1fr_88px_92px_96px_72px_80px] sm:items-center sm:gap-3"
                >
                  <div>
                    <span className="text-[15px] font-semibold">{ev.name}</span>
                    <span className="mt-0.5 block text-[12.5px] text-ink-45">{ev.event_type}</span>
                  </div>
                  <span className="text-[13.5px] text-ink-70">
                    {formatDateShort(parseDate(ev.event_date))}
                  </span>
                  <span className="text-[13.5px]">
                    {ev.actual_attendance ?? "—"}
                    {hitRate ? (
                      <span
                        className={`ml-1 text-[11.5px] ${
                          hitRate >= 1 ? "text-ok" : "text-ink-45"
                        }`}
                      >
                        {Math.round(hitRate * 100)}%
                      </span>
                    ) : null}
                  </span>
                  <span className="text-[13.5px]">{formatMoney(ev.revenue)}</span>
                  <span className="text-[13.5px]">{ev.leads_captured ?? "—"}</span>
                  <span className="text-[13.5px]">{ev.memberships_converted ?? "—"}</span>
                </Link>
              );
            })}
          </div>
        )}
      </Section>
    </>
  );
}

function Stat({
  n,
  label,
  tone = "ink",
}: {
  n: number;
  label: string;
  tone?: "ink" | "flare";
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className={`numeral text-[30px] ${tone === "flare" ? "text-flare" : "text-ink"}`}>
        {n}
      </span>
      <span className="text-[13px] text-ink-70">{label}</span>
    </div>
  );
}
