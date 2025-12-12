import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { roleService } from '@/services/roleService';
import type { RolCompleto, RolConConteo, Permiso, UsuarioEnRol } from '@/types';

/**
 * Hook para obtener todos los roles con conteo de usuarios
 */
export function useRoles(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.roles.list(),
        queryFn: () => roleService.obtenerRoles(),
        staleTime: 1000 * 60 * 10, // 10 minutos - roles cambian poco
        ...options,
    });
}

/**
 * Hook para obtener roles con detalles completos (permisos)
 */
export function useRolesWithDetails(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: [...queryKeys.roles.list(), 'with-details'] as const,
        queryFn: () => roleService.obtenerRolesConDetalles(),
        staleTime: 1000 * 60 * 10, // 10 minutos
        ...options,
    });
}

/**
 * Hook para obtener un rol específico por ID
 */
export function useRole(roleId: string | null | undefined, options?: { enabled?: boolean }) {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: queryKeys.roles.detail(roleId!),
        queryFn: () => roleService.obtenerRolPorId(roleId!),
        enabled: !!roleId && (options?.enabled !== false),
        // ⚡ UX instantánea: usar datos de la lista como placeholder
        placeholderData: () => {
            const roles = queryClient.getQueryData<RolCompleto[]>([...queryKeys.roles.list(), 'with-details']);
            return roles?.find(r => r.id === roleId);
        },
        ...options,
    });
}

/**
 * Hook para obtener todos los permisos disponibles
 */
export function usePermissions(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: [...queryKeys.roles.all, 'permissions'] as const,
        queryFn: () => roleService.obtenerTodosLosPermisos(),
        staleTime: 1000 * 60 * 30, // 30 minutos - permisos son casi estáticos
        ...options,
    });
}

/**
 * Hook para obtener todos los usuarios (simplificado para roles)
 * Este hook es usado por el panel de roles para asignaciones
 */
export function useUsersForRoles(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: [...queryKeys.users.all, 'for-roles'] as const,
        queryFn: () => roleService.obtenerTodosLosUsuarios(),
        ...options,
    });
}
