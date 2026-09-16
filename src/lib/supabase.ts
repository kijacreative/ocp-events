import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * Supabase renamed the browser-safe key. New projects issue a publishable key
 * (`sb_publishable_…`); older ones issue an anon JWT. Either works here, so we
 * accept both and prefer the newer name.
 */
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(url && key);

let client: SupabaseClient | null = null;

/**
 * Returns the Supabase client, or null when env vars are missing.
 * Kept lazy so `next build` succeeds before the project is connected.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isConfigured) return null;
  if (!client) {
    client = createClient(url as string, key as string, {
      auth: { persistSession: false },
    });
  }
  return client;
}
