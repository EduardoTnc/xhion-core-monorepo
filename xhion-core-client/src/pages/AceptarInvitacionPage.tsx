import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, XCircle, UserPlus, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import apiClient from "../api/axios"

// Schema de validación
const registroSchema = z.object({
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string(),
  avatarUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  fechaNacimiento: z.string().optional(),
  biografia: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

type RegistroFormData = z.infer<typeof registroSchema>

interface InvitacionData {
  id: string
  email: string
  nombre_completo: string
  rol_id: string
  token: string
  fecha_expiracion: string
}

export default function AceptarInvitacionPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token")

  const [invitacion, setInvitacion] = useState<InvitacionData | null>(null)
  const [isLoadingInvitation, setIsLoadingInvitation] = useState(true)
  const [invitationError, setInvitationError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistroFormData>({
    resolver: zodResolver(registroSchema),
  })

  // Cargar datos de la invitación
  useEffect(() => {
    if (!token) {
      setInvitationError("Token de invitación no proporcionado")
      setIsLoadingInvitation(false)
      return
    }

    const fetchInvitation = async () => {
      try {
        const response = await apiClient.get(`/invitaciones/${token}`)
        setInvitacion(response.data)
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Error al cargar la invitación"
        setInvitationError(errorMessage)
      } finally {
        setIsLoadingInvitation(false)
      }
    }

    fetchInvitation()
  }, [token])

  // Enviar registro
  const onSubmit = async (data: RegistroFormData) => {
    if (!token) return

    try {
      await apiClient.post("/invitaciones/aceptar", {
        token,
        password: data.password,
        avatarUrl: data.avatarUrl || undefined,
        fechaNacimiento: data.fechaNacimiento || undefined,
        biografia: data.biografia || undefined,
      })

      toast.success("¡Registro completado exitosamente!")
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Error al completar el registro"
      toast.error(errorMessage)
    }
  }

  // Estados de carga y error
  if (isLoadingInvitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Validando invitación...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (invitationError || !invitacion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Invitación No Válida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                {invitationError || "No se pudo cargar la invitación"}
              </AlertDescription>
            </Alert>
            <Button
              className="w-full mt-4"
              variant="outline"
              onClick={() => navigate("/login")}
            >
              Ir al Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-6 w-6" />
            Completa tu Registro
          </CardTitle>
          <CardDescription>
            Has sido invitado a unirte al sistema. Completa los siguientes datos para activar tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Información de la invitación */}
          <div className="mb-6 p-4 rounded-lg border border-border bg-muted/50">
            <h3 className="text-sm font-medium mb-2">Información de tu cuenta:</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p><span className="font-medium text-foreground">Nombre:</span> {invitacion.nombre_completo}</p>
              <p><span className="font-medium text-foreground">Email:</span> {invitacion.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  {...register("password")}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repite tu contraseña"
                  {...register("confirmPassword")}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* URL del Avatar (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="avatarUrl">URL del Avatar (Opcional)</Label>
              <Input
                id="avatarUrl"
                type="url"
                placeholder="https://ejemplo.com/avatar.jpg"
                {...register("avatarUrl")}
                disabled={isSubmitting}
              />
              {errors.avatarUrl && (
                <p className="text-sm text-destructive">{errors.avatarUrl.message}</p>
              )}
            </div>

            {/* Fecha de Nacimiento (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="fechaNacimiento">Fecha de Nacimiento (Opcional)</Label>
              <Input
                id="fechaNacimiento"
                type="date"
                {...register("fechaNacimiento")}
                disabled={isSubmitting}
              />
            </div>

            {/* Biografía (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="biografia">Biografía (Opcional)</Label>
              <Textarea
                id="biografia"
                placeholder="Cuéntanos un poco sobre ti..."
                rows={3}
                {...register("biografia")}
                disabled={isSubmitting}
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/login")}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completando Registro...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Completar Registro
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
