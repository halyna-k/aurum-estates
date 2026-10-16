import type { LeadData } from "@/types/lead";

/** Demo store: data is lost on restart. Swap it for the agency's real destination before going live. */
const leads = new Map<string, LeadData>();

/** Saving the same session again updates the lead. */
export async function saveLead(lead: LeadData): Promise<void> {
  const existing = leads.get(lead.sessionId);
  leads.set(
    lead.sessionId,
    existing ? { ...lead, createdAt: existing.createdAt, expiresAt: existing.expiresAt } : lead,
  );
}
