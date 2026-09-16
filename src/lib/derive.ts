import type { DeliverableRow, EventRow } from "./types";

/** Today at local midnight, so day maths never drifts by a few hours. */
export function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Parses a 'YYYY-MM-DD' column as a local date, not UTC. */
export function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function toISODate(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Due date = event date − lead days. The whole scheduling model. */
export function dueDate(eventDate: string | null, leadDays: number): Date | null {
  const base = parseDate(eventDate);
  if (!base) return null;
  const d = new Date(base);
  d.setDate(d.getDate() - (leadDays || 0));
  return d;
}

export function daysFromToday(d: Date | null): number | null {
  if (!d) return null;
  return Math.round((d.getTime() - today().getTime()) / 86400000);
}

export function formatDate(d: Date | null, opts?: Intl.DateTimeFormatOptions): string {
  if (!d) return "—";
  return d.toLocaleDateString("en-US", opts ?? { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateShort(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** '09:00:00' -> '9:00 AM' */
export function formatTime(t: string | null): string {
  if (!t) return "—";
  const [hStr, mStr] = t.split(":");
  let h = Number(hStr);
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${mStr} ${suffix}`;
}

export function formatMoney(n: number | null): string {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/** A deliverable counts toward progress unless it's marked N/A. */
export function isCounted(d: DeliverableRow): boolean {
  return d.status !== "N/A";
}

export function isOpen(d: DeliverableRow): boolean {
  return isCounted(d) && !d.done;
}

export function isOverdue(d: DeliverableRow, eventDate: string | null): boolean {
  if (!isOpen(d)) return false;
  const due = dueDate(eventDate, d.lead_days);
  const days = daysFromToday(due);
  return days !== null && days < 0;
}

export type Progress = {
  total: number;
  done: number;
  pct: number;
  overdue: number;
  nextDue: Date | null;
  nextTitle: string | null;
  nextOwner: string | null;
};

export function progressFor(ev: EventRow, deliverables: DeliverableRow[]): Progress {
  const counted = deliverables.filter(isCounted);
  const done = counted.filter((d) => d.done).length;
  const open = counted.filter((d) => !d.done);

  const overdue = open.filter((d) => isOverdue(d, ev.event_date)).length;

  const upcoming = open
    .map((d) => ({ d, due: dueDate(ev.event_date, d.lead_days) }))
    .filter((x) => x.due !== null)
    .sort((a, b) => (a.due as Date).getTime() - (b.due as Date).getTime());

  return {
    total: counted.length,
    done,
    pct: counted.length ? done / counted.length : 0,
    overdue,
    nextDue: upcoming.length ? (upcoming[0].due as Date) : null,
    nextTitle: upcoming.length ? upcoming[0].d.title : null,
    nextOwner: upcoming.length ? upcoming[0].d.owner : null,
  };
}

export type EventStatus =
  | "Date TBD"
  | "Cancelled"
  | "Past event"
  | "Ready"
  | "Overdue"
  | "At risk"
  | "On track";

export function eventStatus(ev: EventRow, p: Progress): EventStatus {
  if (ev.date_status === "Cancelled") return "Cancelled";
  if (!ev.event_date) return "Date TBD";
  const days = daysFromToday(parseDate(ev.event_date));
  if (days !== null && days < 0) return "Past event";
  if (p.total > 0 && p.done === p.total) return "Ready";
  if (p.overdue > 0) return "Overdue";
  if (days !== null && days <= 7 && p.pct < 0.8) return "At risk";
  return "On track";
}

export function isPast(ev: EventRow): boolean {
  const days = daysFromToday(parseDate(ev.event_date));
  return days !== null && days < 0;
}

/** 'in 3 days', 'today', '2 days late' */
export function relativeDays(days: number | null): string {
  if (days === null) return "no date";
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days > 1) return `in ${days} days`;
  if (days === -1) return "1 day late";
  return `${Math.abs(days)} days late`;
}
