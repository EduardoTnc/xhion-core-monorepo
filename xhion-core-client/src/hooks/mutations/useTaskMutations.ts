import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
    taskService,
    type CreateTareaDto,
    type UpdateTareaDto,
    type MoveTareaDto,
    type CreateComentarioDto,
} from '@/services/taskService';
import { toast } from 'sonner';

// ==================== TASK MUTATIONS ====================

/**
 * Mutation para crear una tarea
 */
export function useCreateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTareaDto) => taskService.create(data),
        onSuccess: (newTask) => {
            toast.success('Tarea creada exitosamente');
            queryClient.setQueryData(queryKeys.tasks.detail(newTask.id), newTask);
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al crear la tarea');
        },
        onSettled: (data) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myTasks() });
            if (data?.proyectoId) {
                queryClient.invalidateQueries({ queryKey: queryKeys.projects.stages(data.proyectoId) });
            }
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.todayTasks() });
        },
    });
}

/**
 * Mutation para actualizar una tarea (con Optimistic Update)
 */
export function useUpdateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTareaDto }) =>
            taskService.update(id, data),

        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.tasks.detail(id) });
            const previousTask = queryClient.getQueryData(queryKeys.tasks.detail(id));

            queryClient.setQueryData(queryKeys.tasks.detail(id), (old: any) => ({
                ...old,
                ...data,
            }));

            return { previousTask };
        },

        onError: (err, variables, context) => {
            if (context?.previousTask) {
                queryClient.setQueryData(
                    queryKeys.tasks.detail(variables.id),
                    context.previousTask
                );
            }
            toast.error('Error al actualizar la tarea');
        },

        onSuccess: () => {
            toast.success('Tarea actualizada');
        },

        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myTasks() });
        },
    });
}

/**
 * Mutation para mover una tarea entre etapas/estados
 */
export function useMoveTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: MoveTareaDto }) =>
            taskService.move(id, data),

        onSuccess: () => {
            toast.success('Tarea movida');
        },

        onError: (error: any) => {
            toast.error(error.message || 'Error al mover la tarea');
        },

        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.all }); // Actualizar etapas
        },
    });
}

/**
 * Mutation para eliminar una tarea
 */
export function useDeleteTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => taskService.delete(id),
        onSuccess: () => {
            toast.success('Tarea eliminada');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al eliminar la tarea');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myTasks() });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.todayTasks() });
        },
    });
}

// ==================== COMMENT MUTATIONS ====================

/**
 * Mutation para agregar un comentario
 */
export function useAddTaskComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId, data }: { taskId: string; data: CreateComentarioDto }) =>
            taskService.addComentario(taskId, data),
        onSuccess: () => {
            toast.success('Comentario agregado');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al agregar comentario');
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.comments(variables.taskId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.activity(variables.taskId) });
        },
    });
}

/**
 * Mutation para eliminar un comentario
 */
export function useDeleteTaskComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId, comentarioId }: { taskId: string; comentarioId: string }) =>
            taskService.deleteComentario(taskId, comentarioId),
        onSuccess: () => {
            toast.success('Comentario eliminado');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al eliminar comentario');
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.comments(variables.taskId) });
        },
    });
}

// ==================== ATTACHMENT MUTATIONS ====================

/**
 * Mutation para subir un adjunto
 */
export function useUploadTaskAttachment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId, file, descripcion }: { taskId: string; file: File; descripcion?: string }) =>
            taskService.uploadAdjunto(taskId, { file, descripcion }),
        onSuccess: () => {
            toast.success('Archivo subido');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al subir archivo');
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.attachments(variables.taskId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.activity(variables.taskId) });
        },
    });
}

/**
 * Mutation para eliminar un adjunto
 */
export function useDeleteTaskAttachment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId, archivoId }: { taskId: string; archivoId: string }) =>
            taskService.deleteAdjunto(taskId, archivoId),
        onSuccess: () => {
            toast.success('Archivo eliminado');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al eliminar archivo');
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.attachments(variables.taskId) });
        },
    });
}
