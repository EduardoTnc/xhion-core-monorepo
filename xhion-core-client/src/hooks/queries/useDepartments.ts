import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
    departmentService,
    type Departamento,
    type DepartamentoDetalle,
    type EstadisticasDepartamento,
} from '@/services/departmentService';

/**
 * Hook para obtener todos los departamentos
 */
export function useDepartments(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.departments.list(),
        queryFn: () => departmentService.getAll(),
        staleTime: 1000 * 60 * 10, // 10 minutos - departamentos cambian poco
        ...options,
    });
}

/**
 * Hook para obtener un departamento por ID
 */
export function useDepartment(departmentId: string | null | undefined, options?: { enabled?: boolean }) {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: queryKeys.departments.detail(departmentId!),
        queryFn: () => departmentService.getById(departmentId!),
        enabled: !!departmentId && (options?.enabled !== false),
        // ⚡ UX instantánea
        placeholderData: () => {
            const departments = queryClient.getQueryData<Departamento[]>(queryKeys.departments.list());
            return departments?.find(d => d.id === departmentId) as DepartamentoDetalle | undefined;
        },
        ...options,
    });
}

/**
 * Hook para obtener estadísticas de un departamento
 */
export function useDepartmentStats(departmentId: string | null | undefined, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: [...queryKeys.departments.detail(departmentId!), 'stats'] as const,
        queryFn: () => departmentService.getEstadisticas(departmentId!),
        enabled: !!departmentId && (options?.enabled !== false),
        ...options,
    });
}

/**
 * Hook para prefetch de departamento
 */
export function usePrefetchDepartment() {
    const queryClient = useQueryClient();

    return (departmentId: string) => {
        queryClient.prefetchQuery({
            queryKey: queryKeys.departments.detail(departmentId),
            queryFn: () => departmentService.getById(departmentId),
        });
    };
}
