import type { AgencyConfig } from "@/types/agency";
import type { LeadAnswers } from "@/types/lead";
import type { LeadQualification } from "@/types/qualification";

/**
 * Orders the agent's queue. It never rejects anyone and is never shown to the
 * applicant. Employment status, occupants and pets are deliberately not used.
 */
export function triageLead(
  lead: Partial<LeadAnswers>,
  monthlyRent: number | undefined,
  agency: AgencyConfig,
): LeadQualification {
  if (monthlyRent === undefined || lead.annualIncome === undefined) return "needs_review";

  const required = monthlyRent * 12 * agency.triage.incomeToAnnualRent;
  if (lead.annualIncome >= required) return "qualified";

  return lead.hasGuarantor ? "conditional" : "needs_review";
}
