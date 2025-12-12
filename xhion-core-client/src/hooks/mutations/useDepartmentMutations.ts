import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
    departmentService,
    type CreateDepartamentoDto,
    type UpdateDepartamentoDto,
} from '@/services/departmentService';
import { toast } from 'sonner';

/**
 * Mutation para crear un departamento
 */
export function useCreateDepartment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateDepartamentoDto) => departmentService.create(data),
        onSuccess: () => {
            toast.success('Departamento creado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al crear el departamento');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
        },
    });
}

/**
 * Mutation para actualizar un departamento
 */
export function useUpdateDepartment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateDepartamentoDto }) =>
            departmentService.update(id, data),
        onSuccess: () => {
            toast.success('Departamento actualizado');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al actualizar el departamento');
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.departments.detail(variables.id) });
        },
    });
}

/**
 * Mutation para eliminar un departamento
 */
export function useDeleteDepartment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => departmentService.delete(id),
        onSuccess: () => {
            toast.success('Departamento eliminado');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al eliminar el departamento');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
        },
    });
}

/**
 * Mutation para restaurar un departamento
 */
export function useRestoreDepartment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => departmentService.restore(id),
        onSuccess: () => {
            toast.success('Departamento restaurado');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al restaurar el departamento');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
        },
    });
}
