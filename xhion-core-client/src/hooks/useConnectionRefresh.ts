import { useEffect, useRef } from 'react';
import { useConnectionStore } from '@/store/connectionStore';

/**
 * Hook that automatically triggers a refresh when connection is restored.
 * Use this hook in components that need to refresh their data after a disconnection.
 * 
 * @param options Configuration options
 * @param options.onRefresh - Optional callback to run on connection restore (for data fetching)
 * @param options.reloadPage - If true, reloads the entire page on reconnect (default: false)
 * @param options.enabled - Whether the hook is active (default: true)
 * 
 * @example
 * // Run custom logic on reconnect
 * useConnectionRefresh({ onRefresh: () => refetchMyData() });
 * 
 * // Reload page on reconnect (for critical state)
 * useConnectionRefresh({ reloadPage: true });
 */
export function useConnectionRefresh(options?: {
    onRefresh?: () => void;
    reloadPage?: boolean;
    enabled?: boolean;
}) {
    const { onRefresh, reloadPage = false, enabled = true } = options || {};
    const subscribeToRefresh = useConnectionStore(state => state.subscribeToRefresh);
    const isServerConnected = useConnectionStore(state => state.isServerConnected);
    const refreshKey = useConnectionStore(state => state.refreshKey);

    // Track if we've been disconnected to only refresh after reconnect
    const wasDisconnected = useRef(false);

    // Track disconnection state
    useEffect(() => {
        if (!isServerConnected) {
            wasDisconnected.current = true;
        }
    }, [isServerConnected]);

    // Subscribe to refresh events
    useEffect(() => {
        if (!enabled) return;

        const unsubscribe = subscribeToRefresh(() => {
            // Only refresh if we were previously disconnected
            if (!wasDisconnected.current) return;

            console.log('🔄 Connection restored - refreshing...');

            if (reloadPage) {
                // Small delay to show the success toast before reload
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else if (onRefresh) {
                // Run custom callback
                onRefresh();
            }

            wasDisconnected.current = false;
        });

        return unsubscribe;
    }, [enabled, reloadPage, onRefresh, subscribeToRefresh]);

    return {
        isConnected: isServerConnected,
        refreshKey,
        wasDisconnected: wasDisconnected.current,
    };
}

/**
 * Hook that provides the refresh key for use in component dependencies.
 * When connection is restored, the refreshKey changes, triggering re-renders.
 * 
 * @example
 * const { refreshKey } = useRefreshKey();
 * useEffect(() => {
 *   fetchData();
 * }, [refreshKey]); // Re-fetches when connection is restored
 */
export function useRefreshKey() {
    const refreshKey = useConnectionStore(state => state.refreshKey);
    const isServerConnected = useConnectionStore(state => state.isServerConnected);

    return {
        refreshKey,
        isConnected: isServerConnected,
    };
}
