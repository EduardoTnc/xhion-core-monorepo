import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePickerBirth } from "@/components/ui/date-picker-birth"
import { Loader2, CheckCircle2, Eye, EyeOff, UserCheck } from "lucide-react"
import { toast } from "sonner"
import apiClient from "../../api/axios"

// Schema de validación
const completeRegistrationSchema = z.object({
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string(),
  avatarUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  fechaNacimiento: z.string().optional(),
  fechaIngreso: z.string().optional(),
  biografia: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

type CompleteRegistrationFormData = z.infer<typeof completeRegistrationSchema>

interface CompleteRegistrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: string
  invitacionData: {
    email: string
    nombre_completo: string
  }
  onSuccess?: () => void
}

export function CompleteRegistrationModal({
  open,
  onOpenChange,
  token,
  invitacionData,
  onSuccess,
}: CompleteRegistrationModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CompleteRegistrationFormData>({
    resolver: zodResolver(completeRegistrationSchema),
    defaultValues: {
      fechaIngreso: new Date().toISOString().split('T')[0], // Fecha actual por defecto
    },
  })

  // Resetear al cerrar
  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  // Enviar registro
  const onSubmit = async (data: CompleteRegistrationFormData) => {
    try {
      await apiClient.post("/invitaciones/completar-por-admin", {
        token,
        password: data.password,
        avatarUrl: data.avatarUrl || undefined,
        fechaNacimiento: data.fechaNacimiento || undefined,
        fechaIngreso: data.fechaIngreso || undefined,
        biografia: data.biografia || undefined,
      })

      toast.success("Usuario registrado exitosamente")
      handleClose()
      
      // Callback de éxito
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Error al completar el registro"
      toast.error(errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Completar Registro del Usuario
          </DialogTitle>
          <DialogDescription>
            Completa los datos del usuario invitado. El usuario podrá iniciar sesión inmediatamente con estos datos.
          </DialogDescription>
        </DialogHeader>

        {/* Información del usuario */}
        <div className="p-4 rounded-lg border border-border bg-muted/50">
          <h3 className="text-sm font-medium mb-2">Información del usuario:</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">Nombre:</span> {invitacionData.nombre_completo}</p>
            <p><span className="font-medium text-foreground">Email:</span> {invitacionData.email}</p>
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
                tabIndex={-1}
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
                placeholder="Repite la contraseña"
                {...register("confirmPassword")}
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fecha de Nacimiento */}
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
                    placeholder="Selecciona fecha de nacimiento"
                    disabled={isSubmitting}
                    maxDate={new Date()} // No permitir fechas futuras
                  />
                )}
              />
            </div>

            {/* Fecha de Ingreso */}
            <div className="space-y-2">
              <Label htmlFor="fechaIngreso">Fecha de Ingreso</Label>
              <Controller
                name="fechaIngreso"
                control={control}
                render={({ field }) => (
                  <DatePickerBirth
                    date={field.value ? new Date(field.value) : undefined}
                    onDateChange={(date) => {
                      field.onChange(date ? date.toISOString().split('T')[0] : '')
                    }}
                    placeholder="Selecciona fecha de ingreso"
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>
          </div>

          {/* URL del Avatar */}
          <div className="space-y-2">
            <Label htmlFor="avatarUrl">URL del Avatar</Label>
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

          {/* Biografía */}
          <div className="space-y-2">
            <Label htmlFor="biografia">Biografía</Label>
            <Textarea
              id="biografia"
              placeholder="Información adicional del usuario..."
              rows={3}
              {...register("biografia")}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Completar Registro
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
