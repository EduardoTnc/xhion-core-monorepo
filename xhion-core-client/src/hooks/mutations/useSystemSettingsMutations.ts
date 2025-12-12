import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { systemSettingsService, type UpdateSystemSettingsDto } from '@/services/systemSettingsService';
import { toast } from 'sonner';

/**
 * Mutation para actualizar configuración del sistema
 */
export function useUpdateSystemSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateSystemSettingsDto) => systemSettingsService.updateSettings(data),
        onSuccess: () => {
            toast.success('Configuración actualizada');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al actualizar configuración');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.systemSettings.all });
        },
    });
}

/**
 * Mutation para subir archivo
 */
export function useUploadFile() {
    return useMutation({
        mutationFn: ({ file, type }: { file: File; type?: 'company' | 'avatar' | 'task' | 'project' | 'document' }) =>
            systemSettingsService.uploadFile(file, type),
        onSuccess: () => {
            toast.success('Archivo subido exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al subir archivo');
        },
    });
}
