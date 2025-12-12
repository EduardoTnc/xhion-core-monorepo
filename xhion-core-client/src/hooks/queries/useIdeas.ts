import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { queryKeys } from '@/lib/queryKeys';
import { ideasService, type Idea, type Comentario, type Estadisticas } from '@/services/ideasService';

interface IdeaFilters {
    categoria?: string;
    estado?: string;
    busqueda?: string;
}

/**
 * Hook para obtener todas las ideas con filtros de URL
 */
export function useIdeas(overrideFilters?: IdeaFilters, options?: { enabled?: boolean }) {
    const [searchParams] = useSearchParams();

    const filters = overrideFilters ?? {
        categoria: searchParams.get('categoria') || undefined,
        estado: searchParams.get('estado') || undefined,
        busqueda: searchParams.get('q') || undefined,
    };

    return useQuery({
        queryKey: queryKeys.ideas.list(filters),
        queryFn: () => ideasService.obtenerTodas(filters.categoria, filters.estado, filters.busqueda),
        ...options,
    });
}

/**
 * Hook para obtener una idea por ID
 */
export function useIdea(ideaId: string | null | undefined, options?: { enabled?: boolean }) {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: queryKeys.ideas.detail(ideaId!),
        queryFn: () => ideasService.obtenerPorId(ideaId!),
        enabled: !!ideaId && (options?.enabled !== false),
        placeholderData: () => {
            const queries = queryClient.getQueriesData<Idea[]>({
                queryKey: queryKeys.ideas.all
            });
            for (const [, data] of queries) {
                const idea = data?.find(i => i.id === ideaId);
                if (idea) return idea;
            }
            return undefined;
        },
        ...options,
    });
}

/**
 * Hook para obtener comentarios de una idea
 */
export function useIdeaComments(ideaId: string | null | undefined, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: [...queryKeys.ideas.detail(ideaId!), 'comments'] as const,
        queryFn: () => ideasService.obtenerComentarios(ideaId!),
        enabled: !!ideaId && (options?.enabled !== false),
        ...options,
    });
}

/**
 * Hook para obtener votantes de una idea
 */
export function useIdeaVoters(ideaId: string | null | undefined, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: [...queryKeys.ideas.detail(ideaId!), 'voters'] as const,
        queryFn: () => ideasService.obtenerVotantes(ideaId!),
        enabled: !!ideaId && (options?.enabled !== false),
        ...options,
    });
}

/**
 * Hook para obtener estadísticas de ideas
 */
export function useIdeasStats(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: [...queryKeys.ideas.all, 'stats'] as const,
        queryFn: () => ideasService.obtenerEstadisticas(),
        staleTime: 1000 * 60 * 5, // 5 minutos
        ...options,
    });
}

/**
 * Hook helper para filtros de ideas en URL
 */
export function useIdeaFilters() {
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
            categoria: searchParams.get('categoria'),
            estado: searchParams.get('estado'),
            busqueda: searchParams.get('q'),
        },
        setFilter,
        clearFilters,
        hasActiveFilters: searchParams.toString().length > 0,
    };
}
