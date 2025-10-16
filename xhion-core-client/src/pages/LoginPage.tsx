import { useEffect } from "react"
import { useNavigate, NavLink } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Sparkles, Loader2, AlertCircle } from "lucide-react"
import { useAuthStore } from "../store/authStore"
import { authService } from "../services/authService"
import { toast } from "sonner"

// Schema de validación con Zod
const loginSchema = z.object({
  email: z.string().email("Ingresa un correo electrónico válido"),
  password: z.string().min(1, "La contraseña es requerida"),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { login: loginStore, status } = useAuthStore()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  // Redirección reactiva cuando el usuario se autentica
  useEffect(() => {
    if (status === 'authenticated') {
      navigate('/', { replace: true })
    }
  }, [status, navigate])

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Llamar al servicio de autenticación
      const { accessToken, refreshToken, user } = await authService.login({
        email: data.email,
        password: data.password,
      })

      // Guardar en el store de Zustand
      loginStore(accessToken, refreshToken, user)

      // Mostrar mensaje de éxito
      toast.success(`¡Bienvenido, ${user.nombreCompleto}!`)

      // La redirección ocurrirá automáticamente por el useEffect
    } catch (error: any) {
      // Manejar errores
      const errorMessage = error.message || 'Error al iniciar sesión'
      
      // Mostrar error en el formulario
      setError('root', {
        type: 'manual',
        message: errorMessage,
      })

      // Mostrar toast de error
      toast.error(errorMessage)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Login Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Logo and branding */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Xhion Core</h1>
              <p className="text-sm text-muted-foreground">Enterprise Platform</p>
            </div>
          </div>

          {/* Welcome heading */}
          <div className="mb-8">
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground">Bienvenido de nuevo</h2>
            <p className="mt-2 text-pretty text-sm text-muted-foreground">
              Ingresa tus credenciales para acceder a tu cuenta
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Error general del formulario */}
            {errors.root && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.root.message}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@empresa.com"
                {...register("email")}
                disabled={isSubmitting}
                className="h-11"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </Label>
                <NavLink to="/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors">
                  ¿Olvidaste tu contraseña?
                </NavLink>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                disabled={isSubmitting}
                className="h-11"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                {...register("rememberMe")}
                disabled={isSubmitting}
              />
              <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground cursor-pointer">
                Recordar mi sesión
              </Label>
            </div>

            <Button type="submit" className="w-full h-11" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿No tienes una cuenta?{" "}
              <NavLink to="/signup" className="font-medium text-primary hover:text-primary/80 transition-colors">
                Solicitar acceso
              </NavLink>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Marketing Content */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:bg-primary/5 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-lg">
          <h2 className="text-balance text-4xl font-semibold tracking-tight text-foreground">
            Gestión de proyectos potenciada por IA
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Xhion Core te ayuda a organizar, colaborar y entregar proyectos excepcionales con insights inteligentes y
            automatización avanzada.
          </p>

          <div className="mt-10 space-y-6">
            {/* Feature 1 */}
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">IA Insights</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Recomendaciones inteligentes para optimizar tu flujo de trabajo
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Colaboración en tiempo real</h3>
                <p className="mt-1 text-sm text-muted-foreground">Trabaja con tu equipo sin fricciones</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Seguridad empresarial</h3>
                <p className="mt-1 text-sm text-muted-foreground">Auditoría completa y control de acceso granular</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
