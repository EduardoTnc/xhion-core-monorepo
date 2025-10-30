import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePickerBirth } from '@/components/ui/date-picker-birth';
import { Loader2, AlertCircle, ArrowRight, ArrowLeft, Check, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { toast } from 'sonner';
import { AvatarUpload } from '../components/users/AvatarUpload';
import type { Invitacion } from '../types';

// Schema de validación con Zod - Multipaso
const registroSchema = z.object({
  // Paso 1: Contraseña
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  // Paso 2: Perfil (opcionales)
  avatarUrl: z.string().optional(),
  telefono: z.string().optional(),
  fechaNacimiento: z.string().optional(),
  biografia: z.string().optional(),
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
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setError,
    watch,
    setValue,
    trigger,
  } = useForm<RegistroFormData>({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      avatarUrl: '',
      telefono: '',
      fechaNacimiento: '',
      biografia: '',
    },
  })

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

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

  // Avanzar al paso 2
  const handleNextStep = async () => {
    const isValid = await trigger(['password', 'confirmPassword']);
    if (isValid) {
      setCurrentStep(2);
    }
  };

  // Volver al paso 1
  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  // Submit final
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
        avatarUrl: data.avatarUrl,
        telefono: data.telefono,
        fechaNacimiento: data.fechaNacimiento,
        biografia: data.biografia,
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
    <div className="min-h-screen flex items-center justify-center px-4 bg-background py-8">
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              ¡Bienvenido a XHION Core!
            </h1>
            <p className="text-muted-foreground mt-2">
              Hola, <span className="font-semibold">{invitacion.nombre_completo}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {currentStep === 1 ? 'Paso 1: Crea tu contraseña' : 'Paso 2: Completa tu perfil'}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {currentStep > 1 ? <Check className="h-4 w-4" /> : '1'}
            </div>
            <div className={`h-1 w-16 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              2
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {errors.root && (
              <div className="flex items-center gap-2 bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg" role="alert">
                <AlertCircle className="h-4 w-4" />
                <span className="block sm:inline">{errors.root.message}</span>
              </div>
            )}

            {/* Paso 1: Contraseña */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Crear Contraseña *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      {...register("password")}
                      disabled={isSubmitting}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.password ? (
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Debe tener al menos 8 caracteres</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repite tu contraseña"
                      {...register("confirmPassword")}
                      disabled={isSubmitting}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  type="button"
                  className="w-full"
                  onClick={handleNextStep}
                  disabled={!password || !confirmPassword}
                >
                  Continuar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Paso 2: Perfil */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <AvatarUpload
                  value={watch('avatarUrl')}
                  onChange={(url) => setValue('avatarUrl', url)}
                  disabled={isSubmitting}
                />

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    {...register("telefono")}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                  <Controller
                    name="fechaNacimiento"
                    control={control}
                    render={({ field }) => (
                      <DatePickerBirth
                        date={field.value ? new Date(field.value) : undefined}
                        onDateChange={(date) => {
                          field.onChange(date ? date.toISOString().split('T')[0] : '')
                        }}
                        placeholder="Selecciona tu fecha de nacimiento"
                        disabled={isSubmitting}
                        maxDate={new Date()} // No permitir fechas futuras
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="biografia">Biografía</Label>
                  <Textarea
                    id="biografia"
                    placeholder="Cuéntanos un poco sobre ti..."
                    rows={4}
                    {...register("biografia")}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handlePrevStep}
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Atrás
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Activando cuenta...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Activar Cuenta
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}