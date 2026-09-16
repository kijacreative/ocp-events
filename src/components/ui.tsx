"use client";

import { useEffect, useRef, useState } from "react";
import type { EventStatus } from "@/lib/derive";

/* ---------------- labelled field ---------------- */
export function Field({
  label,
  hint,
  children,
  wide,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="block text-[13px] font-semibold text-ink-70 mb-1.5">{label}</span>
      {children}
      {hint ? <span className="block text-[12px] text-ink-45 mt-1">{hint}</span> : null}
    </label>
  );
}

/* ---------------- text input that saves on blur ---------------- */
export function TextInput({
  value,
  onCommit,
  placeholder,
  type = "text",
  bare,
  className = "",
}: {
  value: string | number | null;
  onCommit: (v: string) => void;
  placeholder?: string;
  type?: string;
  bare?: boolean;
  className?: string;
}) {
  const [local, setLocal] = useState(value ?? "");
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setLocal(value ?? "");
  }, [value]);

  return (
    <input
      type={type}
      className={`${bare ? "input-bare" : "input"} ${className}`}
      value={local}
      placeholder={placeholder}
      onFocus={() => (focused.current = true)}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        focused.current = false;
        if (String(local) !== String(value ?? "")) onCommit(String(local));
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && type !== "textarea") (e.target as HTMLInputElement).blur();
      }}
    />
  );
}

export function TextArea({
  value,
  onCommit,
  placeholder,
  rows = 3,
}: {
  value: string | null;
  onCommit: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const [local, setLocal] = useState(value ?? "");
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setLocal(value ?? "");
  }, [value]);

  return (
    <textarea
      className="area"
      rows={rows}
      value={local}
      placeholder={placeholder}
      onFocus={() => (focused.current = true)}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        focused.current = false;
        if (local !== (value ?? "")) onCommit(local);
      }}
    />
  );
}

/* ---------------- select ---------------- */
export function Select({
  value,
  options,
  onChange,
  bare,
  allowBlank,
  className = "",
}: {
  value: string | null;
  options: readonly string[];
  onChange: (v: string) => void;
  bare?: boolean;
  allowBlank?: boolean;
  className?: string;
}) {
  return (
    <select
      className={`${bare ? "input-bare cursor-pointer" : "select"} ${className}`}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    >
      {allowBlank ? <option value="">—</option> : null}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

/* ---------------- checkbox ---------------- */
export function Check({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <input
      type="checkbox"
      className="check"
      checked={checked}
      aria-label={label}
      onChange={(e) => onChange(e.target.checked)}
    />
  );
}

/* ---------------- status tag ---------------- */
const STATUS_TONE: Record<EventStatus, string> = {
  Ready: "bg-ok-wash text-ok",
  "On track": "bg-ash text-ink-70",
  "At risk": "bg-warn-wash text-warn",
  Overdue: "bg-flare-wash text-flare",
  "Past event": "bg-ash text-ink-45",
  Cancelled: "bg-ash text-ink-45 line-through",
  "Date TBD": "bg-warn-wash text-warn",
};

export function StatusTag({ status }: { status: EventStatus }) {
  return <span className={`tag ${STATUS_TONE[status]}`}>{status}</span>;
}

const DELIV_TONE: Record<string, string> = {
  Approved: "bg-ok-wash text-ok",
  "In Review": "bg-warn-wash text-warn",
  "In Progress": "bg-ash text-ink",
  "Not Started": "bg-ash text-ink-45",
  Blocked: "bg-flare text-paper",
  "N/A": "bg-paper text-ink-45",
};

export function DeliverableTag({ status }: { status: string }) {
  return <span className={`tag ${DELIV_TONE[status] ?? "bg-ash text-ink-70"}`}>{status}</span>;
}

/* ---------------- section heading ---------------- */
export function Section({
  title,
  count,
  children,
  aside,
}: {
  title: string;
  count?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="mt-14">
      <div className="flex items-baseline justify-between gap-4 pb-2.5">
        <h2 className="display text-[26px] sm:text-[30px]">{title}</h2>
        {aside ?? (count ? <span className="text-[13px] text-ink-45">{count}</span> : null)}
      </div>
      <hr className="rule-heavy" />
      {children}
    </section>
  );
}

/* ---------------- save indicator ---------------- */
export function SaveState({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  if (state === "idle") return null;
  const copy =
    state === "saving" ? "Saving" : state === "saved" ? "Saved" : "Didn't save — check connection";
  const tone = state === "error" ? "text-flare" : "text-ink-45";
  return <span className={`text-[12.5px] font-semibold ${tone}`}>{copy}</span>;
}

/* ---------------- empty state ---------------- */
export function Empty({ line, action }: { line: string; action?: React.ReactNode }) {
  return (
    <div className="py-12 text-center">
      <p className="text-ink-45 text-[14px]">{line}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
