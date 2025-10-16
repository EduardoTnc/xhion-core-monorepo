import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { toast } from 'sonner';
import type { Invitacion } from '../types';

// Schema de validación con Zod
const registroSchema = z.object({
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string().min(1, "Confirma tu contraseña"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

type RegistroFormData = z.infer<typeof registroSchema>

export default function AcceptInvitationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login: loginStore } = useAuthStore();
  
  const [invitacion, setInvitacion] = useState<Invitacion | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegistroFormData>({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

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

  const onSubmit = async (data: RegistroFormData) => {
    if (!token) {
      setError('root', {
        type: 'manual',
        message: 'Token de invitación no válido',
      });
      return;
    }

    try {
      const { accessToken, refreshToken, user } = await authService.completarRegistro({
        token,
        password: data.password,
      });
      
      // Guardar en el store de Zustand
      loginStore(accessToken, refreshToken, user);
      
      // Mostrar mensaje de éxito
      toast.success(`¡Bienvenido, ${user.nombreCompleto}! Tu cuenta ha sido creada exitosamente.`);
      
      // Redirigir al dashboard
      navigate('/', { replace: true });
    } catch (err: any) {
      const errorMessage = err.message || 'Error al completar el registro';
      
      setError('root', {
        type: 'manual',
        message: errorMessage,
      });

      toast.error(errorMessage);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">
          Validando invitación...
        </p>
      </div>
    );
  }

  if (validationError || !invitacion) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <svg
                className="mx-auto h-16 w-16 text-destructive"
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
              <h2 className="mt-4 text-xl font-semibold">
                Invitación Inválida
              </h2>
              <p className="mt-2 text-muted-foreground">
                {validationError || 'El enlace de invitación no es válido o ha expirado.'}
              </p>
              <Link
                to="/login"
                className="mt-6 inline-block text-primary hover:underline"
              >
                Ir a la página de inicio de sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              ¡Bienvenido a XHION Core!
            </h1>
            <p className="text-muted-foreground mt-2">
              Hola, <span className="font-semibold">{invitacion.nombre_completo}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Completa tu registro creando una contraseña
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {errors.root && (
              <div className="flex items-center gap-2 bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg" role="alert">
                <AlertCircle className="h-4 w-4" />
                <span className="block sm:inline">{errors.root.message}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Crear Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                {...register("password")}
                disabled={isSubmitting}
              />
              {errors.password ? (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Debe tener al menos 8 caracteres</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repite tu contraseña"
                {...register("confirmPassword")}
                disabled={isSubmitting}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completando registro...
                </>
              ) : (
                'Completar Registro'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}