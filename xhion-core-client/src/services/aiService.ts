import apiClient from "@/api/axios";

export type AiEntityType =
  | "PROJECT"
  | "TASK"
  | "DOCUMENT"
  | "USER"
  | "IDEA"
  | "DEPARTMENT"
  | "KNOWLEDGE";

export interface AiActionSuggestion {
  entityType: AiEntityType;
  payload: Record<string, any>;
  confidence: number;
}

export interface AiSearchResult {
  queryId: string;
  summary: string;
  resultsByEntity: Record<string, any[]>;
  intent?: string;
  actionSuggestions?: AiActionSuggestion[];
  processingTimeMs: number;
  stats?: Record<string, any>;
}

export interface AiSearchPayload {
  query: string;
  context?: Record<string, any>;
}

export interface AiSearchFeedbackPayload {
  queryId: string;
  useful: boolean;
  notes?: string;
}

export const aiService = {
  async search(payload: AiSearchPayload): Promise<AiSearchResult> {
    const response = await apiClient.post<AiSearchResult>("/ai/search", payload);
    return response.data;
  },

  async sendFeedback(payload: AiSearchFeedbackPayload): Promise<void> {
    await apiClient.post("/ai/search/feedback", payload);
  },
};
