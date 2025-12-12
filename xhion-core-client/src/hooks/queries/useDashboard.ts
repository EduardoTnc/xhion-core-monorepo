import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { dashboardService } from '@/services/dashboardService';

/**
 * Hook para estadísticas del dashboard
 */
export function useDashboardStats(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.dashboard.stats(),
        queryFn: () => dashboardService.getStats(),
        staleTime: 1000 * 60, // 1 minuto - estadísticas cambian frecuentemente
        refetchInterval: 1000 * 60 * 5, // Refetch cada 5 minutos
        ...options,
    });
}

/**
 * Hook para tareas del día
 */
export function useTodayTasks(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.dashboard.todayTasks(),
        queryFn: () => dashboardService.getTodayTasks(),
        staleTime: 1000 * 30, // 30 segundos
        ...options,
    });
}

/**
 * Hook para proyectos activos
 */
export function useActiveProjects(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.dashboard.activeProjects(),
        queryFn: () => dashboardService.getActiveProjects(),
        ...options,
    });
}

/**
 * Hook para carga del equipo
 */
export function useTeamLoad(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.dashboard.teamLoad(),
        queryFn: () => dashboardService.getTeamLoad(),
        ...options,
    });
}

/**
 * Hook para alertas de riesgo
 */
export function useRiskAlerts(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.dashboard.riskAlerts(),
        queryFn: () => dashboardService.getRiskAlerts(),
        staleTime: 1000 * 60 * 2, // 2 minutos
        ...options,
    });
}

/**
 * Hook para timeline de comunicación
 */
export function useCommunicationTimeline(limit: number = 20, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.dashboard.timeline(limit),
        queryFn: () => dashboardService.getCommunicationTimeline(limit),
        ...options,
    });
}

/**
 * Hook para matriz de prioridades
 */
export function usePriorityMatrix(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.dashboard.priorityMatrix(),
        queryFn: () => dashboardService.getPriorityMatrix(),
        ...options,
    });
}

/**
 * Hook combinado para cargar todo el dashboard en paralelo
 * Útil para la vista principal del dashboard
 */
export function useDashboardData(options?: { enabled?: boolean }) {
    const enabled = options?.enabled !== false;

    const results = useQueries({
        queries: [
            {
                queryKey: queryKeys.dashboard.stats(),
                queryFn: () => dashboardService.getStats(),
                enabled,
            },
            {
                queryKey: queryKeys.dashboard.todayTasks(),
                queryFn: () => dashboardService.getTodayTasks(),
                enabled,
            },
            {
                queryKey: queryKeys.dashboard.activeProjects(),
                queryFn: () => dashboardService.getActiveProjects(),
                enabled,
            },
            {
                queryKey: queryKeys.dashboard.teamLoad(),
                queryFn: () => dashboardService.getTeamLoad(),
                enabled,
            },
            {
                queryKey: queryKeys.dashboard.riskAlerts(),
                queryFn: () => dashboardService.getRiskAlerts(),
                enabled,
            },
            {
                queryKey: queryKeys.dashboard.priorityMatrix(),
                queryFn: () => dashboardService.getPriorityMatrix(),
                enabled,
            },
        ],
    });

    return {
        stats: results[0],
        todayTasks: results[1],
        activeProjects: results[2],
        teamLoad: results[3],
        riskAlerts: results[4],
        priorityMatrix: results[5],
        isLoading: results.some(r => r.isLoading),
        isPending: results.some(r => r.isPending),
        isError: results.some(r => r.isError),
        refetchAll: () => results.forEach(r => r.refetch()),
    };
}

/**
 * Hook para refrescar todo el dashboard manualmente
 */
export function useRefreshDashboard() {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    };
}
