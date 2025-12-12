import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { roleService } from '@/services/roleService';
import { toast } from 'sonner';

/**
 * Mutation para crear un rol
 */
export function useCreateRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { nombre: string; descripcion?: string; color?: string }) =>
            roleService.crearRol(data),
        onSuccess: () => {
            toast.success('Rol creado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al crear el rol');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
        },
    });
}

/**
 * Mutation para actualizar un rol
 */
export function useUpdateRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: { nombre?: string; descripcion?: string; color?: string } }) =>
            roleService.actualizarRol(id, data),
        onSuccess: () => {
            toast.success('Rol actualizado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al actualizar el rol');
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.roles.detail(variables.id) });
        },
    });
}

/**
 * Mutation para actualizar permisos de un rol
 */
export function useUpdateRolePermissions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ roleId, permisosIds }: { roleId: string; permisosIds: string[] }) =>
            roleService.actualizarPermisos(roleId, permisosIds),
        onSuccess: () => {
            toast.success('Permisos actualizados exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al actualizar permisos');
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.roles.detail(variables.roleId) });
        },
    });
}

/**
 * Mutation para eliminar un rol
 */
export function useDeleteRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (roleId: string) => roleService.eliminarRol(roleId),
        onSuccess: () => {
            toast.success('Rol eliminado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al eliminar el rol');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
        },
    });
}
