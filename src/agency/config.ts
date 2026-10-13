import type { AgencyConfig } from "@/types/agency";

export const agency: AgencyConfig = {
  id: "aurum-demo",
  isDemo: true,
  brand: {
    name: "Aurum Estates",
    // logoSrc: "/logo.svg",
    description:
      "Flats to rent across London. Ask Aria, our AI assistant, a question or leave your details for an agent to follow up.",
    tagline: "Flats to rent across London.",
  },
  hero: {
    eyebrow: "Lettings across London",
    headline: { lead: "Where", accent: "Exceptional", tail: "Homes Are Found" },
    subtitle: "Browse what is available, or tell our AI assistant what you are looking for.",
    intro:
      "Ask a question or leave your details at any hour. An agent reads every enquiry and replies during working hours.",
    facts: [
      { value: "24/7", label: "AI assistant" },
      { value: "Mon-Fri", label: "Agents reply" },
      { value: "London", label: "Areas covered" },
    ],
  },
  sections: {
    services: {
      eyebrow: "What we offer",
      title: "Lettings and landlord services across London",
      accent: "landlord services",
      description:
        "From your first question to a viewing, our team and Aria, our AI assistant, are here to help.",
    },
    properties: {
      eyebrow: "Featured rentals",
      title: "Properties to rent across London",
      accent: "to rent",
      description:
        "A few of the homes we are letting. These listings are illustrative and for demonstration only.",
    },
  },
  locality: "London",
  legal: {
    companyName: "Aurum Estates (fictional demo agency)",
    companyNumber: null,
    registeredAddress: null,
    icoRegistrationNumber: null,
    redressScheme: null,
    clientMoneyProtection: null,
    privacyPolicyUrl: "/privacy",
    privacyNoticeVersion: "2026-10-demo",
    privacyContactEmail: "privacy@aurum-demo.com",
    retentionMonths: 1,
  },

  chat: {
    assistantName: "Aura",
    greeting:
      "Hello, I'm Aura, an AI assistant for Aurum Estates. I can answer general questions about renting and take your details for an agent to follow up. You can speak to a person at any time.",
    humanContact: {
      phone: "020 7946 0123",
      email: "lettings@aurum-demo.com",
      hours: "Monday to Friday, 9am to 5:30pm",
    },
  },

  triage: { incomeToAnnualRent: 2.5 },
  viewings: { durationMinutes: 30 },
  leads: {} as AgencyConfig["leads"],
};
