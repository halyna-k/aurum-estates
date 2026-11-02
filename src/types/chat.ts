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
  /** The property the applicant asked about, if any. */
  propertyId?: string;
  /** Signed by the server. The browser only passes it back. */
  sessionToken?: string;
  leadData: Partial<LeadAnswers>;
  leadSaved: boolean;
  closed: boolean;
  /** Quick replies for the current question. */
  suggestions: string[];
  agentPreview?: AgentPreviewData;
}

export interface ChatRequest {
  message: string;
  /** Earlier messages, only used as context when the assistant answers a question. */
  history: ChatMessage[];
  sessionToken?: string;
  sessionId: string;
  privacyAcknowledgedAt: IsoDateTime;
  propertyId?: string;
}

export interface ChatReply {
  message: string;
  sessionToken: string;
  /** What the server has recorded so far. */
  leadData: Partial<LeadAnswers>;
  leadSaved: boolean;
  /** The conversation has ended and the window can close. */
  closed: boolean;
  /** Quick replies for the next question. */
  suggestions: string[];
  agentPreview?: AgentPreviewData;
}
