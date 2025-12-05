import apiClient from "../api/axios"

export interface SystemSettings {
    id: string;
    nombreEmpresa: string;
    logoUrl?: string;
    faviconUrl?: string;
    colorPrimario: string;
    colorSecundario: string;
    // Contexto para Magnus IA
    ubicacion?: string;
    descripcionEmpresa?: string;
    updatedAt: string;
}

export interface UpdateSystemSettingsDto {
    nombreEmpresa?: string;
    logoUrl?: string;
    faviconUrl?: string;
    colorPrimario?: string;
    colorSecundario?: string;
    // Contexto para Magnus IA
    ubicacion?: string;
    descripcionEmpresa?: string;
}

export const systemSettingsService = {
    getSettings: async (): Promise<SystemSettings> => {
        const response = await apiClient.get('/system-settings');
        return response.data;
    },

    updateSettings: async (data: UpdateSystemSettingsDto): Promise<SystemSettings> => {
        const response = await apiClient.patch('/system-settings', data);
        return response.data;
    },

    uploadFile: async (file: File, type: 'company' | 'avatar' | 'task' | 'project' | 'document' = 'document'): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append('file', file);

        // Usar query parameter para el tipo (más fiable que FormData body con Multer)
        const response = await apiClient.post(`/files/upload?type=${type}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};
