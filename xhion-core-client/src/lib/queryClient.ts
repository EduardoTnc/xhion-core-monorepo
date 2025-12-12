import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * QueryClient centralizado para TanStack Query V5
 * 
 * Configuración optimizada para XHION Core:
 * - staleTime: 5 minutos (datos frescos por más tiempo)
 * - gcTime: 30 minutos (mantener cache más tiempo)
 * - Retry inteligente: no reintentar en errores 4xx
 * - Manejo global de errores con toasts
 */
export const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error: any, query) => {
            // Solo mostrar toast para errores que no se manejan localmente
            if (query.state.data !== undefined) {
                // Si ya teníamos datos, mostrar error en background
                toast.error('Error al actualizar datos', {
                    description: error?.response?.data?.message || error?.message,
                });
            }
        },
    }),
    mutationCache: new MutationCache({
        onError: (error: any) => {
            // Error global para mutaciones sin manejo local
            const message = error?.response?.data?.message || error?.message || 'Error desconocido';
            toast.error('Error en la operación', { description: message });
        },
    }),
    defaultOptions: {
        queries: {
            // Tiempo que los datos se consideran "frescos"
            staleTime: 1000 * 60 * 5, // 5 minutos

            // Tiempo que los datos inactivos permanecen en cache
            gcTime: 1000 * 60 * 30, // 30 minutos

            // Retry inteligente
            retry: (failureCount, error: any) => {
                // No reintentar en errores de cliente (4xx)
                if (error?.response?.status >= 400 && error?.response?.status < 500) {
                    return false;
                }
                // Máximo 3 reintentos para errores de servidor
                return failureCount < 3;
            },

            // Refetch automático
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            refetchOnMount: true,
        },
        mutations: {
            retry: false,
        },
    },
});

// Exponer para debugging en desarrollo
if (import.meta.env.DEV) {
    (window as any).__queryClient = queryClient;
}

/**
 * Utilidades para invalidación de queries
 */
export const queryUtils = {
    /**
     * Invalidar todas las queries (útil al reconectar)
     */
    invalidateAll: () => queryClient.invalidateQueries(),

    /**
     * Invalidar queries por prefijo
     */
    invalidateByPrefix: (prefix: string[]) =>
        queryClient.invalidateQueries({ queryKey: prefix }),

    /**
     * Limpiar todo el cache
     */
    clearAll: () => queryClient.clear(),

    /**
     * Refetch todas las queries activas
     */
    refetchActive: () => queryClient.refetchQueries({ type: 'active' }),
};
