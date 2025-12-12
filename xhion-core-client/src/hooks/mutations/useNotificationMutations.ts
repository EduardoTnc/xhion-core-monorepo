import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { notificacionesService, type CreateNotificacionDto } from '@/services/notificacionesService';
import { toast } from 'sonner';

/**
 * Mutation para crear una notificación
 */
export function useCreateNotification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateNotificacionDto) => {
            const response = await notificacionesService.createNotificacion(data);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Notificación creada');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al crear notificación');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
        },
    });
}

/**
 * Mutation para marcar notificación como leída
 */
export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await notificacionesService.marcarComoLeida(id);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
        },
    });
}

/**
 * Mutation para marcar todas las notificaciones como leídas
 */
export function useMarkAllNotificationsAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await notificacionesService.marcarTodasComoLeidas();
        },
        onSuccess: () => {
            toast.success('Todas las notificaciones marcadas como leídas');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
        },
    });
}

/**
 * Mutation para eliminar una notificación
 */
export function useDeleteNotification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await notificacionesService.deleteNotificacion(id);
        },
        onSuccess: () => {
            toast.success('Notificación eliminada');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al eliminar notificación');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
        },
    });
}

/**
 * Mutation para eliminar todas las notificaciones leídas
 */
export function useDeleteReadNotifications() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await notificacionesService.eliminarLeidas();
        },
        onSuccess: () => {
            toast.success('Notificaciones leídas eliminadas');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al eliminar notificaciones');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
        },
    });
}
