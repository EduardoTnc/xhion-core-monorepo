import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  aiService,
  type AiSearchPayload,
  type AiSearchResult,
  type AiSearchFeedbackPayload,
} from "@/services/aiService";
import { nanoid } from "nanoid";

const MAX_RECENT_QUERIES = 8;
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes
const MAX_CACHE_ENTRIES = 10;
const MAX_HISTORY_ITEMS = 10;

type FeedbackStatus = "idle" | "submitting" | "success" | "error";
type BackgroundQueryStatus = "idle" | "processing" | "success" | "error";

interface CachedResult {
  result: AiSearchResult;
  cachedAt: number;
}

export interface QueryHistoryItem {
  id: string;
  query: string;
  response: string;
  timestamp: Date;
  isExpanded: boolean;
  queryId?: string; // For feedback
  feedbackGiven?: 'up' | 'down' | null;
  processingTimeMs?: number;
  resultsByEntity?: Record<string, any[]>;
}

interface BackgroundQuery {
  id: string;
  query: string;
  status: BackgroundQueryStatus;
  startedAt: Date;
  error?: string;
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

  // Query history
  queryHistory: QueryHistoryItem[];
  activeQueryId: string | null;

  // Background query support
  backgroundQuery: BackgroundQuery | null;

  // Actions
  setQuery: (value: string) => void;
  clearResults: () => void;
  search: (payload: AiSearchPayload) => Promise<void>;
  searchInBackground: (payload: AiSearchPayload) => void;
  submitFeedback: (payload: AiSearchFeedbackPayload) => Promise<void>;

  // History actions
  toggleQueryExpansion: (id: string) => void;
  setActiveQuery: (id: string | null) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
  submitHistoryFeedback: (id: string, useful: boolean) => Promise<void>;
  loadHistoryItem: (id: string) => void;

