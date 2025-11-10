import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/v1`,
});

// Interceptor para añadir el token a cada petición
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Variable para controlar si estamos haciendo refresh actualmente
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (error: any) => void;
}> = [];

// Función para procesar la cola de peticiones fallidas
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Interceptor para manejar respuestas 401 y hacer refresh automático
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // No intentar refresh si es una petición de logout o refresh
    const isLogoutRequest = originalRequest.url?.includes('/auth/logout');
    const isRefreshRequest = originalRequest.url?.includes('/auth/refresh');

    // Si el error no es 401, o si ya intentamos hacer refresh, o si es logout/refresh, rechazar
    if (error.response?.status !== 401 || originalRequest._retry || isLogoutRequest || isRefreshRequest) {
      return Promise.reject(error);
    }

    // Si estamos haciendo refresh actualmente, añadir esta petición a la cola
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      }).catch((err) => {
        return Promise.reject(err);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Intentar refrescar el token
      const { accessToken } = await authService.refreshToken();

      // Actualizar el token en el estado global
      useAuthStore.getState().setAccessToken(accessToken);

      // Actualizar la cabecera de la petición original
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      // Procesar la cola de peticiones que estaban esperando
      processQueue(null, accessToken);

      // Reintentar la petición original
      return apiClient(originalRequest);
    } catch (refreshError) {
      // El refresh falló, limpiar la sesión del usuario
      useAuthStore.getState().logout();

      // Procesar la cola con el error
      processQueue(refreshError, null);

      // Rechazar la promesa con el error original
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;