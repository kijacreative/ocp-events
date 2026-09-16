"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase, isConfigured } from "./supabase";
import type { DeliverableRow, EventRow, StaffRow } from "./types";

export type LoadState = "loading" | "ready" | "error" | "unconfigured";

/** All events plus their deliverables. Refetches when the tab regains focus,
 *  so a second person's edits show up without a manual reload. */
export function useAllEvents() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [deliverables, setDeliverables] = useState<DeliverableRow[]>([]);
  const [state, setState] = useState<LoadState>(isConfigured ? "loading" : "unconfigured");
  const [message, setMessage] = useState<string>("");

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) {
      setState("unconfigured");
      return;
    }
    const [ev, dl] = await Promise.all([
      sb.from("events").select("*").eq("archived", false).order("event_date", { ascending: true }),
      sb.from("deliverables").select("*").order("sort_order", { ascending: true }),
    ]);
    if (ev.error || dl.error) {
      setMessage(ev.error?.message || dl.error?.message || "Unknown error");
      setState("error");
      return;
    }
    setEvents((ev.data ?? []) as EventRow[]);
    setDeliverables((dl.data ?? []) as DeliverableRow[]);
    setState("ready");
  }, []);

  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  const patchDeliverable = useCallback(
    async (id: string, patch: Partial<DeliverableRow>) => {
      setDeliverables((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
      const sb = getSupabase();
      if (!sb) return;
      const { error } = await sb.from("deliverables").update(patch).eq("id", id);
      if (error) load();
    },
    [load]
  );

  return { events, deliverables, state, message, reload: load, patchDeliverable };
}

/** One event with its staff and deliverables. */
export function useEvent(id: string) {
  const [event, setEvent] = useState<EventRow | null>(null);
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [deliverables, setDeliverables] = useState<DeliverableRow[]>([]);
  const [state, setState] = useState<LoadState>(isConfigured ? "loading" : "unconfigured");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) {
      setState("unconfigured");
      return;
    }
    const [ev, st, dl] = await Promise.all([
      sb.from("events").select("*").eq("id", id).maybeSingle(),
      sb.from("event_staff").select("*").eq("event_id", id).order("sort_order"),
      sb.from("deliverables").select("*").eq("event_id", id).order("sort_order"),
    ]);
    if (ev.error || st.error || dl.error) {
      setMessage(ev.error?.message || st.error?.message || dl.error?.message || "Unknown error");
      setState("error");
      return;
    }
    setEvent((ev.data as EventRow) ?? null);
    setStaff((st.data ?? []) as StaffRow[]);
    setDeliverables((dl.data ?? []) as DeliverableRow[]);
    setState("ready");
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    event,
    staff,
    deliverables,
    state,
    message,
    reload: load,
    setEvent,
    setStaff,
    setDeliverables,
  };
}
