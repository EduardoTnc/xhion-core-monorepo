import { create } from 'zustand';
import { systemSettingsService, type SystemSettings } from '../services/systemSettingsService';
import { toast } from 'sonner';

interface SystemSettingsState {
    settings: SystemSettings | null;
    isLoading: boolean;
    error: string | null;
    fetchSettings: () => Promise<void>;
    updateSettings: (data: Partial<SystemSettings>) => Promise<void>;
}

export const useSystemSettingsStore = create<SystemSettingsState>((set, get) => ({
    settings: null,
    isLoading: false,
    error: null,

    fetchSettings: async () => {
        set({ isLoading: true, error: null });
        try {
            const settings = await systemSettingsService.getSettings();
            set({ settings, isLoading: false });

            // Aplicar configuraciones globales (título, favicon, colores)
            if (settings) {
                // Título
                document.title = `${settings.nombreEmpresa} | Plataforma de Gestión`;

                // Favicon - construir URL completa si es relativa
                if (settings.faviconUrl) {
                    const faviconFullUrl = settings.faviconUrl.startsWith('http')
                        ? settings.faviconUrl
                        : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${settings.faviconUrl}`;
                    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
                    link.type = 'image/x-icon';
                    link.rel = 'shortcut icon';
                    link.href = faviconFullUrl;
                    document.getElementsByTagName('head')[0].appendChild(link);
                }

                // Colores CSS Variables
                const root = document.documentElement;
                if (settings.colorPrimario) {
                    root.style.setProperty('--primary', settings.colorPrimario);
                    // Calcular variantes si es necesario, o dejar que CSS lo maneje si usa HSL
                }
                if (settings.colorSecundario) {
                    root.style.setProperty('--secondary', settings.colorSecundario);
                }
            }

        } catch (error) {
            console.error('Error fetching system settings:', error);
            set({ error: 'Error al cargar la configuración del sistema', isLoading: false });
        }
    },

    updateSettings: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const updatedSettings = await systemSettingsService.updateSettings(data);
            set({ settings: updatedSettings, isLoading: false });

            // Re-aplicar configuraciones globales para ver cambios en tiempo real
            get().fetchSettings();

            toast.success('Configuración del sistema actualizada correctamente');
        } catch (error) {
            console.error('Error updating system settings:', error);
            set({ error: 'Error al actualizar la configuración', isLoading: false });
            toast.error('No se pudo actualizar la configuración');
            throw error;
        }
    },
}));
