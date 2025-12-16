import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import apiClient from "@/api/axios";
import type { AuthUser } from "@/types";

/**
 * Sync interval in milliseconds (5 minutes)
 * Balances freshness with server load
 */
const SYNC_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Minimum time since last sync before syncing on focus (30 seconds)
 * Prevents rapid syncs when switching tabs quickly
 */
const MIN_TIME_BEFORE_FOCUS_SYNC_MS = 30 * 1000;

/**
 * Hook that automatically synchronizes user permissions from the server.
 *
 * Optimization strategies:
 * 1. Syncs every 5 minutes when window is active
 * 2. Syncs immediately when window regains focus (if >30s since last sync)
 * 3. Skips sync when document is hidden (tab inactive)
 * 4. Only updates store if permissions actually changed (diff-based)
 * 5. Uses visibility API to pause when user is away
 *
 * @example
 * // In App.tsx or main layout component
 * function App() {
 *   usePermissionSync();
 *   return <AppContent />;
 * }
 */
export function usePermissionSync() {
  const { status, token, lastPermissionSync, updateUserIfChanged } =
    useAuthStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSyncingRef = useRef(false);

  const syncPermissions = useCallback(async () => {
    // Guard: Only sync if authenticated and not already syncing
    if (status !== "authenticated" || !token || isSyncingRef.current) {
      return;
    }

    // Guard: Skip if document is hidden (user in another tab)
    if (document.hidden) {
      return;
    }

    try {
      isSyncingRef.current = true;

      // Fetch fresh user data from server
      const response = await apiClient.get<AuthUser>("/auth/me");
      const freshUser = response.data;

      // Update store only if permissions changed
      const wasUpdated = updateUserIfChanged(freshUser);

      if (wasUpdated) {
        console.info("[PermissionSync] Permisos actualizados automáticamente");
      }
    } catch (error) {
      // Silent fail - don't disrupt user experience for background sync
      // If token is invalid, the axios interceptor will handle logout
      console.warn("[PermissionSync] Error al sincronizar permisos:", error);
    } finally {
      isSyncingRef.current = false;
    }
  }, [status, token, updateUserIfChanged]);

  // Handle window focus - sync if enough time has passed
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) return; // Don't sync when hiding

    const now = Date.now();
    const timeSinceLastSync = lastPermissionSync
      ? now - lastPermissionSync
      : Infinity;

    // Only sync if enough time has passed since last sync
    if (timeSinceLastSync >= MIN_TIME_BEFORE_FOCUS_SYNC_MS) {
      syncPermissions();
    }
  }, [lastPermissionSync, syncPermissions]);

  useEffect(() => {
    // Only set up sync if authenticated
    if (status !== "authenticated") {
      return;
    }

    // Initial sync on mount (useful when permissions changed while page was closed)
    const timeSinceLastSync = lastPermissionSync
      ? Date.now() - lastPermissionSync
      : Infinity;

    if (timeSinceLastSync >= MIN_TIME_BEFORE_FOCUS_SYNC_MS) {
      syncPermissions();
    }

    // Set up periodic sync
    intervalRef.current = setInterval(syncPermissions, SYNC_INTERVAL_MS);

    // Set up visibility change listener for focus-based sync
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status, lastPermissionSync, syncPermissions, handleVisibilityChange]);

  // Expose manual sync function for special cases
  return {
    syncPermissions,
    isSyncing: isSyncingRef.current,
  };
}

export default usePermissionSync;
