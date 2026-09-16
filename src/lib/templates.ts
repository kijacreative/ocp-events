import type { DeliverableRow } from "./types";

type Seed = Pick<DeliverableRow, "category" | "title" | "owner" | "lead_days" | "sort_order">;

/**
 * Deliverables created with every new event, with their default lead times
 * (days before the event date). Change these and every future event picks up
 * the new defaults; events already created keep their own copy.
 */
export const DELIVERABLE_TEMPLATE: Seed[] = [
  { category: "creative", title: "Event calendar graphic", owner: "Kiel", lead_days: 30, sort_order: 1 },
  { category: "creative", title: "Event page graphic", owner: "Kiel", lead_days: 28, sort_order: 2 },
  { category: "creative", title: "App graphic", owner: "Kiel", lead_days: 26, sort_order: 3 },
  { category: "creative", title: "Email graphic", owner: "Kiel", lead_days: 24, sort_order: 4 },
  { category: "creative", title: "Social graphic", owner: "Kiel", lead_days: 21, sort_order: 5 },

  { category: "marketing", title: "Event page live on site", owner: "Kiel", lead_days: 25, sort_order: 1 },
  { category: "marketing", title: "Social — creative concept locked", owner: "Stephanie", lead_days: 24, sort_order: 2 },
  { category: "marketing", title: "App promo live in Arketa", owner: "Charley", lead_days: 21, sort_order: 3 },
  { category: "marketing", title: "Email — announcement", owner: "Abby", lead_days: 21, sort_order: 4 },
  { category: "marketing", title: "Social — general post", owner: "Stephanie", lead_days: 18, sort_order: 5 },
  { category: "marketing", title: "Email confirmation to trainers", owner: "Isabel", lead_days: 14, sort_order: 6 },
  { category: "marketing", title: "Social — post with trainer", owner: "Stephanie", lead_days: 12, sort_order: 7 },
  { category: "marketing", title: "Trainer confirmation received", owner: "Isabel", lead_days: 10, sort_order: 8 },
  { category: "marketing", title: "Email — event email", owner: "Abby", lead_days: 7, sort_order: 9 },
  { category: "marketing", title: "Email — reminder", owner: "Abby", lead_days: 2, sort_order: 10 },
];

export const STAFF_TEMPLATE = [
  { kind: "instructor" as const, role: "Lead Instructor", sort_order: 1 },
  { kind: "helper" as const, role: "Front Desk / Check-In", sort_order: 1 },
];
