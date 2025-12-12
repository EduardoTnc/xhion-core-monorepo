import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { systemSettingsService, type SystemSettings } from '@/services/systemSettingsService';

/**
 * Hook para obtener configuración del sistema
 */
export function useSystemSettings(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.systemSettings.current(),
        queryFn: () => systemSettingsService.getSettings(),
        staleTime: 1000 * 60 * 60, // 1 hora - configuración cambia muy poco
        gcTime: 1000 * 60 * 60 * 24, // 24 horas en cache
        ...options,
    });
}

/**
 * Hook para prefetch de configuración del sistema
 * Útil para cargar la configuración al inicio de la aplicación
 */
export function usePrefetchSystemSettings() {
    const queryClient = useQueryClient();

    return () => {
        queryClient.prefetchQuery({
            queryKey: queryKeys.systemSettings.current(),
            queryFn: () => systemSettingsService.getSettings(),
            staleTime: 1000 * 60 * 60,
        });
    };
}
