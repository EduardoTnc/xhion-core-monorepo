import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import puestosTrabajoService, {
    type PuestoTrabajo,
    type CreatePuestoTrabajoDto,
    type UpdatePuestoTrabajoDto,
} from '@/services/puestosTrabajoService';
import { toast } from 'sonner';

// ==================== QUERIES ====================

/**
 * Hook para obtener puestos de trabajo de un proyecto
 */
export function useProjectJobPositions(projectId: string | null | undefined, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: [...queryKeys.jobPositions.all, 'project', projectId] as const,
        queryFn: () => puestosTrabajoService.getPuestosByProyecto(projectId!),
        enabled: !!projectId && (options?.enabled !== false),
        ...options,
    });
}

/**
 * Hook para obtener puestos de trabajo de un departamento
 */
export function useDepartmentJobPositions(departmentId: string | null | undefined, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: [...queryKeys.jobPositions.all, 'department', departmentId] as const,
        queryFn: () => puestosTrabajoService.getPuestosByDepartamento(departmentId!),
        enabled: !!departmentId && (options?.enabled !== false),
        ...options,
    });
}

// ==================== MUTATIONS ====================

/**
 * Mutation para crear puesto de trabajo
 */
export function useCreateJobPosition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePuestoTrabajoDto) => puestosTrabajoService.createPuesto(data),
        onSuccess: () => {
            toast.success('Puesto creado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al crear puesto');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.jobPositions.all });
        },
    });
}

/**
 * Mutation para actualizar puesto de trabajo
 */
export function useUpdateJobPosition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePuestoTrabajoDto }) =>
            puestosTrabajoService.updatePuesto(id, data),
        onSuccess: () => {
            toast.success('Puesto actualizado');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al actualizar puesto');
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.jobPositions.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.jobPositions.detail(variables.id) });
        },
    });
}

/**
 * Mutation para eliminar puesto de trabajo
 */
export function useDeleteJobPosition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => puestosTrabajoService.deletePuesto(id),
        onSuccess: () => {
            toast.success('Puesto eliminado');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al eliminar puesto');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.jobPositions.all });
        },
    });
}

/**
 * Mutation para asignar empleado a puesto
 */
export function useAssignEmployeeToPosition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ positionId, employeeId }: { positionId: string; employeeId: string }) =>
            puestosTrabajoService.asignarEmpleado(positionId, employeeId),
        onSuccess: () => {
            toast.success('Empleado asignado');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al asignar empleado');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.jobPositions.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}

/**
 * Mutation para desasignar empleado de puesto
 */
export function useUnassignEmployeeFromPosition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ positionId, employeeId }: { positionId: string; employeeId: string }) =>
            puestosTrabajoService.desasignarEmpleado(positionId, employeeId),
        onSuccess: () => {
            toast.success('Empleado desasignado');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al desasignar empleado');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.jobPositions.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}
