import type { LeadStatus, EmploymentStatus } from "@/types/lead";
import type { LeadQualification } from "@/types/qualification";
import type { PropertyType } from "@/types/property";

/** Staff-facing labels. Used by the sheet, the email and the demo preview. */
export const TRIAGE_LABELS: Record<LeadQualification, string> = {
  qualified: "Income guide met",
  conditional: "Guarantor offered",
  needs_review: "Needs review",
};

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  viewing_requested: "Viewing requested",
  viewing_booked: "Viewing booked",
  closed: "Closed",
};

export const EMPLOYMENT_LABELS: Record<EmploymentStatus, string> = {
  employed: "Employed",
  self_employed: "Self-employed",
  student: "Student",
  retired: "Retired",
  unemployed: "Unemployed",
  other: "Other",
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  studio: "Studio",
  flat: "Flat",
  house: "House",
  room: "Room",
  other: "Other",
};
