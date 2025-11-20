import { create } from "zustand";
import {
  aiService,
  type AiSearchPayload,
  type AiSearchResult,
  type AiSearchFeedbackPayload,
} from "@/services/aiService";

const MAX_RECENT_QUERIES = 8;
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes
const MAX_CACHE_ENTRIES = 10;

type FeedbackStatus = "idle" | "submitting" | "success" | "error";

interface CachedResult {
  result: AiSearchResult;
  cachedAt: number;
}

interface AiSearchState {
  query: string;
  results: AiSearchResult | null;
  isLoading: boolean;
  error: string | null;
  recentQueries: string[];
  activeRequestId: string | null;
  cache: Record<string, CachedResult>;
  feedbackStatus: FeedbackStatus;
  feedbackError: string | null;
  setQuery: (value: string) => void;
  clearResults: () => void;
  search: (payload: AiSearchPayload) => Promise<void>;
  submitFeedback: (payload: AiSearchFeedbackPayload) => Promise<void>;
}

const pruneCache = (cache: Record<string, CachedResult>) => {
  const entries = Object.entries(cache);
  if (entries.length <= MAX_CACHE_ENTRIES) {
    return cache;
  }

  const trimmed = entries
    .sort((a, b) => a[1].cachedAt - b[1].cachedAt)
    .slice(entries.length - MAX_CACHE_ENTRIES);

  return Object.fromEntries(trimmed);
};

export const useAiSearchStore = create<AiSearchState>((set, get) => ({
  query: "",
  results: null,
  isLoading: false,
  error: null,
  recentQueries: [],
  activeRequestId: null,
  cache: {},
  feedbackStatus: "idle",
  feedbackError: null,

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

    const normalizedQuery = trimmedQuery.toLowerCase();
    const cachedEntry = get().cache[normalizedQuery];
    const isCacheValid = cachedEntry && Date.now() - cachedEntry.cachedAt < CACHE_TTL_MS;

    if (isCacheValid) {
      set((state) => {
        const existingWithoutCurrent = state.recentQueries.filter((q) => q.toLowerCase() !== normalizedQuery);
        const updatedRecents = [trimmedQuery, ...existingWithoutCurrent].slice(0, MAX_RECENT_QUERIES);

        return {
          query: trimmedQuery,
          results: cachedEntry!.result,
          isLoading: false,
          error: null,
          recentQueries: updatedRecents,
          feedbackStatus: "idle",
          feedbackError: null,
        };
      });
      return;
    }

    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set({
      isLoading: true,
      error: null,
      activeRequestId: requestId,
      query: trimmedQuery,
      feedbackStatus: "idle",
      feedbackError: null,
    });

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
          cache: pruneCache({
            ...state.cache,
            [normalizedQuery]: { result, cachedAt: Date.now() },
          }),
          feedbackStatus: "idle",
          feedbackError: null,
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
  submitFeedback: async (payload) => {
    set({ feedbackStatus: "submitting", feedbackError: null });
    try {
      await aiService.sendFeedback(payload);
      set({ feedbackStatus: "success" });
    } catch (error: any) {
      set({
        feedbackStatus: "error",
        feedbackError: error?.response?.data?.message || error?.message || "No se pudo registrar el feedback",
      });
      throw error;
    }
  },
}));
