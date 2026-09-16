"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { isConfigured } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";

function SignIn({ sendLink }: { sendLink: (email: string) => Promise<string | null> }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!email.trim() || busy) return;
    setBusy(true);
    setError("");
    const problem = await sendLink(email);
    setBusy(false);
    if (problem) setError(problem);
    else setSent(true);
  }

  if (sent) {
    return (
      <main className="mx-auto max-w-[420px] px-6 pt-[22vh]">
        <h1 className="display text-[42px]">Check your email</h1>
        <p className="mt-3 text-[14.5px] text-ink-70">
          A sign-in link is on its way to <strong className="font-semibold">{email}</strong>. It
          works once and expires in an hour.
        </p>
        <button
          className="btn btn-quiet mt-6"
          onClick={() => {
            setSent(false);
            setError("");
          }}
        >
          Use a different address
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[420px] px-6 pt-[22vh]">
      <h1 className="display text-[42px]">Oak Cliff Pilates</h1>
      <p className="mt-2 text-[14.5px] text-ink-70">
        Sign in with your work email and we&apos;ll send you a link. No password to remember.
      </p>
      <div className="mt-6 flex gap-2">
        <input
          className="input"
          type="email"
          value={email}
          autoFocus
          placeholder="you@oakcliffpilates.com"
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />
        <button className="btn btn-solid" disabled={busy} onClick={submit}>
          {busy ? "Sending…" : "Send link"}
        </button>
      </div>
      {error ? <p className="mt-3 text-[13px] font-semibold text-flare">{error}</p> : null}
    </main>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, email, sendLink, signOut } = useAuth();

  if (state === "checking") return null;

  // Without keys there is nothing to sign in to; let the page explain itself.
  if (state === "signed-out") return <SignIn sendLink={sendLink} />;

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
          <div className="ml-auto flex items-center gap-3">
            <Link href="/events/new" className="btn btn-solid !px-3 !py-1.5 !text-[13px]">
              New event
            </Link>
            {email ? (
              <button
                onClick={signOut}
                title={email}
                className="text-[13px] font-semibold text-ink-45 hover:text-ink"
              >
                Sign out
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {!isConfigured ? (
        <div className="border-b border-rule bg-warn-wash">
          <div className="mx-auto max-w-[1140px] px-5 py-3 text-[13.5px] text-warn sm:px-8">
            <strong className="font-bold">Not connected to the database.</strong> Add
            NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in Vercel, then
            redeploy. Setup steps are in the project README.
          </div>
        </div>
      ) : null}

      <main className="mx-auto max-w-[1140px] px-5 pb-24 sm:px-8">{children}</main>
    </>
  );
}
