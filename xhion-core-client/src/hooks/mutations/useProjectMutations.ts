import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
    projectService,
    type CreateProyectoDto,
    type UpdateProyectoDto,
    type AddMiembroDto,
    type CreateEtapaDto,
    type UpdateEtapaDto,
    type ReorderEtapasDto,
} from '@/services/projectService';
import { toast } from 'sonner';

// ==================== PROYECTO MUTATIONS ====================

/**
 * Mutation para crear un proyecto
 */
export function useCreateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProyectoDto) => projectService.create(data),
        onSuccess: (newProject) => {
            toast.success('Proyecto creado exitosamente');
            // Agregar a la cache directamente
            queryClient.setQueryData(
                queryKeys.projects.detail(newProject.id),
                newProject
            );
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al crear el proyecto');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
            // También invalidar dashboard ya que puede mostrar proyectos
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.activeProjects() });
        },
    });
}

/**
 * Mutation para actualizar un proyecto (con Optimistic Update)
 */
export function useUpdateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateProyectoDto }) =>
            projectService.update(id, data),

        // PASO 1: Actualización optimista ANTES de la request
        onMutate: async ({ id, data }) => {
            // Cancelar queries en vuelo para evitar race conditions
            await queryClient.cancelQueries({ queryKey: queryKeys.projects.detail(id) });

            // Guardar estado anterior para rollback
            const previousProject = queryClient.getQueryData(queryKeys.projects.detail(id));

            // Actualizar cache optimistamente
            queryClient.setQueryData(queryKeys.projects.detail(id), (old: any) => ({
                ...old,
                ...data,
            }));

            // Retornar contexto para rollback
            return { previousProject };
        },

        // PASO 2: Rollback si hay error
        onError: (err, variables, context) => {
            if (context?.previousProject) {
                queryClient.setQueryData(
                    queryKeys.projects.detail(variables.id),
                    context.previousProject
                );
            }
            toast.error('Error al actualizar el proyecto');
        },

        // PASO 3: Notificar éxito
        onSuccess: () => {
            toast.success('Proyecto actualizado');
        },

        // PASO 4: ⚠️ CRÍTICO - Siempre refetch al final
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
        },
    });
}

/**
 * Mutation para eliminar un proyecto
 */
export function useDeleteProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => projectService.delete(id),
        onSuccess: () => {
            toast.success('Proyecto eliminado');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al eliminar el proyecto');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.activeProjects() });
        },
    });
}

/**
 * Mutation para duplicar un proyecto
 */
export function useDuplicateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => projectService.duplicate(id),
        onSuccess: () => {
            toast.success('Proyecto duplicado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al duplicar el proyecto');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.activeProjects() });
        },
    });
}

// ==================== MIEMBROS MUTATIONS ====================

/**
 * Mutation para agregar un miembro al proyecto
 */
export function useAddProjectMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId, data }: { projectId: string; data: AddMiembroDto }) =>
            projectService.addMiembro(projectId, data),
        onSuccess: () => {
            toast.success('Miembro agregado al proyecto');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al agregar miembro');
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.members(variables.projectId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(variables.projectId) });
        },
    });
}

/**
 * Mutation para remover un miembro del proyecto
 */
export function useRemoveProjectMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
            projectService.removeMiembro(projectId, userId),
        onSuccess: () => {
            toast.success('Miembro removido del proyecto');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al remover miembro');
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.members(variables.projectId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(variables.projectId) });
        },
    });
}

// ==================== ETAPAS MUTATIONS ====================

/**
 * Mutation para crear una etapa
 */
export function useCreateProjectStage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId, data }: { projectId: string; data: CreateEtapaDto }) =>
            projectService.createEtapa(projectId, data),
        onSuccess: () => {
            toast.success('Etapa creada exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al crear la etapa');
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.stages(variables.projectId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(variables.projectId) });
        },
    });
}

/**
 * Mutation para actualizar una etapa
 */
export function useUpdateProjectStage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId, stageId, data }: { projectId: string; stageId: string; data: UpdateEtapaDto }) =>
            projectService.updateEtapa(projectId, stageId, data),
        onSuccess: () => {
            toast.success('Etapa actualizada');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al actualizar la etapa');
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.stages(variables.projectId) });
        },
    });
}

/**
 * Mutation para eliminar una etapa
 */
export function useDeleteProjectStage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId, stageId }: { projectId: string; stageId: string }) =>
            projectService.deleteEtapa(projectId, stageId),
        onSuccess: () => {
            toast.success('Etapa eliminada');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al eliminar la etapa');
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.stages(variables.projectId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(variables.projectId) });
        },
    });
}

/**
 * Mutation para reordenar etapas
 */
export function useReorderProjectStages() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId, data }: { projectId: string; data: ReorderEtapasDto }) =>
            projectService.reorderEtapas(projectId, data),
        onSuccess: () => {
            toast.success('Etapas reordenadas');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al reordenar etapas');
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.stages(variables.projectId) });
        },
    });
}
