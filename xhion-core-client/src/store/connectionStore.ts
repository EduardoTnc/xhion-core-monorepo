import { create } from 'zustand';
import { toast } from 'sonner';

// Callbacks that will be called when connection is restored
type RefreshCallback = () => void;
const refreshCallbacks: Set<RefreshCallback> = new Set();

export interface ConnectionState {
    // Network status
    isOnline: boolean;
    // Backend API connectivity
    isServerConnected: boolean;
    // Reconnection in progress
    isReconnecting: boolean;
    // Last connection check timestamp
    lastCheck: Date | null;
    // Last error message
    lastError: string | null;
    // Show global connection banner
    showBanner: boolean;
    // Reconnection attempt count
    reconnectAttempts: number;
    // Refresh key - increments when connection is restored (for React deps)
    refreshKey: number;
    // Actions
    setOnline: (status: boolean) => void;
    setServerConnected: (status: boolean) => void;
    setReconnecting: (status: boolean) => void;
    setError: (error: string | null) => void;
    setBannerVisible: (visible: boolean) => void;
    incrementReconnectAttempts: () => void;
    resetReconnectAttempts: () => void;
    // Helper to check if operations should be blocked
    canPerformMutations: () => boolean;
    // Show warning toast for blocked operations
    showBlockedOperationToast: () => void;
    // Trigger refresh of all subscribed components
    triggerRefresh: () => void;
    // Subscribe to refresh events (returns unsubscribe function)
    subscribeToRefresh: (callback: RefreshCallback) => () => void;
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isServerConnected: true,
    isReconnecting: false,
    lastCheck: null,
    lastError: null,
    showBanner: false,
    reconnectAttempts: 0,
    refreshKey: 0,

    setOnline: (status: boolean) => {
        const prevStatus = get().isOnline;
        set({ isOnline: status, lastCheck: new Date() });

        // Show banner if going offline
        if (!status && prevStatus) {
            set({ showBanner: true });
            toast.error('Sin conexión a Internet', {
                description: 'Verifica tu conexión de red',
                duration: 5000,
            });
        }

        // Hide banner and trigger refresh if back online
        if (status && !prevStatus) {
            if (get().isServerConnected) {
                set({ showBanner: false, reconnectAttempts: 0 });
            }
            toast.success('Conexión restaurada', {
                description: 'Ya puedes continuar trabajando',
                duration: 3000,
            });
            // Trigger refresh when coming back online
            get().triggerRefresh();
        }
    },

    setServerConnected: (status: boolean) => {
        const prevStatus = get().isServerConnected;
        set({
            isServerConnected: status,
            lastCheck: new Date(),
            isReconnecting: false,
        });

        // Show banner if server disconnected
        if (!status && prevStatus) {
            set({ showBanner: true });
        }

        // Hide banner and trigger refresh if server reconnected
        if (status && !prevStatus) {
            set({ showBanner: false, reconnectAttempts: 0, lastError: null });
            toast.success('Servidor conectado', {
                description: 'Actualizando datos...',
                duration: 3000,
            });
            // Trigger refresh when server reconnects
            get().triggerRefresh();
        }
    },

    setReconnecting: (status: boolean) => {
        set({ isReconnecting: status });
    },

    setError: (error: string | null) => {
        set({ lastError: error });
    },

    setBannerVisible: (visible: boolean) => {
        set({ showBanner: visible });
    },

    incrementReconnectAttempts: () => {
        set((state) => ({ reconnectAttempts: state.reconnectAttempts + 1 }));
    },

    resetReconnectAttempts: () => {
        set({ reconnectAttempts: 0 });
    },

    canPerformMutations: () => {
        const { isOnline, isServerConnected } = get();
        return isOnline && isServerConnected;
    },

    showBlockedOperationToast: () => {
        const { isOnline, isServerConnected } = get();

        if (!isOnline) {
            toast.error('Sin conexión a Internet', {
                description: 'No puedes realizar esta acción sin conexión. Verifica tu red.',
                duration: 4000,
            });
        } else if (!isServerConnected) {
            toast.error('Servidor no disponible', {
                description: 'No hay conexión con el servidor. Los cambios no se guardarán.',
                duration: 4000,
            });
        }
    },

    triggerRefresh: () => {
        console.log('🔄 Triggering refresh for all subscribed components...');
        // Increment refresh key to trigger React re-renders
        set((state) => ({ refreshKey: state.refreshKey + 1 }));
        // Call all registered callbacks
        refreshCallbacks.forEach((callback) => {
            try {
                callback();
            } catch (error) {
                console.error('Error in refresh callback:', error);
            }
        });
    },

    subscribeToRefresh: (callback: RefreshCallback) => {
        refreshCallbacks.add(callback);
        return () => {
            refreshCallbacks.delete(callback);
        };
    },
}));

// Initialize online/offline listeners
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        useConnectionStore.getState().setOnline(true);
    });

    window.addEventListener('offline', () => {
        useConnectionStore.getState().setOnline(false);
    });
}

