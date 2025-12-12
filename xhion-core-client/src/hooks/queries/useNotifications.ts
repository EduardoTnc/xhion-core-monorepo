import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { notificacionesService, type Notificacion } from '@/services/notificacionesService';

/**
 * Hook para obtener notificaciones del usuario actual
 */
export function useMyNotifications(soloNoLeidas?: boolean, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.notifications.list({ soloNoLeidas }),
        queryFn: async () => {
            const response = await notificacionesService.getMisNotificaciones(soloNoLeidas);
            return response.data;
        },
        staleTime: 1000 * 30, // 30 segundos - notificaciones cambian frecuentemente
        refetchInterval: 1000 * 60, // Refetch cada minuto
        ...options,
    });
}

/**
 * Hook para obtener notificaciones de un usuario específico
 */
export function useUserNotifications(
    userId: string | null | undefined,
    soloNoLeidas?: boolean,
    options?: { enabled?: boolean }
) {
    return useQuery({
        queryKey: [...queryKeys.notifications.all, 'user', userId, { soloNoLeidas }] as const,
        queryFn: async () => {
            const response = await notificacionesService.getNotificacionesByUsuario(userId!, soloNoLeidas);
            return response.data;
        },
        enabled: !!userId && (options?.enabled !== false),
        ...options,
    });
}

/**
 * Hook para obtener una notificación por ID
 */
export function useNotification(notificationId: string | null | undefined, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: [...queryKeys.notifications.all, 'detail', notificationId] as const,
        queryFn: async () => {
            const response = await notificacionesService.getNotificacionById(notificationId!);
            return response.data;
        },
        enabled: !!notificationId && (options?.enabled !== false),
        ...options,
    });
}

/**
 * Hook para contar notificaciones no leídas
 */
export function useUnreadNotificationsCount(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.notifications.unreadCount(),
        queryFn: async () => {
            const response = await notificacionesService.contarNoLeidas();
            return response.data;
        },
        staleTime: 1000 * 30, // 30 segundos
        refetchInterval: 1000 * 60, // Refetch cada minuto
        ...options,
    });
}
