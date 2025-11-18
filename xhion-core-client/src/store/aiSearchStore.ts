import { create } from "zustand";
import { aiService, type AiSearchPayload, type AiSearchResult } from "@/services/aiService";

const MAX_RECENT_QUERIES = 8;

interface AiSearchState {
  query: string;
  results: AiSearchResult | null;
  isLoading: boolean;
  error: string | null;
  recentQueries: string[];
  activeRequestId: string | null;
  setQuery: (value: string) => void;
  clearResults: () => void;
  search: (payload: AiSearchPayload) => Promise<void>;
}

export const useAiSearchStore = create<AiSearchState>((set) => ({
  query: "",
  results: null,
  isLoading: false,
  error: null,
  recentQueries: [],
  activeRequestId: null,

  setQuery: (value) => set({ query: value }),

  clearResults: () =>
    set({
      results: null,
      error: null,
      isLoading: false,
      activeRequestId: null,
    }),

  search: async (payload) => {
    const trimmedQuery = payload.query.trim();
    if (!trimmedQuery) {
      set({ query: "", results: null, error: null, isLoading: false });
      return;
    }

    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set({ isLoading: true, error: null, activeRequestId: requestId, query: trimmedQuery });

    try {
      const result = await aiService.search({ ...payload, query: trimmedQuery });

      set((state) => {
        if (state.activeRequestId !== requestId) {
          return state;
        }

        const existingWithoutCurrent = state.recentQueries.filter((q) => q.toLowerCase() !== trimmedQuery.toLowerCase());
        const updatedRecents = [trimmedQuery, ...existingWithoutCurrent].slice(0, MAX_RECENT_QUERIES);

        return {
          results: result,
          isLoading: false,
          error: null,
          recentQueries: updatedRecents,
          activeRequestId: null,
        };
      });
    } catch (error: any) {
      set((state) => {
        if (state.activeRequestId !== requestId) {
          return state;
        }

        return {
          isLoading: false,
          error: error?.response?.data?.message || error?.message || "Error al consultar la IA",
          activeRequestId: null,
        };
      });
    }
  },
}));
