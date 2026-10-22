import type { PropertyType } from "./property";
import type { LeadQualification } from "./qualification";

/** ISO 8601 date, e.g. "2026-10-06" */
export type IsoDate = string;
/** ISO 8601 date-time, e.g. "2026-10-06T14:30:00Z" */
export type IsoDateTime = string;

export const EMPLOYMENT_STATUSES = [
  "employed",
  "self_employed",
  "student",
  "retired",
  "unemployed",
  "other",
] as const;
export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number];

export const LEAD_STATUSES = ["new", "viewing_requested", "viewing_booked", "closed"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

/** Details the assistant collects. Never collect protected characteristics. */
export interface LeadAnswers {
  fullName: string;
  email: string;
  phone?: string;

  propertyId?: string;
  propertyType?: PropertyType;
  /** Bedrooms wanted. 0 means a studio. */
  bedrooms?: number;
  /** Monthly rent budget in GBP (pcm). */
  budget?: number;
  area?: string;
  moveInDate?: IsoDate;

  employmentStatus?: EmploymentStatus;
  /** Gross annual income in GBP. For the agent's reference only. */
  annualIncome?: number;
  hasGuarantor?: boolean;

  /** Household size. For property suitability only, never used in triage. */
  occupants?: number;
  /** Informational only, never used in triage. */
  hasPets?: boolean;

  /** Preferred viewing days and times, free text. */
  viewingPreference?: string;
}

export interface PrivacyRecord {
  noticeVersion: string;
  acknowledgedAt: IsoDateTime;
  /** Separate from the notice and off by default (PECR). */
  marketingOptIn: boolean;
}

/** Stored lead. Set by the server, never by the model. */
export interface LeadData extends LeadAnswers {
  agencyId: string;
  /** Orders the agent's queue. A human makes every decision. */
  qualification?: LeadQualification;
  status: LeadStatus;
  privacy: PrivacyRecord;
  createdAt: IsoDateTime;
  /** The lead is deleted after this date. */
  expiresAt: IsoDateTime;
  sessionId: string;
}
