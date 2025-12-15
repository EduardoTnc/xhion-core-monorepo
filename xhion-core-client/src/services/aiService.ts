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

// Types for AI-Assisted Project Creation
export interface AiProjectAssistRequest {
  description: string;
  departmentId?: string;
  targetDate?: string;
  preferredMethodology?: string;
}

export interface AiProjectAssistTask {
  title: string;
  description?: string;
  priority?: "high" | "medium" | "low";
  assigneeHint?: string;
}

export interface AiProjectAssistStage {
  name: string;
  durationDays: number;
  tasks: AiProjectAssistTask[];
}

export interface AiProjectAssistSuggestedProject {
  nombre: string;
  descripcion: string;
  departamentoId: string | null;
  metodologia: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface AiProjectAssistResponse {
  summary: string;
  confidence: number;
  suggestedProject: AiProjectAssistSuggestedProject;
  stages: AiProjectAssistStage[];
  risks: string[];
}

export const aiService = {
  /**
   * Search using AI - longer timeout since AI processing can take time
   */
  async search(payload: AiSearchPayload): Promise<AiSearchResult> {
    const response = await apiClient.post<AiSearchResult>("/ai/search", payload, {
      timeout: 60000, // 60 second timeout for AI operations
    });
    return response.data;
  },

  async sendFeedback(payload: AiSearchFeedbackPayload): Promise<void> {
    await apiClient.post("/ai/search/feedback", payload);
  },

  /**
   * AI-Assisted Project Creation
   * Generates project structure, stages, tasks and risk analysis based on natural language description
   */
  async assistProject(payload: AiProjectAssistRequest): Promise<AiProjectAssistResponse> {
    const response = await apiClient.post<AiProjectAssistResponse>("/ai/projects/assist", payload, {
      timeout: 90000, // 90 second timeout for complex project generation
    });
    return response.data;
  },
};
