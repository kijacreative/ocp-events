"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAllEvents } from "@/lib/useData";
import {
  daysFromToday,
  dueDate,
  formatDateShort,
  isCounted,
  isPast,
  relativeDays,
} from "@/lib/derive";
import { Check, DeliverableTag, Empty, Select } from "@/components/ui";
import { OWNERS, type DeliverableRow, type EventRow } from "@/lib/types";

export default function Tasks() {
  const { events, deliverables, state, patchDeliverable } = useAllEvents();
  const [owner, setOwner] = useState("Everyone");
  const [showDone, setShowDone] = useState(false);

  const rows = useMemo(() => {
    const live = new Map(events.filter((e) => !isPast(e)).map((e) => [e.id, e]));
    const out: { d: DeliverableRow; ev: EventRow; due: Date; days: number }[] = [];
    for (const d of deliverables) {
      const ev = live.get(d.event_id);
      if (!ev || !isCounted(d)) continue;
      if (!showDone && d.done) continue;
      if (owner !== "Everyone" && (d.owner || "TBD") !== owner) continue;
      const due = dueDate(ev.event_date, d.lead_days);
      if (!due) continue;
      out.push({ d, ev, due, days: daysFromToday(due) as number });
    }
    return out.sort((a, b) => a.due.getTime() - b.due.getTime());
  }, [events, deliverables, owner, showDone]);

  if (state === "loading") return <p className="pt-20 text-ink-45">Loading…</p>;
  if (state === "unconfigured")
    return <p className="pt-20 text-ink-70">Connect the database first — see the README.</p>;

  const late = rows.filter((r) => r.days < 0).length;

  return (
    <>
      <div className="pt-10 sm:pt-14">
        <h1 className="display text-[40px] sm:text-[52px]">Every deadline</h1>
        <p className="mt-3 text-[14.5px] text-ink-70">
          {rows.length} {showDone ? "items" : "open items"} across every upcoming event
          {late > 0 ? (
            <>
              {" — "}
              <span className="font-semibold text-flare">{late} past due</span>
            </>
          ) : null}
        </p>

        <div className="mt-7 flex flex-wrap items-end gap-4">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-ink-70">Owner</span>
            <Select
              value={owner}
              options={["Everyone", ...OWNERS]}
              onChange={setOwner}
              className="!w-[180px]"
            />
          </label>
          <label className="flex cursor-pointer items-center gap-2 pb-2.5 text-[13.5px] font-semibold">
            <input
              type="checkbox"
              className="check"
              checked={showDone}
              onChange={(e) => setShowDone(e.target.checked)}
            />
            Include finished
          </label>
        </div>
      </div>

      <div className="mt-9">
        <hr className="rule-heavy" />
        {rows.length === 0 ? (
          <Empty
            line={
              owner === "Everyone"
                ? "Nothing outstanding. Every deliverable is checked off."
                : `${owner} has nothing open right now.`
            }
          />
        ) : (
          rows.map((t) => (
            <div key={t.d.id} className="row-grid flex items-start gap-3 py-3 sm:items-center">
              <Check
                checked={t.d.done}
                label={`Mark ${t.d.title} done`}
                onChange={(v) => patchDeliverable(t.d.id, { done: v })}
              />
              <div className={`min-w-0 flex-1 ${t.d.done ? "opacity-55" : ""}`}>
                <span className="block text-[15px] font-semibold">{t.d.title}</span>
                <Link
                  href={`/events/${t.ev.id}`}
                  className="mt-0.5 block truncate text-[12.5px] text-ink-45 hover:text-flare"
                >
                  {t.ev.name}
                </Link>
              </div>
              <span className="w-[76px] shrink-0 text-[13.5px] font-semibold">
                {t.d.owner || "—"}
              </span>
              <span className="w-[104px] shrink-0 text-right text-[13px] sm:text-left">
                <span className={t.days < 0 && !t.d.done ? "font-semibold text-flare" : "text-ink-70"}>
                  {relativeDays(t.days)}
                </span>
                <span className="block text-[11.5px] text-ink-45">{formatDateShort(t.due)}</span>
              </span>
              <span className="hidden w-[92px] shrink-0 sm:block">
                <DeliverableTag status={t.d.status} />
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
}
