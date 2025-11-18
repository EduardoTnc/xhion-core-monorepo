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
  summary: string;
  resultsByEntity: Record<string, any[]>;
  intent: string;
  actionSuggestions?: AiActionSuggestion[];
  processingTimeMs: number;
}

export interface AiSearchPayload {
  query: string;
  context?: Record<string, any>;
}

export const aiService = {
  async search(payload: AiSearchPayload): Promise<AiSearchResult> {
    const response = await apiClient.post<AiSearchResult>("/ai/search", payload);
    return response.data;
  },
};
