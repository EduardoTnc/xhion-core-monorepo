import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, Input, Button, Spinner } from '@heroui/react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { useThemeStore } from '../store/themeStore';
import type { Invitacion } from '../types';

export default function AcceptInvitationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setToken } = useAuthStore();
  const { theme } = useThemeStore();
  
  const [invitacion, setInvitacion] = useState<Invitacion | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isValidating, setIsValidating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setValidationError('Token de invitación no proporcionado');
      setIsValidating(false);
      return;
    }

    const validarToken = async () => {
      try {
        const data = await authService.validarTokenInvitacion(token);
        setInvitacion(data);
      } catch (err: any) {
        setValidationError(err.message);
      } finally {
        setIsValidating(false);
      }
    };

    validarToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (!token) return;

    setIsSubmitting(true);

    try {
      const { accessToken, refreshToken, user } = await authService.completarRegistro({
        token,
        password,
      });
      
      setToken(accessToken);
      setUser(user);
      
      localStorage.setItem('refreshToken', refreshToken);
      
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error al completar el registro');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center px-4 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
      }`}>
        <Spinner size="lg" color="primary" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Validando invitación...
        </p>
      </div>
    );
  }

  if (validationError || !invitacion) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
      }`}>
        <Card className="w-full max-w-md p-8 shadow-xl">
          <div className="text-center">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
              Invitación Inválida
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {validationError || 'El enlace de invitación no es válido o ha expirado.'}
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block text-blue-600 dark:text-blue-400 hover:underline"
            >
              Ir a la página de inicio de sesión
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            ¡Bienvenido a XHION Core!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Hola, <span className="font-semibold">{invitacion.nombre_completo}</span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Completa tu registro creando una contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <Input
            type="password"
            label="Crear Contraseña"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isRequired
            isDisabled={isSubmitting}
            variant="bordered"
            description="Debe tener al menos 8 caracteres"
          />

          <Input
            type="password"
            label="Confirmar Contraseña"
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            isRequired
            isDisabled={isSubmitting}
            variant="bordered"
          />

          <Button
            type="submit"
            color="primary"
            className="w-full"
            isDisabled={isSubmitting || !password || !confirmPassword}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" color="white" />
                Completando registro...
              </span>
            ) : (
              'Completar Registro'
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}