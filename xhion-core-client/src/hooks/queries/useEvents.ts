import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
    eventosService,
    type Evento,
    type FiltrarEventosDto,
} from '@/services/eventosService';

/**
 * Hook para obtener eventos con filtros
 */
export function useEvents(filters?: FiltrarEventosDto, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.events.list(filters),
        queryFn: async () => {
            const response = await eventosService.getEventos(filters);
            return response.data;
        },
        ...options,
    });
}

/**
 * Hook para obtener un evento por ID
 */
export function useEvent(eventId: string | null | undefined, options?: { enabled?: boolean }) {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: queryKeys.events.detail(eventId!),
        queryFn: async () => {
            const response = await eventosService.getEventoById(eventId!);
            return response.data;
        },
        enabled: !!eventId && (options?.enabled !== false),
        placeholderData: () => {
            const queries = queryClient.getQueriesData<Evento[]>({
                queryKey: queryKeys.events.all
            });
            for (const [, data] of queries) {
                const event = data?.find(e => e.id === eventId);
                if (event) return event;
            }
            return undefined;
        },
        ...options,
    });
}

/**
 * Hook para obtener eventos de un usuario
 */
export function useUserEvents(
    userId: string | null | undefined,
    fechaDesde?: string,
    fechaHasta?: string,
    options?: { enabled?: boolean }
) {
    return useQuery({
        queryKey: [...queryKeys.events.all, 'user', userId, { fechaDesde, fechaHasta }] as const,
        queryFn: async () => {
            const response = await eventosService.getEventosByUsuario(userId!, fechaDesde, fechaHasta);
            return response.data;
        },
        enabled: !!userId && (options?.enabled !== false),
        ...options,
    });
}

/**
 * Hook para obtener eventos de un proyecto
 */
export function useProjectEvents(projectId: string | null | undefined, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: [...queryKeys.events.all, 'project', projectId] as const,
        queryFn: async () => {
            const response = await eventosService.getEventosByProyecto(projectId!);
            return response.data;
        },
        enabled: !!projectId && (options?.enabled !== false),
        ...options,
    });
}

/**
 * Hook para obtener eventos próximos
 */
export function useUpcomingEvents(dias: number = 7, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: [...queryKeys.events.all, 'upcoming', dias] as const,
        queryFn: async () => {
            const response = await eventosService.getEventosProximos(dias);
            return response.data;
        },
        staleTime: 1000 * 60, // 1 minuto
        ...options,
    });
}

/**
 * Hook para eventos del calendario (por rango de fechas)
 */
export function useCalendarEvents(fechaDesde?: string, fechaHasta?: string, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.calendar.events({ start: fechaDesde, end: fechaHasta }),
        queryFn: async () => {
            const response = await eventosService.getEventos({ fechaDesde, fechaHasta });
            return response.data;
        },
        ...options,
    });
}
