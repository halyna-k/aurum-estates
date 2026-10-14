export interface LegalDetails {
  companyName: string;
  /** null only for a demo agency. */
  companyNumber: string | null;
  registeredAddress: string | null;
  icoRegistrationNumber: string | null;
  /** The Property Ombudsman or Property Redress Scheme. */
  redressScheme: "TPO" | "PRS" | null;
  clientMoneyProtection: string | null;
  privacyPolicyUrl: string;
  privacyNoticeVersion: string;
  privacyContactEmail: string;
  /** How long an unsuccessful enquiry is kept before deletion. */
  retentionMonths: number;
}

export interface AgencyConfig {
  id: string;
  isDemo: boolean;
  brand: {
    name: string;
    logoSrc?: string;
    description: string;
    tagline: string;
  };
  hero: {
    eyebrow: string;
    headline: { lead: string; accent: string; tail: string };
    subtitle: string;
    intro: string;
    /** Must be verifiable. Never publish invented figures. */
    facts: { value: string; label: string }[];
  };
  sections: {
    services: SectionCopy;
    properties: SectionCopy;
  };
  locality: string;
  legal: LegalDetails;
  chat: {
    assistantName: string;
    greeting: string;
    humanContact: { phone: string; email: string; hours: string };
  };
  leads: {
    notifyEmails: string[];
    // Secrets (sheet ID, credentials, email API key) live in environment variables, not here.
  };
  triage: {
    /** Minimum gross annual income as a multiple of annual rent. Internal indicator only. */
    incomeToAnnualRent: number;
  };
  viewings: { durationMinutes: number };
}

export interface SectionCopy {
  eyebrow: string;
  title: string;
  /** Part of the title shown in the accent style. Must appear in the title. */
  accent: string;
  description: string;
}
