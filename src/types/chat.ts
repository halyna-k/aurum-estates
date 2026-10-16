import type { IsoDateTime, LeadAnswers, LeadStatus } from "./lead";
import type { LeadQualification } from "./qualification";

export type ChatRole = "user" | "assistant" | "system";
/** Roles accepted from the client. The server adds the system prompt itself. */
export type ClientChatRole = Exclude<ChatRole, "system">;
export type LeadField = keyof LeadAnswers;

export interface UIMessage {
  id: string;
  role: ChatRole;
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export interface ChatMessage {
  role: ClientChatRole;
  content: string;
}

/** Demo only. Never sent when agency.isDemo is false. */
export interface AgentPreviewData {
  reference: string;
  qualification: LeadQualification;
  status: LeadStatus;
}

export interface ConversationState {
  privacyAcknowledgedAt?: IsoDateTime;
  privacyDeclined: boolean;
  leadData: Partial<LeadAnswers>;
  declinedFields: LeadField[];
  leadSaved: boolean;
  agentPreview?: AgentPreviewData;
}

export interface ChatRequest {
  messages: ChatMessage[];
  leadData: Partial<LeadAnswers>;
  declinedFields: LeadField[];
  leadSaved: boolean;
  sessionId: string;
  privacyAcknowledgedAt: IsoDateTime;
}

/** The server's merged view of the lead. The client replaces its own copy with it. */
export type ChatReply = Pick<ChatRequest, "leadData" | "declinedFields" | "leadSaved"> & {
  message: string;
  agentPreview?: AgentPreviewData;
};
