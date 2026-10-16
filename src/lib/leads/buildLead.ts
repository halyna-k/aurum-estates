import type { AgencyConfig } from "@/types/agency";
import type { IsoDateTime, LeadAnswers, LeadData } from "@/types/lead";
import { triageLead } from "./triage";

type Contactable = Partial<LeadAnswers> & Pick<LeadAnswers, "fullName" | "email">;

export function hasContact(answers: Partial<LeadAnswers>): answers is Contactable {
  return Boolean(answers.fullName && answers.email);
}

interface BuildLeadInput {
  answers: Contactable;
  monthlyRent: number | undefined;
  sessionId: string;
  privacyAcknowledgedAt: IsoDateTime;
  agency: AgencyConfig;
}

export function buildLead({
  answers,
  monthlyRent,
  sessionId,
  privacyAcknowledgedAt,
  agency,
}: BuildLeadInput): LeadData {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + agency.legal.retentionMonths);

  return {
    ...answers,
    agencyId: agency.id,
    qualification: triageLead(answers, monthlyRent, agency),
    status: answers.viewingPreference ? "viewing_requested" : "new",
    privacy: {
      noticeVersion: agency.legal.privacyNoticeVersion,
      acknowledgedAt: privacyAcknowledgedAt,
      marketingOptIn: false,
    },
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    sessionId,
  };
}
