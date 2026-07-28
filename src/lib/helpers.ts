import { LeadData } from "../types/lead";

// Helper functions
export function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

// Lead data extractor
export function extractLeadData(content: string): {
  action?: string;
  leadData?: LeadData;
  qualificationScore?: string;
  cleanMessage: string;
  } {
  const leadMatch = content.match(/<LEAD_DATA>([\s\S]*?)<\/LEAD_DATA>/);

  if (!leadMatch) {
    return { cleanMessage: content };
  }

  try {
    const parsed = JSON.parse(leadMatch[1].trim());
    const cleanMessage = content.replace(/<LEAD_DATA>[\s\S]*?<\/LEAD_DATA>/, "").trim();
    return {
      action: parsed.action,
      leadData: parsed.leadData,
      qualificationScore: parsed.qualificationScore,
      cleanMessage,
    };
  } catch {
    return { cleanMessage: content.replace(/<LEAD_DATA>[\s\S]*?<\/LEAD_DATA>/, "").trim() };
  }
}

// Rate limiting (simple in-memory, replace with Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 30;

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) return false;

  entry.count++;
  return true;
}
