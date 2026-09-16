"use client";

import { getSupabase } from "@/lib/supabase";
import { HELPER_ROLES, INSTRUCTOR_ROLES, type StaffRow } from "@/lib/types";
import { Select, TextInput } from "./ui";

export default function StaffTable({
  rows,
  kind,
  eventId,
  onLocal,
  onAdded,
  onRemoved,
  onError,
}: {
  rows: StaffRow[];
  kind: "instructor" | "helper";
  eventId: string;
  onLocal: (id: string, patch: Partial<StaffRow>) => void;
  onAdded: (row: StaffRow) => void;
  onRemoved: (id: string) => void;
  onError: () => void;
}) {
  const list = rows.filter((r) => r.kind === kind);
  const roles = kind === "instructor" ? INSTRUCTOR_ROLES : HELPER_ROLES;

  async function patch(id: string, p: Partial<StaffRow>) {
    onLocal(id, p);
    const sb = getSupabase();
    if (!sb) return;
    const { error } = await sb.from("event_staff").update(p).eq("id", id);
    if (error) onError();
  }

  async function addRow() {
    const sb = getSupabase();
    if (!sb) return;
    const nextOrder = list.length ? Math.max(...list.map((r) => r.sort_order)) + 1 : 1;
    const { data, error } = await sb
      .from("event_staff")
      .insert({ event_id: eventId, kind, role: roles[0], sort_order: nextOrder })
      .select()
      .single();
    if (error || !data) {
      onError();
      return;
    }
    onAdded(data as StaffRow);
  }

  async function removeRow(id: string) {
    const sb = getSupabase();
    if (!sb) return;
    onRemoved(id);
    const { error } = await sb.from("event_staff").delete().eq("id", id);
    if (error) onError();
  }

  return (
    <div>
      <div className="hidden grid-cols-[150px_150px_88px_1fr_28px] items-center gap-2 py-2 text-[12px] font-semibold text-ink-45 lg:grid">
        <span>Name</span>
        <span>Role</span>
        <span>Pay rate</span>
        <span>What they&apos;re responsible for</span>
        <span />
      </div>

      {list.length === 0 ? (
        <p className="border-t border-rule py-4 text-[13.5px] text-ink-45">
          No {kind === "instructor" ? "instructors" : "helpers"} assigned yet.
        </p>
      ) : null}

      {list.map((r) => (
        <div
          key={r.id}
          className="row-grid grid grid-cols-1 items-center gap-2 py-2.5 lg:grid-cols-[150px_150px_88px_1fr_28px]"
        >
          <TextInput bare value={r.name} placeholder="Name" onCommit={(v) => patch(r.id, { name: v })} />
          <Select bare value={r.role} options={roles} onChange={(v) => patch(r.id, { role: v })} />
          <TextInput
            bare
            type="number"
            value={r.pay_rate}
            placeholder="0"
            onCommit={(v) => patch(r.id, { pay_rate: v === "" ? null : Number(v) })}
          />
          <TextInput
            bare
            value={r.expectations}
            placeholder="Call time, what they run, what they hand off"
            onCommit={(v) => patch(r.id, { expectations: v })}
          />
          <button
            className="btn btn-quiet !px-1.5 text-[16px] leading-none justify-self-start lg:justify-self-auto"
            aria-label={`Remove ${r.name || "row"}`}
            onClick={() => removeRow(r.id)}
          >
            ×
          </button>
        </div>
      ))}

      <button className="btn btn-quiet mt-3 !px-0" onClick={addRow}>
        + Add {kind === "instructor" ? "an instructor" : "a helper"}
      </button>
    </div>
  );
}
