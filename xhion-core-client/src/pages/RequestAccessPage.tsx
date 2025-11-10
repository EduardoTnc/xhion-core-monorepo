import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { UserPlus, Mail, User, Building2, Briefcase, Phone, MessageSquare, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { solicitudesService } from '../services/solicitudesService';
import type { CreateSolicitudDto } from '../services/solicitudesService';

export default function RequestAccessPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSolicitudDto>();

  const onSubmit = async (data: CreateSolicitudDto) => {
    try {
      setIsSubmitting(true);
      await solicitudesService.createSolicitud(data);
      setIsSuccess(true);
      toast.success('¡Solicitud enviada exitosamente!', {
        description: 'Recibirás una respuesta por email en las próximas 24-48 horas.',
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al enviar la solicitud';
      toast.error('Error', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">¡Solicitud Enviada!</CardTitle>
            <CardDescription className="text-base">
              Hemos recibido tu solicitud de acceso exitosamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>¿Qué sigue?</strong>
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Nuestro equipo revisará tu solicitud</li>
                <li>Recibirás una respuesta por email en 24-48 horas</li>
                <li>Si es aprobada, te enviaremos un enlace de invitación</li>
              </ul>
            </div>
            <Button onClick={handleBackToLogin} className="w-full" size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio de sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Formulario */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Solicitar Acceso</h1>
            <p className="text-muted-foreground">
              Completa el formulario para solicitar acceso a Xhion Core
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nombre Completo */}
            <div className="space-y-2">
              <Label htmlFor="nombreCompleto">
                Nombre Completo <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nombreCompleto"
                  placeholder="Juan Pérez García"
                  className="pl-10"
                  {...register('nombreCompleto', {
                    required: 'El nombre completo es requerido',
                    minLength: {
                      value: 3,
                      message: 'El nombre debe tener al menos 3 caracteres',
                    },
                  })}
                />
              </div>
              {errors.nombreCompleto && (
                <p className="text-sm text-destructive">{errors.nombreCompleto.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="juan.perez@empresa.com"
                  className="pl-10"
                  {...register('email', {
                    required: 'El email es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="telefono"
                  placeholder="+51 987 654 321"
                  className="pl-10"
                  {...register('telefono')}
                />
              </div>
            </div>

            {/* Empresa */}
            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="empresa"
                  placeholder="Empresa SAC"
                  className="pl-10"
                  {...register('empresa')}
                />
              </div>
            </div>

            {/* Cargo */}
            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cargo"
                  placeholder="Desarrollador Full Stack"
                  className="pl-10"
                  {...register('cargo')}
                />
              </div>
            </div>

            {/* Mensaje */}
            <div className="space-y-2">
              <Label htmlFor="mensaje">Mensaje (opcional)</Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="mensaje"
                  placeholder="Cuéntanos por qué te gustaría unirte..."
                  className="pl-10 min-h-[100px]"
                  {...register('mensaje')}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Enviar Solicitud
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleBackToLogin}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio de sesión
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Ilustración y Beneficios */}
      <div className="hidden lg:flex lg:flex-col lg:justify-center lg:bg-primary/5 lg:p-16 xl:p-24">
        <div className="mx-auto w-full max-w-lg space-y-8">
          <div className="space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary">
              <UserPlus className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              Únete a nuestro equipo
            </h2>
            <p className="text-lg text-muted-foreground">
              Xhion Core es la plataforma integral para la gestión de proyectos, colaboración y conocimiento empresarial.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">¿Qué obtendrás?</h3>
            <ul className="space-y-3">
              {[
                {
                  icon: CheckCircle2,
                  title: 'Gestión de Proyectos',
                  description: 'Organiza y supervisa proyectos con herramientas avanzadas',
                },
                {
                  icon: CheckCircle2,
                  title: 'Colaboración en Tiempo Real',
                  description: 'Trabaja con tu equipo de forma sincronizada',
                },
                {
                  icon: CheckCircle2,
                  title: 'Base de Conocimiento',
                  description: 'Accede y comparte información valiosa',
                },
                {
                  icon: CheckCircle2,
                  title: 'Herramientas de IA',
                  description: 'Potencia tu productividad con inteligencia artificial',
                },
              ].map((feature, index) => (
                <li key={index} className="flex gap-3">
                  <feature.icon className="h-6 w-6 flex-shrink-0 text-primary" />
                  <div>
                    <p className="font-medium">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border bg-card p-6 space-y-2">
            <p className="text-sm font-medium">Proceso de Solicitud</p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Completa el formulario de solicitud</li>
              <li>Nuestro equipo revisará tu información</li>
              <li>Recibirás una respuesta por email</li>
              <li>Si es aprobada, accede con tu invitación</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
