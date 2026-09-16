"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase, isConfigured } from "./supabase";

export type AuthState = "checking" | "signed-in" | "signed-out" | "unconfigured";

/**
 * Magic-link session for the team.
 *
 * Sign-in never creates a user (`shouldCreateUser: false`). Accounts are made
 * by invitation from the Supabase dashboard, so a stranger who guesses the URL
 * and submits their own address gets a link that resolves to nothing.
 */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [state, setState] = useState<AuthState>(isConfigured ? "checking" : "unconfigured");

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;

    sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setState(data.session ? "signed-in" : "signed-out");
    });

    const { data: sub } = sb.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setState(next ? "signed-in" : "signed-out");
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  /** Emails a one-time link. Resolves to an error string, or null on success. */
  const sendLink = useCallback(async (email: string): Promise<string | null> => {
    const sb = getSupabase();
    if (!sb) return "No database connection.";
    const { error } = await sb.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: typeof window === "undefined" ? undefined : window.location.origin,
      },
    });
    if (!error) return null;
    // Supabase reports an uninvited address as a signup restriction. Say
    // something a person can act on instead of passing that through.
    if (/signups not allowed|not found|invalid/i.test(error.message)) {
      return "That address isn't on the team list. Ask Kiel or Amanda to add you.";
    }
    return error.message;
  }, []);

  const signOut = useCallback(async () => {
    await getSupabase()?.auth.signOut();
  }, []);

  return { session, state, email: session?.user.email ?? null, sendLink, signOut };
}