  // Background query actions
  clearBackgroundQuery: () => void;
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

export const useAiSearchStore = create<AiSearchState>()(
  persist(
    (set, get) => ({
      query: "",
      results: null,
      isLoading: false,
      error: null,
      recentQueries: [],
      activeRequestId: null,
      cache: {},
      feedbackStatus: "idle",
      feedbackError: null,
      queryHistory: [],
      activeQueryId: null,
      backgroundQuery: null,

      setQuery: (value) => set({ query: value }),

      clearResults: () =>
        set({
          results: null,
          error: null,
          isLoading: false,
          activeRequestId: null,
        }),

      clearBackgroundQuery: () => set({ backgroundQuery: null }),

      // Search in background - non-blocking, can close modal
      searchInBackground: (payload) => {
        const trimmedQuery = payload.query.trim();
        if (!trimmedQuery) return;

        const requestId = nanoid();
        const normalizedQuery = trimmedQuery.toLowerCase();

        // Check cache first
        const cachedEntry = get().cache[normalizedQuery];
        const isCacheValid = cachedEntry && Date.now() - cachedEntry.cachedAt < CACHE_TTL_MS;

        if (isCacheValid) {
          // If cached, add to history immediately
          const historyItem: QueryHistoryItem = {
            id: nanoid(),
            query: trimmedQuery,
            response: cachedEntry.result.summary,
            timestamp: new Date(),
            isExpanded: false,
            queryId: cachedEntry.result.queryId,
            feedbackGiven: null,
            processingTimeMs: cachedEntry.result.processingTimeMs,
            resultsByEntity: cachedEntry.result.resultsByEntity,
          };

          set((state) => ({
            results: cachedEntry.result,
            query: trimmedQuery,
            isLoading: false,
            activeQueryId: historyItem.id,
            queryHistory: [historyItem, ...state.queryHistory].slice(0, MAX_HISTORY_ITEMS),
            backgroundQuery: null,
          }));
          return;
        }

        // Set background query status
        set({
          backgroundQuery: {
            id: requestId,
            query: trimmedQuery,
            status: "processing",
            startedAt: new Date(),
          },
          isLoading: true,
          query: trimmedQuery,
          activeRequestId: requestId,
        });

        // Execute search asynchronously
        aiService.search({ ...payload, query: trimmedQuery })
          .then((result) => {
            const currentState = get();

            // Check if this is still the active request
            if (currentState.activeRequestId !== requestId) {
              return;
            }

            // Create history item with full data
            const historyItem: QueryHistoryItem = {
              id: nanoid(),
              query: trimmedQuery,
              response: result.summary,
              timestamp: new Date(),
              isExpanded: false,
              queryId: result.queryId,
              feedbackGiven: null,
              processingTimeMs: result.processingTimeMs,
              resultsByEntity: result.resultsByEntity,
            };

            set((state) => ({
              results: result,
              isLoading: false,
              error: null,
              activeRequestId: null,
              activeQueryId: historyItem.id,
              queryHistory: [historyItem, ...state.queryHistory].slice(0, MAX_HISTORY_ITEMS),
              backgroundQuery: {
                ...state.backgroundQuery!,
                status: "success",
              },
              cache: pruneCache({
                ...state.cache,
                [normalizedQuery]: { result, cachedAt: Date.now() },
              }),
            }));
          })
          .catch((error: any) => {
            const currentState = get();

            if (currentState.activeRequestId !== requestId) {
              return;
            }

            const errorMessage = error?.response?.data?.message || error?.message || "Error al consultar la IA";

            set((state) => ({
              isLoading: false,
              error: errorMessage,
              activeRequestId: null,
              backgroundQuery: {
                ...state.backgroundQuery!,
                status: "error",
                error: errorMessage,
              },
            }));
          });
      },

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
          // Create history item for cached result
          const historyItem: QueryHistoryItem = {
            id: nanoid(),
            query: trimmedQuery,
            response: cachedEntry.result.summary,
            timestamp: new Date(),
            isExpanded: false,
            queryId: cachedEntry.result.queryId,
            feedbackGiven: null,
            processingTimeMs: cachedEntry.result.processingTimeMs,
            resultsByEntity: cachedEntry.result.resultsByEntity,
          };

          set((state) => ({
            query: trimmedQuery,
            results: cachedEntry.result,
            isLoading: false,
            error: null,
            activeQueryId: historyItem.id,
            queryHistory: [historyItem, ...state.queryHistory].slice(0, MAX_HISTORY_ITEMS),
            feedbackStatus: "idle",
            feedbackError: null,
          }));
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
          backgroundQuery: {
            id: requestId,
            query: trimmedQuery,
            status: "processing",
            startedAt: new Date(),
          },
        });

        try {
          const result = await aiService.search({ ...payload, query: trimmedQuery });

          set((state) => {
            if (state.activeRequestId !== requestId) {
              return state;
            }

            // Create history item with full data
            const historyItem: QueryHistoryItem = {
              id: nanoid(),
              query: trimmedQuery,
              response: result.summary,
              timestamp: new Date(),
              isExpanded: false,
              queryId: result.queryId,
              feedbackGiven: null,
              processingTimeMs: result.processingTimeMs,
              resultsByEntity: result.resultsByEntity,
            };

            return {
              results: result,
              isLoading: false,
              error: null,
              activeRequestId: null,
              activeQueryId: historyItem.id,
              queryHistory: [historyItem, ...state.queryHistory].slice(0, MAX_HISTORY_ITEMS),
              backgroundQuery: {
                ...state.backgroundQuery!,
                status: "success",
              },
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

            const errorMessage = error?.response?.data?.message || error?.message || "Error al consultar la IA";

            return {
              isLoading: false,
              error: errorMessage,
              activeRequestId: null,
              backgroundQuery: {
                ...state.backgroundQuery!,
                status: "error",
                error: errorMessage,
              },
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

      // History actions
      toggleQueryExpansion: (id) => {
        set((state) => ({
          queryHistory: state.queryHistory.map((item) =>
            item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
          ),
        }));
      },

      setActiveQuery: (id) => {
        set({ activeQueryId: id });
        if (id) {
          set((state) => ({
            queryHistory: state.queryHistory.map((item) =>
              item.id === id ? { ...item, isExpanded: true } : item
            ),
          }));
        }
      },

      // Load a history item as the current result
      loadHistoryItem: (id) => {
        const item = get().queryHistory.find((h) => h.id === id);
        if (!item) return;

        // Reconstruct the result from history
        const result: AiSearchResult = {
          summary: item.response,
          queryId: item.queryId || '',
          processingTimeMs: item.processingTimeMs || 0,
          resultsByEntity: item.resultsByEntity || {},
          actionSuggestions: [],
        };

        set({
          results: result,
          query: item.query,
          activeQueryId: id,
          queryHistory: get().queryHistory.map((h) =>
            h.id === id ? { ...h, isExpanded: true } : h
          ),
        });
      },

      clearHistory: () => {
        set({ queryHistory: [], activeQueryId: null });
      },

      removeFromHistory: (id) => {
        set((state) => ({
          queryHistory: state.queryHistory.filter((item) => item.id !== id),
          activeQueryId: state.activeQueryId === id ? null : state.activeQueryId,
        }));
      },

      submitHistoryFeedback: async (id, useful) => {
        const item = get().queryHistory.find((h) => h.id === id);
        if (!item?.queryId) return;

        try {
          await aiService.sendFeedback({
            queryId: item.queryId,
            useful,
          });

          set((state) => ({
            queryHistory: state.queryHistory.map((h) =>
              h.id === id ? { ...h, feedbackGiven: useful ? 'up' : 'down' } : h
            ),
          }));
        } catch (error) {
          console.error('Error submitting history feedback:', error);
        }
      },
    }),
    {
      name: 'ai-search-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        queryHistory: state.queryHistory.map(item => ({
          ...item,
          timestamp: item.timestamp.toISOString(),
        })),
      }),
      merge: (persistedState: any, currentState) => {
        const merged = {
          ...currentState,
          ...persistedState,
        };

        if (persistedState?.queryHistory) {
          merged.queryHistory = persistedState.queryHistory.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          }));
        }

        return merged;
      },
    }
  )
);
