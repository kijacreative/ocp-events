"use client";

import { getSupabase } from "@/lib/supabase";
import { OWNERS, STATUSES, type DeliverableRow } from "@/lib/types";
import { daysFromToday, dueDate, formatDateShort, relativeDays } from "@/lib/derive";
import { Check, Select, TextInput } from "./ui";

export default function DeliverableTable({
  rows,
  eventDate,
  category,
  onLocal,
  onError,
  onAdded,
  onRemoved,
  eventId,
}: {
  rows: DeliverableRow[];
  eventDate: string | null;
  category: "creative" | "marketing";
  eventId: string;
  onLocal: (id: string, patch: Partial<DeliverableRow>) => void;
  onError: () => void;
  onAdded: (row: DeliverableRow) => void;
  onRemoved: (id: string) => void;
}) {
  const list = rows.filter((r) => r.category === category);

  async function patch(id: string, p: Partial<DeliverableRow>) {
    onLocal(id, p);
    const sb = getSupabase();
    if (!sb) return;
    const { error } = await sb.from("deliverables").update(p).eq("id", id);
    if (error) onError();
  }

  async function addRow() {
    const sb = getSupabase();
    if (!sb) return;
    const nextOrder = list.length ? Math.max(...list.map((r) => r.sort_order)) + 1 : 1;
    const { data, error } = await sb
      .from("deliverables")
      .insert({
        event_id: eventId,
        category,
        title: "New deliverable",
        owner: "TBD",
        lead_days: 14,
        sort_order: nextOrder,
      })
      .select()
      .single();
    if (error || !data) {
      onError();
      return;
    }
    onAdded(data as DeliverableRow);
  }

  async function removeRow(id: string) {
    const sb = getSupabase();
    if (!sb) return;
    onRemoved(id);
    const { error } = await sb.from("deliverables").delete().eq("id", id);
    if (error) onError();
  }

  return (
    <div>
      <div className="hidden grid-cols-[1fr_96px_62px_116px_116px_34px_1fr_28px] items-center gap-2 py-2 text-[12px] font-semibold text-ink-45 lg:grid">
        <span>Deliverable</span>
        <span>Owner</span>
        <span>Lead</span>
        <span>Due</span>
        <span>Status</span>
        <span>Done</span>
        <span>Link or note</span>
        <span />
      </div>

      {list.map((r) => {
        const due = dueDate(eventDate, r.lead_days);
        const days = daysFromToday(due);
        const late = !r.done && r.status !== "N/A" && days !== null && days < 0;
        const soon =
          !r.done && r.status !== "N/A" && days !== null && days >= 0 && days <= 7;

        return (
          <div
            key={r.id}
            className={`row-grid grid grid-cols-[1fr_34px] items-center gap-2 py-2.5 lg:grid-cols-[1fr_96px_62px_116px_116px_34px_1fr_28px] ${
              r.done ? "opacity-55" : ""
            } ${late ? "bg-flare-wash" : soon ? "bg-warn-wash" : ""}`}
          >
            <div className="col-span-1">
              <TextInput bare value={r.title} onCommit={(v) => patch(r.id, { title: v })} />
              <div className="mt-1 flex items-center gap-2 text-[12px] text-ink-45 lg:hidden">
                <span className={late ? "font-semibold text-flare" : ""}>
                  {relativeDays(days)}
                </span>
                <span>·</span>
                <span>{r.owner || "unassigned"}</span>
                <span>·</span>
                <span>{r.status}</span>
              </div>
            </div>

            <div className="hidden lg:block">
              <Select bare value={r.owner} options={OWNERS} onChange={(v) => patch(r.id, { owner: v })} />
            </div>

            <div className="hidden lg:block">
              <TextInput
                bare
                type="number"
                value={r.lead_days}
                onCommit={(v) => patch(r.id, { lead_days: Number(v) || 0 })}
              />
            </div>

            <div className="hidden text-[13px] lg:block">
              {due ? (
                <>
                  <span className={late ? "font-semibold text-flare" : ""}>
                    {formatDateShort(due)}
                  </span>
                  <span className="ml-1.5 text-[11.5px] text-ink-45">{relativeDays(days)}</span>
                </>
              ) : (
                <span className="text-ink-45">set event date</span>
              )}
            </div>

            <div className="hidden lg:block">
              <Select
                bare
                value={r.status}
                options={STATUSES}
                onChange={(v) => patch(r.id, { status: v as DeliverableRow["status"] })}
              />
            </div>

            <div className="hidden justify-center lg:flex">
              <Check
                checked={r.done}
                label={`Mark ${r.title} done`}
                onChange={(v) => patch(r.id, { done: v })}
              />
            </div>

            <div className="hidden lg:block">
              <TextInput
                bare
                value={r.link_notes}
                placeholder="Paste a link or leave a note"
                onCommit={(v) => patch(r.id, { link_notes: v })}
              />
            </div>

            <div className="flex items-center justify-end gap-1">
              <span className="lg:hidden">
                <Check
                  checked={r.done}
                  label={`Mark ${r.title} done`}
                  onChange={(v) => patch(r.id, { done: v })}
                />
              </span>
              <button
                className="btn btn-quiet hidden !px-1.5 text-[16px] leading-none lg:block"
                title="Remove this deliverable"
                aria-label={`Remove ${r.title}`}
                onClick={() => removeRow(r.id)}
              >
                ×
              </button>
            </div>

            {/* mobile detail row */}
            <div className="col-span-2 grid grid-cols-2 gap-2 pt-1 lg:hidden">
              <Select value={r.owner} options={OWNERS} onChange={(v) => patch(r.id, { owner: v })} />
              <Select
                value={r.status}
                options={STATUSES}
                onChange={(v) => patch(r.id, { status: v as DeliverableRow["status"] })}
              />
            </div>
          </div>
        );
      })}

      <button className="btn btn-quiet mt-3 !px-0" onClick={addRow}>
        + Add a deliverable
      </button>
    </div>
  );
}
