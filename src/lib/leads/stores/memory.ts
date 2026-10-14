import type { LeadData } from "@/types/lead";

/**
 * Demo store. Data is lost on restart and is not shared between serverless
 * instances. Replace the body with the agency's real destination (database,
 * CRM or email) before any live use.
 */
const leads = new Map<string, LeadData>();

/** Idempotent: saving the same session again updates the lead. */
export async function saveLead(lead: LeadData): Promise<void> {
  const existing = leads.get(lead.sessionId);
  leads.set(
    lead.sessionId,
    existing ? { ...lead, createdAt: existing.createdAt, expiresAt: existing.expiresAt } : lead,
  );
}
