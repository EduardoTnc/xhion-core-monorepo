import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
    timelineService,
    type TimelineData,
    type ProyectoTimeline,
    type MyDayData,
    type TeamLoadData,
    type SugerenciaIA,
} from '@/services/timelineService';
import { toast } from 'sonner';

interface TimelineFilters {
    departamentoId?: string;
    estado?: string;
    fechaInicio?: string;
    fechaFin?: string;
}

// ==================== QUERIES ====================

/**
 * Hook para obtener datos del timeline
 */
export function useTimeline(filters?: TimelineFilters, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.timeline.list(filters),
        queryFn: () => timelineService.getTimelineData(filters),
        staleTime: 1000 * 60, // 1 minuto
        ...options,
    });
}

/**
 * Hook para obtener proyecto del timeline
 */
export function useTimelineProject(projectId: string | null | undefined, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: [...queryKeys.timeline.all, 'project', projectId] as const,
        queryFn: () => timelineService.getProyectoTimeline(projectId!),
        enabled: !!projectId && (options?.enabled !== false),
        ...options,
    });
}

/**
 * Hook para obtener "Mi Día"
 */
export function useMyDay(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: [...queryKeys.timeline.all, 'my-day'] as const,
        queryFn: () => timelineService.getMyDayData(),
        staleTime: 1000 * 30, // 30 segundos
        ...options,
    });
}

/**
 * Hook para obtener carga del equipo
 */
export function useTeamLoad(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: [...queryKeys.timeline.all, 'team-load'] as const,
        queryFn: () => timelineService.getTeamLoadData(),
        staleTime: 1000 * 60, // 1 minuto
        ...options,
    });
}

/**
 * Hook para obtener sugerencias IA globales
 */
export function useAISuggestions(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: [...queryKeys.timeline.all, 'suggestions'] as const,
        queryFn: () => timelineService.getSugerenciasGlobales(),
        staleTime: 1000 * 60 * 5, // 5 minutos
        ...options,
    });
}

/**
 * Hook para obtener dependencias de un proyecto
 */
export function useProjectDependencies(projectId: string | null | undefined, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: [...queryKeys.timeline.all, 'dependencies', projectId] as const,
        queryFn: () => timelineService.getDependencias(projectId!),
        enabled: !!projectId && (options?.enabled !== false),
        ...options,
    });
}

// ==================== MUTATIONS ====================

/**
 * Mutation para actualizar fechas de proyecto
 */
export function useUpdateProjectDates() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId, data }: { projectId: string; data: { fechaInicio?: string; fechaFin?: string } }) =>
            timelineService.actualizarFechas(projectId, data),
        onSuccess: () => {
            toast.success('Fechas actualizadas');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al actualizar fechas');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.timeline.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
        },
    });
}

/**
 * Mutation para aplicar sugerencia IA
 */
export function useApplyAISuggestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (sugerenciaId: string) => timelineService.aplicarSugerencia(sugerenciaId),
        onSuccess: (result) => {
            toast.success(result.mensaje || 'Sugerencia aplicada');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al aplicar sugerencia');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.timeline.all });
        },
    });
}

/**
 * Mutation para descartar sugerencia IA
 */
export function useDismissAISuggestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (sugerenciaId: string) => timelineService.descartarSugerencia(sugerenciaId),
        onSuccess: () => {
            toast.info('Sugerencia descartada');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [...queryKeys.timeline.all, 'suggestions'] });
        },
    });
}

/**
 * Mutation para marcar alerta como vista
 */
export function useMarkAlertViewed() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (alertaId: string) => timelineService.marcarAlertaVista(alertaId),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.timeline.all });
        },
    });
}

/**
 * Mutation para resolver alerta
 */
export function useResolveAlert() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ alertaId, accion }: { alertaId: string; accion: string }) =>
            timelineService.resolverAlerta(alertaId, accion),
        onSuccess: () => {
            toast.success('Alerta resuelta');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al resolver alerta');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.timeline.all });
        },
    });
}
