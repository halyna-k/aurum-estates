import type { Service } from "@/types/service";

export const SERVICES: Service[] = [
  {
    id: "lettings",
    title: "Residential lettings",
    description:
      "Flats and houses to rent across London. Tell us what you are looking for and an agent will arrange viewings that suit you.",
    icon: "home",
  },
  {
    id: "landlords",
    title: "Landlord management",
    description:
      "We find and reference tenants, protect deposits, arrange repairs and collect the rent, so you do not have to handle the day-to-day.",
    icon: "key",
  },
  {
    id: "assistant",
    title: "Aura, our AI assistant",
    description:
      "Ask Aura about the renting process or leave your details at any hour. An agent reviews every enquiry and replies during working hours.",
    icon: "message",
  },
];
