export const EVENT_TYPES = [
  "Private Party",
  "Pop-Up",
  "Community Event",
  "Brand Collab",
  "OCP Event",
  "Pilates in the Park",
  "Workshop",
  "Other",
] as const;

export const DATE_STATUSES = ["Confirmed", "Tentative", "Hold", "Cancelled"] as const;

export const STATUSES = [
  "Not Started",
  "In Progress",
  "In Review",
  "Approved",
  "Blocked",
  "N/A",
] as const;

export const OWNERS = ["Kiel", "Amanda", "Abby", "Trainer", "Vendor", "Agency", "TBD"] as const;

export const INSTRUCTOR_ROLES = [
  "Lead Instructor",
  "Co-Instructor",
  "Sub",
  "DJ",
  "Guest",
  "Other",
] as const;

export const HELPER_ROLES = [
  "Front Desk / Check-In",
  "Setup + Breakdown",
  "Photo / Video",
  "Retail",
  "Floater",
  "Other",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];
export type DateStatus = (typeof DATE_STATUSES)[number];
export type DeliverableStatus = (typeof STATUSES)[number];

export type EventRow = {
  id: string;
  name: string;
  event_type: EventType;
  location: string | null;
  event_date: string | null;
  date_status: DateStatus;
  start_time: string | null;
  end_time: string | null;
  capacity: number | null;
  target_attendance: number | null;
  goals: string | null;
  description: string | null;
  price: number | null;
  discounts: string | null;
  promo_items: string | null;
  giveaways: string | null;
  equipment: string | null;
  assets_folder_url: string | null;
  actual_attendance: number | null;
  revenue: number | null;
  leads_captured: number | null;
  memberships_converted: number | null;
  recap_notes: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
};

export type StaffRow = {
  id: string;
  event_id: string;
  kind: "instructor" | "helper";
  name: string | null;
  role: string | null;
  pay_rate: number | null;
  expectations: string | null;
  sort_order: number;
};

export type DeliverableRow = {
  id: string;
  event_id: string;
  category: "creative" | "marketing";
  title: string;
  owner: string | null;
  lead_days: number;
  status: DeliverableStatus;
  done: boolean;
  link_notes: string | null;
  sort_order: number;
};

export type EventWithDeliverables = EventRow & { deliverables: DeliverableRow[] };
