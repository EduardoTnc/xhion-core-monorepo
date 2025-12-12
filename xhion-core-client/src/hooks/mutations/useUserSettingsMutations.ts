import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { settingsService, type UpdateProfileDto, type ChangePasswordDto } from '@/services/settingsService';
import { toast } from 'sonner';

/**
 * Hook para actualizar perfil del usuario
 */
export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateProfileDto) => settingsService.updateProfile(data),
        onSuccess: () => {
            toast.success('Perfil actualizado correctamente');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al actualizar perfil');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}

/**
 * Hook para cambiar contraseña
 */
export function useChangePassword() {
    return useMutation({
        mutationFn: (data: ChangePasswordDto) => settingsService.changePassword(data),
        onSuccess: () => {
            toast.success('Contraseña actualizada correctamente');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al cambiar contraseña');
        },
    });
}

/**
 * Hook para subir avatar
 */
export function useUploadAvatar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (file: File) => settingsService.uploadAvatar(file),
        onSuccess: () => {
            toast.success('Avatar actualizado correctamente');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al subir avatar');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}

/**
 * Hook para subir CV
 */
export function useUploadCv() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (file: File) => settingsService.uploadCv(file),
        onSuccess: () => {
            toast.success('CV actualizado correctamente');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al subir CV');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}

/**
 * Hook para terminar una sesión
 */
export function useTerminateSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (sessionId: string) => settingsService.terminateSession(sessionId),
        onSuccess: () => {
            toast.success('Sesión cerrada correctamente');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al cerrar sesión');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.sessions });
        },
    });
}

/**
 * Hook para actualizar perfil profesional
 */
export function useUpdateProfessionalProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => settingsService.updateProfessionalProfile(data),
        onSuccess: () => {
            toast.success('Perfil profesional actualizado');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al actualizar perfil profesional');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.professionalProfile });
        },
    });
}

/**
 * Hook para actualizar preferencias de notificaciones
 */
export function useUpdateNotificationSettings() {
    return useMutation({
        mutationFn: (settings: any) => settingsService.updateNotificationSettings(settings),
        onSuccess: () => {
            toast.success('Preferencias actualizadas');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al actualizar preferencias');
        },
    });
}

/**
 * Hook para descargar datos del usuario
 */
export function useDownloadUserData() {
    return useMutation({
        mutationFn: () => settingsService.downloadUserData(),
        onSuccess: (blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mis-datos-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('Datos descargados correctamente');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al descargar datos');
        },
    });
}

/**
 * Hook para eliminar cuenta
 */
export function useDeleteAccount() {
    return useMutation({
        mutationFn: (password: string) => settingsService.deleteAccount(password),
        onSuccess: () => {
            toast.success('Cuenta eliminada correctamente');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al eliminar cuenta');
        },
    });
}

/**
 * Hook para agregar contacto
 */
export function useAddContact() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { tipo: string; valor: string; esPrivado?: boolean }) =>
            settingsService.addContacto(data as any),
        onSuccess: () => {
            toast.success('Contacto agregado');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al agregar contacto');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.contacts });
        },
    });
}

/**
 * Hook para eliminar contacto
 */
export function useDeleteContact() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => settingsService.deleteContacto(id),
        onSuccess: () => {
            toast.success('Contacto eliminado');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al eliminar contacto');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.contacts });
        },
    });
}

/**
 * Hook para agregar enlace profesional
 */
export function useAddProfessionalLink() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { tipo: string; url: string }) =>
            settingsService.addEnlaceProfesional(data as any),
        onSuccess: () => {
            toast.success('Enlace agregado');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al agregar enlace');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.professionalLinks });
        },
    });
}

/**
 * Hook para eliminar enlace profesional
 */
export function useDeleteProfessionalLink() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => settingsService.deleteEnlaceProfesional(id),
        onSuccess: () => {
            toast.success('Enlace eliminado');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al eliminar enlace');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.professionalLinks });
        },
    });
}
