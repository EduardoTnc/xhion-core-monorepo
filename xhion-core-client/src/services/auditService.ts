import apiClient from '../api/axios';

export interface AuditLog {
    id: string;
    timestamp: string;
    accion: string;
    usuarioId?: string;
    usuario?: {
        id: string;
        nombreCompleto: string;
        email: string;
    };
    direccionIp?: string;
    detalles?: any;
}

export interface AuditFilters {
    page?: number;
    limit?: number;
    usuarioId?: string;
    accion?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    search?: string;
}

export interface AuditResponse {
    data: AuditLog[];
    total: number;
}

export const auditService = {
    getAll: async (filters?: AuditFilters): Promise<AuditResponse> => {
        const params = new URLSearchParams();
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.usuarioId && filters.usuarioId !== 'all') params.append('usuarioId', filters.usuarioId);
        if (filters?.accion && filters.accion !== 'all') params.append('accion', filters.accion);
        if (filters?.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
        if (filters?.fechaHasta) params.append('fechaHasta', filters.fechaHasta);
        if (filters?.search) params.append('search', filters.search);

        const response = await apiClient.get(`/auditoria?${params.toString()}`);
        return response.data;
    },

    exportCsv: async (filters?: AuditFilters) => {
        const params = new URLSearchParams();
        if (filters?.usuarioId && filters.usuarioId !== 'all') params.append('usuarioId', filters.usuarioId);
        if (filters?.accion && filters.accion !== 'all') params.append('accion', filters.accion);
        if (filters?.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
        if (filters?.fechaHasta) params.append('fechaHasta', filters.fechaHasta);

        const response = await apiClient.get(`/auditoria/export?${params.toString()}`, {
            responseType: 'blob',
        });

        // Trigger download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'auditoria.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    getStats: async (): Promise<AuditStatsData> => {
        const response = await apiClient.get('/auditoria/stats');
        return response.data;
    },

    getActiveUsers: async (): Promise<ActiveUser[]> => {
        const response = await apiClient.get('/auditoria/active-users');
        return response.data;
    }
};

export interface AuditStatsData {
    totalEventsToday: number;
    trend: number;
    criticalEventsToday: number;
    activeUsersToday: number;
    integrity: number;
}

export interface ActiveUser {
    id: string;
    nombreCompleto: string;
    email: string;
    rol: string;
    avatar?: string;
    ultimoAcceso?: string;
    ultimoEvento: string;
}
