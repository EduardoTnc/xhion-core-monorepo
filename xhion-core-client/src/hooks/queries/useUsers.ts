import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { userService } from '@/services/userService';
import type { Usuario } from '@/types';

/**
 * Hook para obtener todos los usuarios
 */
export function useUsers(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.users.lists(),
        queryFn: () => userService.obtenerTodosLosUsuarios(),
        ...options,
    });
}

/**
 * Hook para obtener un usuario por ID
 */
export function useUser(userId: string | null | undefined, options?: { enabled?: boolean }) {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: queryKeys.users.detail(userId!),
        queryFn: () => userService.obtenerUsuarioPorId(userId!),
        enabled: !!userId && (options?.enabled !== false),
        // ⚡ UX instantánea: usar datos de la lista como placeholder
        placeholderData: () => {
            const users = queryClient.getQueryData<Usuario[]>(queryKeys.users.lists());
            return users?.find(u => u.id === userId);
        },
        ...options,
    });
}

/**
 * Hook para obtener el perfil completo de un usuario
 */
export function useUserProfile(userId: string | null | undefined, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.users.profile(userId!),
        queryFn: () => userService.obtenerPerfilCompleto(userId!),
        enabled: !!userId && (options?.enabled !== false),
        staleTime: 1000 * 60 * 2, // 2 minutos (perfiles cambian poco)
        ...options,
    });
}

/**
 * Hook para prefetch de usuario (para hover previews)
 */
export function usePrefetchUser() {
    const queryClient = useQueryClient();

    return (userId: string) => {
        queryClient.prefetchQuery({
            queryKey: queryKeys.users.detail(userId),
            queryFn: () => userService.obtenerUsuarioPorId(userId),
            staleTime: 1000 * 60 * 5,
        });
    };
}

/**
 * Hook para prefetch de perfil completo
 */
export function usePrefetchUserProfile() {
    const queryClient = useQueryClient();

    return (userId: string) => {
        queryClient.prefetchQuery({
            queryKey: queryKeys.users.profile(userId),
            queryFn: () => userService.obtenerPerfilCompleto(userId),
            staleTime: 1000 * 60 * 2,
        });
    };
}
