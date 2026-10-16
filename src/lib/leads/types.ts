import type { LeadData } from "@/types/lead";

/** Primary storage. A failure is reported to the applicant. */
export interface LeadStore {
  /** Creates the lead, or updates it if the same sessionId was saved before. */
  upsert(lead: LeadData): Promise<{ reference: string }>;
  deleteExpired(now: Date): Promise<number>;
  deleteByEmail(email: string): Promise<number>;
}

/** Secondary delivery (email, CRM). A failure is logged, not shown to the applicant. */
export interface LeadNotifier {
  notify(lead: LeadData, reference: string): Promise<void>;
}
