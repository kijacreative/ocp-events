import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Event feed for Trainer HQ (hq.oakcliffpilates.com).
 *
 * Reads the `event_feed` view, never the tables. The view carries no pay
 * rates, revenue or recap figures, so nothing sensitive can reach a page
 * that has no sign-in — see supabase/005-event-feed.sql.
 *
 * The response shape matches what HQ's api/hq/events.js already expects from
 * the workbook feed, so pointing EVENTS_FEED_URL here needs no changes there.
 */

export const dynamic = "force-dynamic";

const ALLOWED_ORIGINS = [
  "https://hq.oakcliffpilates.com",
  "https://events.oakcliffpilates.com",
];

function corsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
  };
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }
  return headers;
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders(request.headers.get("origin")),
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

/** '09:00:00' -> '9:00 AM'. Kept here so the feed is readable as-is. */
function clock(value: string | null): string {
  if (!value) return "";
  const [h, m] = value.split(":");
  let hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${m} ${suffix}`;
}

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { configured: false, events: [], generated: new Date().toISOString() },
      { status: 200, headers: corsHeaders(origin) }
    );
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data, error } = await supabase
    .from("event_feed")
    .select("*")
    .order("event_date", { ascending: true });

  if (error) {
    // Say so plainly. A trainer reading invented events is worse than one
    // reading that the feed is down.
    return NextResponse.json(
      { configured: true, error: error.message, events: [], generated: new Date().toISOString() },
      { status: 502, headers: corsHeaders(origin) }
    );
  }

  const site = "https://events.oakcliffpilates.com";

  const events = (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    date: row.event_date,
    start: clock(row.start_time),
    end: clock(row.end_time),
    dateStatus: row.date_status ?? "",
    location: row.location ?? "",
    format: row.format ?? "",
    type: row.event_type ?? "",
    price: row.price === null ? "" : `$${Number(row.price).toFixed(0)}`,
    capacity: row.capacity ?? "",
    description: row.description ?? "",
    url: `${site}/events/${row.id}`,
  }));

  return NextResponse.json(
    { configured: true, events, generated: new Date().toISOString() },
    { status: 200, headers: corsHeaders(origin) }
  );
}
