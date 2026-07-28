import { LeadData } from "./lead";

export interface UIMessage {
  id: string;
  role: "bot" | "user";
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export type QualificationScore = "qualified" | "conditional" | "declined";

export interface ConversationState {
  gdprConsented: boolean;
  leadData: Partial<LeadData>;
  qualificationScore?: QualificationScore;
  leadSaved: boolean;
  viewingRequested: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatResponse {
  message: string;
  action?: "collect" | "qualify" | "book_viewing" | "save_lead";
  leadData?: LeadData;
  qualificationScore?: QualificationScore;
  collectingField?: keyof LeadData;
}
