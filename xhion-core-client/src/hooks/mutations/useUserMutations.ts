import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { userService } from '@/services/userService';
import { toast } from 'sonner';

/**
 * Mutation para cambiar el rol de un usuario
 */
export function useChangeUserRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
            userService.changeRole(userId, roleId),
        onSuccess: (_, variables) => {
            toast.success('Rol actualizado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al cambiar el rol');
        },
        // ⚠️ CRÍTICO: Siempre refetch al final
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.userId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.users.profile(variables.userId) });
        },
    });
}

/**
 * Mutation para cambiar el estado de un usuario (ACTIVO/INACTIVO)
 */
export function useUpdateUserStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, status }: { userId: string; status: 'ACTIVO' | 'INACTIVO' }) =>
            userService.updateStatus(userId, status),
        onSuccess: (_, variables) => {
            toast.success(`Usuario ${variables.status === 'ACTIVO' ? 'activado' : 'desactivado'} exitosamente`);
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al cambiar el estado del usuario');
        },
        // ⚠️ CRÍTICO: Siempre refetch al final
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.userId) });
        },
    });
}

/**
 * Mutation para eliminar un usuario
 */
export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => userService.deleteUser(userId),
        onSuccess: () => {
            toast.success('Usuario eliminado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al eliminar el usuario');
        },
        // ⚠️ CRÍTICO: Siempre refetch al final
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}
