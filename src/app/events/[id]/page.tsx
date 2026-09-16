"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useEvent } from "@/lib/useData";
import {
  DATE_STATUSES,
  EVENT_TYPES,
  type DeliverableRow,
  type EventRow,
  type StaffRow,
} from "@/lib/types";
import {
  daysFromToday,
  eventStatus,
  formatDate,
  parseDate,
  progressFor,
  relativeDays,
} from "@/lib/derive";
import {
  Field,
  SaveState,
  Section,
  Select,
  StatusTag,
  TextArea,
  TextInput,
} from "@/components/ui";
import DeliverableTable from "@/components/DeliverableTable";
import StaffTable from "@/components/StaffTable";

export default function EventPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();
  const { event, staff, deliverables, state, message, setEvent, setStaff, setDeliverables, reload } =
    useEvent(id);
  const [save, setSave] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function patchEvent(p: Partial<EventRow>) {
    setEvent((prev) => (prev ? { ...prev, ...p } : prev));
    const sb = getSupabase();
    if (!sb) return;
    setSave("saving");
    const { error } = await sb.from("events").update(p).eq("id", id);
    if (error) {
      setSave("error");
      reload();
    } else {
      setSave("saved");
      setTimeout(() => setSave("idle"), 1600);
    }
  }

  function num(v: string): number | null {
    return v.trim() === "" ? null : Number(v);
  }

  if (state === "loading") return <p className="pt-20 text-ink-45">Loading…</p>;

  if (state === "error")
    return (
      <div className="pt-20">
        <h1 className="display text-[34px]">Couldn&apos;t load this event</h1>
        <p className="mt-3 text-[14px] text-flare">{message}</p>
      </div>
    );

  if (!event)
    return (
      <div className="pt-20">
        <h1 className="display text-[34px]">This event isn&apos;t here</h1>
        <p className="mt-3 text-ink-70">It may have been deleted.</p>
        <Link href="/" className="btn mt-5">
          Back to the call sheet
        </Link>
      </div>
    );

  const p = progressFor(event, deliverables);
  const daysOut = daysFromToday(parseDate(event.event_date));

  return (
    <>
      {/* ---------- header ---------- */}
      <div className="pt-8 sm:pt-12">
        <div className="flex items-center gap-3 text-[13px] text-ink-45">
          <Link href="/" className="hover:text-flare">
            Call sheet
          </Link>
          <span>/</span>
          <span>{event.event_type}</span>
          <span className="ml-auto">
            <SaveState state={save} />
          </span>
        </div>

        <input
          className="display mt-3 w-full border-0 bg-transparent p-0 text-[34px] leading-[0.95] outline-none focus:bg-ash sm:text-[46px]"
          defaultValue={event.name}
          aria-label="Event name"
          onBlur={(e) => {
            const v = e.target.value.trim() || "Untitled event";
            if (v !== event.name) patchEvent({ name: v });
          }}
        />

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          <StatusTag status={eventStatus(event, p)} />
          <span className="text-[14px] text-ink-70">
            {event.event_date ? (
              <>
                {formatDate(parseDate(event.event_date), {
                  weekday: "short",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                <span className="ml-2 text-ink-45">
                  {daysOut !== null && daysOut >= 0 ? relativeDays(daysOut) : "already happened"}
                </span>
              </>
            ) : (
              "No date set"
            )}
          </span>
          <span className="flex items-center gap-2 text-[14px]">
            <span className="numeral text-[24px]">
              {p.done}/{p.total}
            </span>
            <span className="text-ink-70">deliverables done</span>
          </span>
          {p.overdue > 0 ? (
            <span className="text-[14px] font-semibold text-flare">{p.overdue} late</span>
          ) : null}
        </div>
      </div>

      {/* ---------- event information ---------- */}
      <Section title="The basics">
        <div className="grid gap-x-6 gap-y-5 pt-5 sm:grid-cols-2">
          <Field label="Event type">
            <Select
              value={event.event_type}
              options={EVENT_TYPES}
              onChange={(v) => patchEvent({ event_type: v as EventRow["event_type"] })}
            />
          </Field>
          <Field label="Location">
            <TextInput
              value={event.location}
              placeholder="Studio or venue"
              onCommit={(v) => patchEvent({ location: v })}
            />
          </Field>
          <Field label="Date" hint="Every deadline below counts backward from this date.">
            <input
              type="date"
              className="input"
              value={event.event_date ?? ""}
              onChange={(e) => patchEvent({ event_date: e.target.value || null })}
            />
          </Field>
          <Field label="Is the date locked?">
            <Select
              value={event.date_status}
              options={DATE_STATUSES}
              onChange={(v) => patchEvent({ date_status: v as EventRow["date_status"] })}
            />
          </Field>
          <Field label="Start time">
            <input
              type="time"
              className="input"
              value={(event.start_time ?? "").slice(0, 5)}
              onChange={(e) => patchEvent({ start_time: e.target.value || null })}
            />
          </Field>
          <Field label="End time">
            <input
              type="time"
              className="input"
              value={(event.end_time ?? "").slice(0, 5)}
              onChange={(e) => patchEvent({ end_time: e.target.value || null })}
            />
          </Field>
          <Field label="Capacity">
            <TextInput
              type="number"
              value={event.capacity}
              placeholder="Max spots"
              onCommit={(v) => patchEvent({ capacity: num(v) })}
            />
          </Field>
          <Field label="Target attendance">
            <TextInput
              type="number"
              value={event.target_attendance}
              placeholder="What we're aiming for"
              onCommit={(v) => patchEvent({ target_attendance: num(v) })}
            />
          </Field>
          <Field label="Price">
            <TextInput
              type="number"
              value={event.price}
              placeholder="0 for free"
              onCommit={(v) => patchEvent({ price: num(v) })}
            />
          </Field>
          <Field label="Discounts">
            <TextInput
              value={event.discounts}
              placeholder="Codes or member pricing"
              onCommit={(v) => patchEvent({ discounts: v })}
            />
          </Field>
          <Field label="What success looks like" wide>
            <TextArea
              value={event.goals}
              rows={2}
              placeholder="Leads, conversions, content captured"
              onCommit={(v) => patchEvent({ goals: v })}
            />
          </Field>
          <Field label="Description" wide>
            <TextArea
              value={event.description}
              placeholder="Format and what happens on the day"
              onCommit={(v) => patchEvent({ description: v })}
            />
          </Field>
        </div>
      </Section>

      {/* ---------- what to bring ---------- */}
      <Section title="What to bring">
        <div className="grid gap-x-6 gap-y-5 pt-5 sm:grid-cols-3">
          <Field label="Promo items">
            <TextArea
              value={event.promo_items}
              rows={2}
              placeholder="Stickers, totes, signage"
              onCommit={(v) => patchEvent({ promo_items: v })}
            />
          </Field>
          <Field label="Giveaways and offers">
            <TextArea
              value={event.giveaways}
              rows={2}
              placeholder="Raffle prizes, on-site offer"
              onCommit={(v) => patchEvent({ giveaways: v })}
            />
          </Field>
          <Field label="Equipment">
            <TextArea
              value={event.equipment}
              rows={2}
              placeholder="Reformers, mats, PA, tents"
              onCommit={(v) => patchEvent({ equipment: v })}
            />
          </Field>
        </div>
      </Section>

      {/* ---------- staffing ---------- */}
      <Section title="Instructors">
        <StaffTable
          rows={staff}
          kind="instructor"
          eventId={id}
          onLocal={(sid, patch) =>
            setStaff((prev) => prev.map((s) => (s.id === sid ? { ...s, ...patch } : s)))
          }
          onAdded={(row: StaffRow) => setStaff((prev) => [...prev, row])}
          onRemoved={(sid) => setStaff((prev) => prev.filter((s) => s.id !== sid))}
          onError={reload}
        />
      </Section>

      <Section title="Helpers">
        <StaffTable
          rows={staff}
          kind="helper"
          eventId={id}
          onLocal={(sid, patch) =>
            setStaff((prev) => prev.map((s) => (s.id === sid ? { ...s, ...patch } : s)))
          }
          onAdded={(row: StaffRow) => setStaff((prev) => [...prev, row])}
          onRemoved={(sid) => setStaff((prev) => prev.filter((s) => s.id !== sid))}
          onError={reload}
        />
      </Section>

      {/* ---------- creative ---------- */}
      <Section title="Creative">
        <div className="pt-4">
          <Field label="Where the files live">
            <TextInput
              value={event.assets_folder_url}
              placeholder="Drive or Dropbox folder link"
              onCommit={(v) => patchEvent({ assets_folder_url: v })}
            />
          </Field>
        </div>
        <div className="mt-6">
          <DeliverableTable
            rows={deliverables}
            category="creative"
            eventDate={event.event_date}
            eventId={id}
            onLocal={(did, patch) =>
              setDeliverables((prev) => prev.map((d) => (d.id === did ? { ...d, ...patch } : d)))
            }
            onAdded={(row: DeliverableRow) => setDeliverables((prev) => [...prev, row])}
            onRemoved={(did) => setDeliverables((prev) => prev.filter((d) => d.id !== did))}
            onError={reload}
          />
        </div>
      </Section>

      {/* ---------- marketing ---------- */}
      <Section title="Marketing and coordination">
        <DeliverableTable
          rows={deliverables}
          category="marketing"
          eventDate={event.event_date}
          eventId={id}
          onLocal={(did, patch) =>
            setDeliverables((prev) => prev.map((d) => (d.id === did ? { ...d, ...patch } : d)))
          }
          onAdded={(row: DeliverableRow) => setDeliverables((prev) => [...prev, row])}
          onRemoved={(did) => setDeliverables((prev) => prev.filter((d) => d.id !== did))}
          onError={reload}
        />
      </Section>

      {/* ---------- recap ---------- */}
      <Section
        title="How it went"
        count={daysOut !== null && daysOut >= 0 ? "fill in after the event" : undefined}
      >
        <div className="grid gap-x-6 gap-y-5 pt-5 sm:grid-cols-4">
          <Field label="Attendance">
            <TextInput
              type="number"
              value={event.actual_attendance}
              onCommit={(v) => patchEvent({ actual_attendance: num(v) })}
            />
          </Field>
          <Field label="Revenue">
            <TextInput
              type="number"
              value={event.revenue}
              onCommit={(v) => patchEvent({ revenue: num(v) })}
            />
          </Field>
          <Field label="Leads captured">
            <TextInput
              type="number"
              value={event.leads_captured}
              onCommit={(v) => patchEvent({ leads_captured: num(v) })}
            />
          </Field>
          <Field label="Memberships from it">
            <TextInput
              type="number"
              value={event.memberships_converted}
              onCommit={(v) => patchEvent({ memberships_converted: num(v) })}
            />
          </Field>
        </div>
        <div className="mt-5">
          <Field label="What worked, what didn't">
            <TextArea
              value={event.recap_notes}
              placeholder="Notes for whoever runs this next time"
              onCommit={(v) => patchEvent({ recap_notes: v })}
            />
          </Field>
        </div>
      </Section>

      {/* ---------- danger zone ---------- */}
      <div className="mt-20 border-t border-rule pt-6">
        <button
          className="btn btn-quiet !px-0 hover:!text-flare"
          onClick={async () => {
            if (!window.confirm(`Delete "${event.name}" and all its deliverables? This can't be undone.`))
              return;
            const sb = getSupabase();
            if (!sb) return;
            await sb.from("events").delete().eq("id", id);
            router.push("/");
          }}
        >
          Delete this event
        </button>
      </div>
    </>
  );
}
