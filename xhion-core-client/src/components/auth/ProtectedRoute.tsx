import { Navigate, Outlet } from 'react-router-dom';
import { Spinner } from '@heroui/react';
import { useAuthStore } from '../../store/authStore';

export const ProtectedRoute = () => {
  const { status } = useAuthStore();

  // Mostrar spinner mientras se carga el estado desde localStorage
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  // Si está autenticado, renderizar las rutas protegidas
  if (status === 'authenticated') {
    return <Outlet />;
  }

  // Si no está autenticado, redirigir a login
  return <Navigate to="/login" replace />;
};

