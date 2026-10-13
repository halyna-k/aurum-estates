import type { LeadStatus } from "@/types/lead";
import type { LeadQualification } from "@/types/qualification";

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
