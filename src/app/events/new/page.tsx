"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { DATE_STATUSES, EVENT_TYPES, type DateStatus, type EventType } from "@/lib/types";
import { DELIVERABLE_TEMPLATE, STAFF_TEMPLATE } from "@/lib/templates";
import { Field, Select } from "@/components/ui";

export default function NewEvent() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<EventType>("OCP Event");
  const [date, setDate] = useState("");
  const [dateStatus, setDateStatus] = useState<DateStatus>("Tentative");
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function create() {
    const sb = getSupabase();
    if (!sb) {
      setError("No database connection. Add your Supabase keys in Vercel first.");
      return;
    }
    setBusy(true);
    setError("");

    const { data, error: evError } = await sb
      .from("events")
      .insert({
        name: name.trim() || "Untitled event",
        event_type: type,
        event_date: date || null,
        date_status: dateStatus,
        location,
      })
      .select()
      .single();

    if (evError || !data) {
      setError(evError?.message || "Couldn't create the event.");
      setBusy(false);
      return;
    }

    const eventId = data.id as string;

    const [dlRes, stRes] = await Promise.all([
      sb.from("deliverables").insert(
        DELIVERABLE_TEMPLATE.map((d) => ({
          event_id: eventId,
          category: d.category,
          title: d.title,
          owner: d.owner,
          lead_days: d.lead_days,
          sort_order: d.sort_order,
        }))
      ),
      sb
        .from("event_staff")
        .insert(STAFF_TEMPLATE.map((s) => ({ event_id: eventId, ...s }))),
    ]);

    if (dlRes.error || stRes.error) {
      setError(
        "Event saved, but the default checklist didn't. Open the event and add rows manually."
      );
      setBusy(false);
      return;
    }

    router.push(`/events/${eventId}`);
  }

  return (
    <div className="max-w-[560px] pt-10 sm:pt-16">
      <h1 className="display text-[40px] sm:text-[52px]">Start an event</h1>
      <p className="mt-3 text-[14.5px] text-ink-70">
        Set the date and the whole checklist dates itself — fifteen deliverables, each counting
        backward from the day of the event. You can change any of them afterward.
      </p>

      <div className="mt-9 grid gap-5">
        <Field label="Event name">
          <input
            className="input"
            value={name}
            autoFocus
            placeholder="Pilates in the Park — Fall Edition"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !busy) create();
            }}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Event type">
            <Select
              value={type}
              options={EVENT_TYPES}
              onChange={(v) => setType(v as EventType)}
            />
          </Field>
          <Field label="Is the date locked?">
            <Select
              value={dateStatus}
              options={DATE_STATUSES}
              onChange={(v) => setDateStatus(v as DateStatus)}
            />
          </Field>
          <Field label="Date" hint="Can be left blank and added later.">
            <input
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <Field label="Location">
            <input
              className="input"
              value={location}
              placeholder="Bishop Arts"
              onChange={(e) => setLocation(e.target.value)}
            />
          </Field>
        </div>

        {error ? <p className="text-[13.5px] font-semibold text-flare">{error}</p> : null}

        <div className="mt-2 flex items-center gap-3">
          <button className="btn btn-solid" disabled={busy} onClick={create}>
            {busy ? "Creating…" : "Create event"}
          </button>
          <button className="btn btn-quiet" onClick={() => router.push("/")}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
