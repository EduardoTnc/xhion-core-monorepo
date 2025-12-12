import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { ideasService, type CrearIdeaDto, type ActualizarIdeaDto } from '@/services/ideasService';
import { toast } from 'sonner';

/**
 * Mutation para crear una idea
 */
export function useCreateIdea() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CrearIdeaDto) => ideasService.crear(data),
        onSuccess: () => {
            toast.success('Idea creada exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al crear la idea');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
        },
    });
}

/**
 * Mutation para actualizar una idea
 */
export function useUpdateIdea() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: ActualizarIdeaDto }) =>
            ideasService.actualizar(id, data),
        onSuccess: () => {
            toast.success('Idea actualizada');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al actualizar la idea');
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.ideas.detail(variables.id) });
        },
    });
}

/**
 * Mutation para eliminar una idea
 */
export function useDeleteIdea() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => ideasService.eliminar(id),
        onSuccess: () => {
            toast.success('Idea eliminada');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al eliminar la idea');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
        },
    });
}

/**
 * Mutation para votar una idea
 */
export function useVoteIdea() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => ideasService.votar(id),
        onSuccess: (result) => {
            toast.success(result.voted ? 'Voto registrado' : 'Voto removido');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al votar');
        },
        onSettled: (_, __, id) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.ideas.detail(id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
        },
    });
}

/**
 * Mutation para agregar comentario a una idea
 */
export function useAddIdeaComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ ideaId, contenido }: { ideaId: string; contenido: string }) =>
            ideasService.crearComentario(ideaId, contenido),
        onSuccess: () => {
            toast.success('Comentario agregado');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al agregar comentario');
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: [...queryKeys.ideas.detail(variables.ideaId), 'comments'] });
            queryClient.invalidateQueries({ queryKey: queryKeys.ideas.detail(variables.ideaId) });
        },
    });
}

/**
 * Mutation para eliminar comentario de una idea
 */
export function useDeleteIdeaComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (comentarioId: string) => ideasService.eliminarComentario(comentarioId),
        onSuccess: () => {
            toast.success('Comentario eliminado');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al eliminar comentario');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
        },
    });
}
