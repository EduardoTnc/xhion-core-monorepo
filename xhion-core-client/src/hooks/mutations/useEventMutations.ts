import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
    eventosService,
    type CreateEventoDto,
    type UpdateEventoDto,
} from '@/services/eventosService';
import { toast } from 'sonner';

/**
 * Mutation para crear un evento
 */
export function useCreateEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateEventoDto) => {
            const response = await eventosService.createEvento(data);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Evento creado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al crear el evento');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
        },
    });
}

/**
 * Mutation para actualizar un evento
 */
export function useUpdateEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateEventoDto }) => {
            const response = await eventosService.updateEvento(id, data);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Evento actualizado');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al actualizar el evento');
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
        },
    });
}

/**
 * Mutation para eliminar un evento
 */
export function useDeleteEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await eventosService.deleteEvento(id);
        },
        onSuccess: () => {
            toast.success('Evento eliminado');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al eliminar el evento');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
        },
    });
}

/**
 * Mutation para mover un evento (drag & drop en calendario)
 */
export function useMoveEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ eventId, fechaInicio, fechaFin }: { eventId: string; fechaInicio: string; fechaFin: string }) => {
            const response = await eventosService.moverEvento(eventId, fechaInicio, fechaFin);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Evento movido');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al mover el evento');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
        },
    });
}

/**
 * Mutation para agregar participante a un evento
 */
export function useAddEventParticipant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ eventId, userId }: { eventId: string; userId: string }) => {
            await eventosService.addParticipante(eventId, userId);
        },
        onSuccess: () => {
            toast.success('Participante agregado');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al agregar participante');
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(variables.eventId) });
        },
    });
}

/**
 * Mutation para remover participante de un evento
 */
export function useRemoveEventParticipant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ eventId, userId }: { eventId: string; userId: string }) => {
            await eventosService.removeParticipante(eventId, userId);
        },
        onSuccess: () => {
            toast.success('Participante removido');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al remover participante');
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(variables.eventId) });
        },
    });
}

/**
 * Mutation para confirmar asistencia a un evento
 */
export function useConfirmEventAttendance() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (eventId: string) => {
            await eventosService.confirmarAsistencia(eventId);
        },
        onSuccess: () => {
            toast.success('Asistencia confirmada');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al confirmar asistencia');
        },
        onSettled: (_, __, eventId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) });
        },
    });
}
