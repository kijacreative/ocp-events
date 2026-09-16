"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isConfigured } from "@/lib/supabase";

const PASSCODE = process.env.NEXT_PUBLIC_APP_PASSCODE || "";
const STORAGE_KEY = "ocp-events-unlocked";

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [unlocked, setUnlocked] = useState(!PASSCODE);
  const [ready, setReady] = useState(!PASSCODE);
  const [entry, setEntry] = useState("");
  const [wrong, setWrong] = useState(false);

  useEffect(() => {
    if (!PASSCODE) return;
    setUnlocked(window.localStorage.getItem(STORAGE_KEY) === PASSCODE);
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!unlocked) {
    return (
      <main className="mx-auto max-w-[380px] px-6 pt-[22vh]">
        <h1 className="display text-[42px]">Oak Cliff Pilates</h1>
        <p className="mt-2 text-[14px] text-ink-70">
          Enter the team passcode to open the call sheet.
        </p>
        <div className="mt-6 flex gap-2">
          <input
            className="input"
            type="password"
            value={entry}
            autoFocus
            placeholder="Passcode"
            onChange={(e) => {
              setEntry(e.target.value);
              setWrong(false);
            }}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              if (entry === PASSCODE) {
                window.localStorage.setItem(STORAGE_KEY, entry);
                setUnlocked(true);
              } else setWrong(true);
            }}
          />
          <button
            className="btn btn-solid"
            onClick={() => {
              if (entry === PASSCODE) {
                window.localStorage.setItem(STORAGE_KEY, entry);
                setUnlocked(true);
              } else setWrong(true);
            }}
          >
            Open
          </button>
        </div>
        {wrong ? (
          <p className="mt-3 text-[13px] font-semibold text-flare">
            That passcode doesn&apos;t match. Ask Kiel or Amanda for the current one.
          </p>
        ) : null}
      </main>
    );
  }

  const nav = [
    { href: "/", label: "Call sheet" },
    { href: "/tasks", label: "Deadlines" },
  ];

  return (
    <>
      <header className="sticky top-0 z-20 border-b-2 border-ink bg-paper">
        <div className="mx-auto flex max-w-[1140px] items-center gap-6 px-5 py-3 sm:px-8">
          <Link href="/" className="display text-[20px] leading-none">
            Oak Cliff Pilates
          </Link>
          <nav className="flex gap-4 text-[13.5px] font-semibold">
            {nav.map((n) => {
              const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={
                    active
                      ? "border-b-2 border-flare pb-0.5 text-ink"
                      : "border-b-2 border-transparent pb-0.5 text-ink-45 hover:text-ink"
                  }
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <Link href="/events/new" className="btn btn-solid ml-auto !px-3 !py-1.5 !text-[13px]">
            New event
          </Link>
        </div>
      </header>

      {!isConfigured ? (
        <div className="border-b border-rule bg-warn-wash">
          <div className="mx-auto max-w-[1140px] px-5 py-3 text-[13.5px] text-warn sm:px-8">
            <strong className="font-bold">Not connected to the database.</strong> Add
            NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in Vercel, then
            redeploy.
            Setup steps are in the project README.
          </div>
        </div>
      ) : null}

      <main className="mx-auto max-w-[1140px] px-5 pb-24 sm:px-8">{children}</main>
    </>
  );
}
