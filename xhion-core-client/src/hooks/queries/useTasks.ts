import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { queryKeys } from '@/lib/queryKeys';
import {
    taskService,
    type Tarea,
    type Comentario,
    type TareaAdjunto,
    type TareaActividad,
    type TaskFilters,
} from '@/services/taskService';

/**
 * Hook para obtener tareas con filtros de URL
 */
export function useTasks(overrideFilters?: TaskFilters, options?: { enabled?: boolean }) {
    const [searchParams] = useSearchParams();

    const filters = overrideFilters ?? {
        proyectoId: searchParams.get('proyecto') || undefined,
        etapaId: searchParams.get('etapa') || undefined,
        asignadoId: searchParams.get('asignado') || undefined,
        estado: searchParams.get('estado') || undefined,
        prioridad: searchParams.get('prioridad') || undefined,
    };

    return useQuery({
        queryKey: queryKeys.tasks.list(filters),
        queryFn: () => taskService.getAll(filters),
        ...options,
    });
}

/**
 * Hook helper para manejar filtros de tareas en URL
 */
export function useTaskFilters() {
    const [searchParams, setSearchParams] = useSearchParams();

    const setFilter = (key: string, value: string | null) => {
        const newParams = new URLSearchParams(searchParams);
        if (value && value !== 'all') {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        setSearchParams(newParams, { replace: true });
    };

    const clearFilters = () => {
        setSearchParams(new URLSearchParams(), { replace: true });
    };

    return {
        filters: {
            proyectoId: searchParams.get('proyecto'),
            etapaId: searchParams.get('etapa'),
            asignadoId: searchParams.get('asignado'),
            estado: searchParams.get('estado'),
            prioridad: searchParams.get('prioridad'),
        },
        setFilter,
        clearFilters,
        hasActiveFilters: searchParams.toString().length > 0,
    };
}

/**
 * Hook para obtener tareas del usuario actual
 */
export function useMyTasks(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.tasks.myTasks(),
        queryFn: () => taskService.getMisTareas(),
        staleTime: 1000 * 30, // 30 segundos
        ...options,
    });
}

/**
 * Hook para obtener una tarea por ID
 */
export function useTask(taskId: string | null | undefined, options?: { enabled?: boolean }) {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: queryKeys.tasks.detail(taskId!),
        queryFn: () => taskService.getById(taskId!),
        enabled: !!taskId && (options?.enabled !== false),
        // ⚡ UX instantánea: usar datos de la lista como placeholder
        placeholderData: () => {
            const queries = queryClient.getQueriesData<Tarea[]>({
                queryKey: queryKeys.tasks.lists()
            });

            for (const [, data] of queries) {
                const task = data?.find(t => t.id === taskId);
                if (task) return task;
            }
            return undefined;
        },
        ...options,
    });
}

/**
 * Hook para obtener comentarios de una tarea
 */
export function useTaskComments(taskId: string | null | undefined, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.tasks.comments(taskId!),
        queryFn: () => taskService.getComentarios(taskId!),
        enabled: !!taskId && (options?.enabled !== false),
        ...options,
    });
}

/**
 * Hook para obtener adjuntos de una tarea
 */
export function useTaskAttachments(taskId: string | null | undefined, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.tasks.attachments(taskId!),
        queryFn: () => taskService.getAdjuntos(taskId!),
        enabled: !!taskId && (options?.enabled !== false),
        ...options,
    });
}

/**
 * Hook para obtener actividad de una tarea
 */
export function useTaskActivity(taskId: string | null | undefined, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.tasks.activity(taskId!),
        queryFn: () => taskService.getActividad(taskId!),
        enabled: !!taskId && (options?.enabled !== false),
        ...options,
    });
}

/**
 * Hook para prefetch de tarea
 */
export function usePrefetchTask() {
    const queryClient = useQueryClient();

    return (taskId: string) => {
        queryClient.prefetchQuery({
            queryKey: queryKeys.tasks.detail(taskId),
            queryFn: () => taskService.getById(taskId),
            staleTime: 1000 * 60 * 2,
        });
    };
}
