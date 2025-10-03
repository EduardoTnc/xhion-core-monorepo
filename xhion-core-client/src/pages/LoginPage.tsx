import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, Spinner } from '@heroui/react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { useThemeStore } from '../store/themeStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser, setToken, status } = useAuthStore();
  const { theme } = useThemeStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Efecto para navegar cuando el estado cambie a autenticado
  useEffect(() => {
    if (status === 'authenticated') {
      navigate('/');
    }
  }, [status, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { accessToken, refreshToken, user } = await authService.login({ email, password });

      setToken(accessToken);
      setUser(user);

      // Guardar refresh token en localStorage (aunque el store ya lo maneja con persist)
      localStorage.setItem('refreshToken', refreshToken);

      // La navegación ahora se maneja automáticamente por el useEffect arriba
      // cuando el estado cambie a 'authenticated'
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            XHION Core
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Bienvenido de vuelta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <Input
            type="email"
            label="Email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isRequired
            isDisabled={isLoading}
            variant="bordered"
          />

          <Input
            type="password"
            label="Contraseña"
            placeholder="•••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isRequired
            isDisabled={isLoading}
            variant="bordered"
          />

          <Button
            type="submit"
            color="primary"
            className="w-full"
            isDisabled={isLoading || !email || !password}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" color="white" />
                Ingresando...
              </span>
            ) : (
              'Ingresar'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          ¿Primera vez? Revisa tu correo para obtener tu invitación.
        </div>
      </Card>
    </div>
  );
}