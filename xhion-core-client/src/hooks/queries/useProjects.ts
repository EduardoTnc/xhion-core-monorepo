import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { queryKeys } from '@/lib/queryKeys';
import { projectService, type Proyecto, type Etapa, type ProyectoMiembro } from '@/services/projectService';

type ProjectFilters = {
    estado?: string;
    departamentoId?: string;
    search?: string;
};

/**
 * Hook para obtener todos los proyectos con filtros de URL
 * 
 * La URL actúa como fuente de verdad para los filtros:
 * /proyectos?estado=Activo&dept=abc123&q=busqueda
 */
export function useProjects(overrideFilters?: ProjectFilters, options?: { enabled?: boolean }) {
    const [searchParams] = useSearchParams();

    // Usar filtros del parámetro o de la URL
    const filters = overrideFilters ?? {
        estado: searchParams.get('estado') || undefined,
        departamentoId: searchParams.get('dept') || undefined,
        search: searchParams.get('q') || undefined,
    };

    return useQuery({
        queryKey: queryKeys.projects.list(filters),
        queryFn: () => projectService.getAll(filters),
        ...options,
    });
}

/**
 * Hook helper para manejar filtros de proyectos en URL
 */
export function useProjectFilters() {
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
            estado: searchParams.get('estado'),
            departamentoId: searchParams.get('dept'),
            search: searchParams.get('q'),
        },
        setFilter,
        clearFilters,
        hasActiveFilters: searchParams.toString().length > 0,
    };
}

/**
 * Hook para obtener un proyecto por ID
 * Usa placeholderData de la lista para UX instantánea
 */
export function useProject(projectId: string | null | undefined, options?: { enabled?: boolean }) {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: queryKeys.projects.detail(projectId!),
        queryFn: () => projectService.getById(projectId!),
        enabled: !!projectId && (options?.enabled !== false),
        // ⚡ UX instantánea: usar datos de la lista como placeholder
        placeholderData: () => {
            // Buscar en todas las listas cacheadas (diferentes filtros)
            const queries = queryClient.getQueriesData<Proyecto[]>({
                queryKey: queryKeys.projects.lists()
            });

            for (const [, data] of queries) {
                const project = data?.find(p => p.id === projectId);
                if (project) return project;
            }
            return undefined;
        },
        ...options,
    });
}

/**
 * Hook para obtener miembros de un proyecto
 */
export function useProjectMembers(projectId: string | null | undefined, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.projects.members(projectId!),
        queryFn: () => projectService.getMiembros(projectId!),
        enabled: !!projectId && (options?.enabled !== false),
        ...options,
    });
}

/**
 * Hook para obtener etapas de un proyecto
 */
export function useProjectStages(projectId: string | null | undefined, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.projects.stages(projectId!),
        queryFn: () => projectService.getEtapas(projectId!),
        enabled: !!projectId && (options?.enabled !== false),
        ...options,
    });
}

/**
 * Hook para prefetch de proyecto (para hover previews)
 */
export function usePrefetchProject() {
    const queryClient = useQueryClient();

    return (projectId: string) => {
        queryClient.prefetchQuery({
            queryKey: queryKeys.projects.detail(projectId),
            queryFn: () => projectService.getById(projectId),
            staleTime: 1000 * 60 * 5,
        });
    };
}
