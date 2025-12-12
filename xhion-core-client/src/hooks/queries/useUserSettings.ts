import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { settingsService } from '@/services/settingsService';

/**
 * Hook para obtener sesiones activas del usuario
 */
export function useUserSessions(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.users.sessions,
        queryFn: settingsService.getSessions,
        staleTime: 1000 * 60 * 2, // 2 minutos
        ...options,
    });
}

/**
 * Hook para obtener el perfil profesional del usuario
 */
export function useProfessionalProfile(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.users.professionalProfile,
        queryFn: settingsService.getProfessionalProfile,
        staleTime: 1000 * 60 * 5, // 5 minutos
        ...options,
    });
}

/**
 * Hook para obtener contactos del usuario
 */
export function useUserContacts(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.users.contacts,
        queryFn: settingsService.getContactos,
        staleTime: 1000 * 60 * 5, // 5 minutos
        ...options,
    });
}

/**
 * Hook para obtener enlaces profesionales del usuario
 */
export function useUserProfessionalLinks(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.users.professionalLinks,
        queryFn: settingsService.getEnlacesProfesionales,
        staleTime: 1000 * 60 * 5, // 5 minutos
        ...options,
    });
}
