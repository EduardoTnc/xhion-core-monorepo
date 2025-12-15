import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
    conocimientoService,
    type CreateContextoOrganizacionalDto,
    type UpdateContextoOrganizacionalDto,
    type CreateContextoDepartamentoDto,
    type UpdateContextoDepartamentoDto,
    type CreateDocumentoProyectoDto,
    type UpdateDocumentoProyectoDto,
    type CreateDocumentoDepartamentoDto,
    type UpdateDocumentoDepartamentoDto,
} from '@/services/conocimientoService';
import { toast } from 'sonner';

// ==================== CONTEXTO ORGANIZACIONAL ====================

/**
 * Mutation para crear/actualizar contexto organizacional
 */
export function useUpsertContextoOrganizacional() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateContextoOrganizacionalDto) =>
            conocimientoService.upsertContextoOrganizacional(data),
        onSuccess: () => {
            toast.success('Contexto organizacional guardado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al guardar contexto organizacional');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.knowledge.organizationalContext() });
        },
    });
}

// ==================== CONTEXTO DEPARTAMENTO ====================

/**
 * Mutation para crear contexto de departamento
 */
export function useCreateContextoDepartamento() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateContextoDepartamentoDto) =>
            conocimientoService.createContextoDepartamento(data),
        onSuccess: () => {
            toast.success('Contexto de departamento creado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al crear contexto de departamento');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.knowledge.departmentContexts() });
        },
    });
}

/**
 * Mutation para actualizar contexto de departamento
 */
export function useUpdateContextoDepartamento() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ departamentoId, data }: { departamentoId: string; data: UpdateContextoDepartamentoDto }) =>
            conocimientoService.updateContextoDepartamento(departamentoId, data),
        onSuccess: () => {
            toast.success('Contexto de departamento actualizado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al actualizar contexto de departamento');
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.knowledge.departmentContext(variables.departamentoId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.knowledge.departmentContexts() });
        },
    });
}

/**
 * Mutation para eliminar contexto de departamento
 */
export function useDeleteContextoDepartamento() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (departamentoId: string) =>
            conocimientoService.deleteContextoDepartamento(departamentoId),
        onSuccess: () => {
            toast.success('Contexto de departamento eliminado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al eliminar contexto de departamento');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.knowledge.departmentContexts() });
        },
    });
}

// ==================== DOCUMENTOS PROYECTO ====================

/**
 * Mutation para crear documento de proyecto
 */
export function useCreateDocumentoProyecto() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateDocumentoProyectoDto) =>
            conocimientoService.createDocumentoProyecto(data),
        onSuccess: (_, variables) => {
            toast.success('Documento creado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al crear documento');
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.knowledge.projectDocuments(variables.proyectoId) });
        },
    });
}

/**
 * Mutation para actualizar documento de proyecto
 */
export function useUpdateDocumentoProyecto() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data, proyectoId }: { id: string; data: UpdateDocumentoProyectoDto; proyectoId: string }) =>
            conocimientoService.updateDocumentoProyecto(id, data),
        onSuccess: () => {
            toast.success('Documento actualizado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al actualizar documento');
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.knowledge.projectDocuments(variables.proyectoId) });
        },
    });
}

/**
 * Mutation para eliminar documento de proyecto
 */
export function useDeleteDocumentoProyecto() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, proyectoId }: { id: string; proyectoId: string }) =>
            conocimientoService.deleteDocumentoProyecto(id),
        onSuccess: () => {
            toast.success('Documento eliminado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al eliminar documento');
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.knowledge.projectDocuments(variables.proyectoId) });
        },
    });
}

// ==================== DOCUMENTOS DEPARTAMENTO ====================

/**
 * Mutation para crear documento de departamento
 */
export function useCreateDocumentoDepartamento() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateDocumentoDepartamentoDto) =>
            conocimientoService.createDocumentoDepartamento(data),
        onSuccess: () => {
            toast.success('Documento creado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al crear documento');
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.knowledge.departmentDocuments(variables.departamentoId) });
        },
    });
}

/**
 * Mutation para actualizar documento de departamento
 */
export function useUpdateDocumentoDepartamento() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data, departamentoId }: { id: string; data: UpdateDocumentoDepartamentoDto; departamentoId: string }) =>
            conocimientoService.updateDocumentoDepartamento(id, data),
        onSuccess: () => {
            toast.success('Documento actualizado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al actualizar documento');
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.knowledge.departmentDocuments(variables.departamentoId) });
        },
    });
}

/**
 * Mutation para eliminar documento de departamento
 */
export function useDeleteDocumentoDepartamento() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, departamentoId }: { id: string; departamentoId: string }) =>
            conocimientoService.deleteDocumentoDepartamento(id),
        onSuccess: () => {
            toast.success('Documento eliminado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al eliminar documento');
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.knowledge.departmentDocuments(variables.departamentoId) });
        },
    });
}
