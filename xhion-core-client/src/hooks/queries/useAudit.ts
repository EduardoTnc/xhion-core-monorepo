import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { queryKeys } from '@/lib/queryKeys';
import { auditService, type AuditFilters, type AuditLog, type AuditStatsData, type ActiveUser } from '@/services/auditService';

/**
 * Hook para obtener logs de auditoría con paginación tradicional
 */
export function useAuditLogs(overrideFilters?: AuditFilters, options?: { enabled?: boolean }) {
    const [searchParams] = useSearchParams();

    const filters = overrideFilters ?? {
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '50'),
        usuarioId: searchParams.get('usuario') || undefined,
        accion: searchParams.get('accion') || undefined,
        fechaDesde: searchParams.get('fechaDesde') || undefined,
        fechaHasta: searchParams.get('fechaHasta') || undefined,
        search: searchParams.get('q') || undefined,
    };

    return useQuery({
        queryKey: queryKeys.audit.logs(filters),
        queryFn: () => auditService.getAll(filters),
        ...options,
    });
}

/**
 * Hook para obtener logs de auditoría con paginación infinita
 * Ideal para infinite scroll o "Cargar más"
 */
export function useInfiniteAuditLogs(filters?: Omit<AuditFilters, 'page'>, options?: { enabled?: boolean }) {
    return useInfiniteQuery({
        queryKey: [...queryKeys.audit.logs(filters), 'infinite'] as const,
        queryFn: ({ pageParam = 1 }) =>
            auditService.getAll({ ...filters, page: pageParam, limit: filters?.limit || 50 }),

        getNextPageParam: (lastPage, allPages) => {
            const limit = filters?.limit || 50;
            const totalPages = Math.ceil(lastPage.total / limit);
            const nextPage = allPages.length + 1;
            return nextPage <= totalPages ? nextPage : undefined;
        },

        initialPageParam: 1,
        staleTime: 1000 * 60 * 2, // 2 minutos
        ...options,
    });
}

/**
 * Hook para obtener estadísticas de auditoría
 */
export function useAuditStats(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: [...queryKeys.audit.all, 'stats'] as const,
        queryFn: () => auditService.getStats(),
        staleTime: 1000 * 60, // 1 minuto
        refetchInterval: 1000 * 60 * 5, // Refetch cada 5 minutos
        ...options,
    });
}

/**
 * Hook para obtener usuarios activos
 */
export function useActiveUsers(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: [...queryKeys.audit.all, 'active-users'] as const,
        queryFn: () => auditService.getActiveUsers(),
        staleTime: 1000 * 30, // 30 segundos
        refetchInterval: 1000 * 60, // Refetch cada minuto
        ...options,
    });
}

/**
 * Hook helper para filtros de auditoría en URL
 */
export function useAuditFilters() {
    const [searchParams, setSearchParams] = useSearchParams();

    const setFilter = (key: string, value: string | null) => {
        const newParams = new URLSearchParams(searchParams);
        if (value && value !== 'all') {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        // Always reset to page 1 when filtering
        newParams.delete('page');
        setSearchParams(newParams, { replace: true });
    };

    const setPage = (page: number) => {
        const newParams = new URLSearchParams(searchParams);
        if (page > 1) {
            newParams.set('page', page.toString());
        } else {
            newParams.delete('page');
        }
        setSearchParams(newParams, { replace: true });
    };

    const clearFilters = () => {
        setSearchParams(new URLSearchParams(), { replace: true });
    };

    return {
        filters: {
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '50'),
            usuarioId: searchParams.get('usuario'),
            accion: searchParams.get('accion'),
            fechaDesde: searchParams.get('fechaDesde'),
            fechaHasta: searchParams.get('fechaHasta'),
            search: searchParams.get('q'),
        },
        setFilter,
        setPage,
        clearFilters,
        hasActiveFilters: !!searchParams.get('usuario') || !!searchParams.get('accion') ||
            !!searchParams.get('fechaDesde') || !!searchParams.get('fechaHasta') ||
            !!searchParams.get('q'),
    };
}
