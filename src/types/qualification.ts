export const LEAD_QUALIFICATIONS = ["qualified", "conditional", "needs_review"] as const;

export type LeadQualification = (typeof LEAD_QUALIFICATIONS)[number];
