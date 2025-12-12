import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Copy, Check, UserPlus, Link as LinkIcon, UserCheck } from "lucide-react"
import { toast } from "sonner"
import { useRolesWithDetails } from "@/hooks/queries"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { useAuthStore } from "../../store/authStore"
import { CompleteRegistrationModal } from "./CompleteRegistrationModal"
import apiClient from "../../api/axios"

// Schema de validación
const inviteSchema = z.object({
  email: z.string().email("Email inválido"),
  nombre_completo: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  rol_id: z.string().min(1, "Debes seleccionar un rol"),
})

type InviteFormData = z.infer<typeof inviteSchema>

interface InviteUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialRole?: { id: string; nombre: string } // ✅ Pre-selección de rol
}

export function InviteUserModal({ open, onOpenChange, initialRole }: InviteUserModalProps) {
  // TanStack Query for roles
  const { data: rolesCompletos = [] } = useRolesWithDetails()
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuthStore()
  const [step, setStep] = useState<"form" | "success">("form")
  const [invitationUrl, setInvitationUrl] = useState("")
  const [invitationToken, setInvitationToken] = useState("")
  const [invitedUserData, setInvitedUserData] = useState<{ email: string; nombre_completo: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [showCompleteRegistrationModal, setShowCompleteRegistrationModal] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
  })

  const selectedRolId = watch("rol_id")

  // ✅ Pre-seleccionar rol si se proporciona
  useEffect(() => {
    if (initialRole && open) {
      setValue("rol_id", initialRole.id)
    }
  }, [initialRole, open, setValue])

  // Resetear al cerrar
  const handleClose = () => {
    setStep("form")
    setInvitationUrl("")
    setCopied(false)
    reset()
    onOpenChange(false)
  }

  // Enviar invitación
  const onSubmit = async (data: InviteFormData) => {
    try {
      // Validar que el usuario actual exista
      if (!currentUser?.id) {
        toast.error("No se pudo identificar el usuario actual. Por favor, inicia sesión nuevamente.")
        return
      }

      const response = await apiClient.post("/invitaciones", {
        ...data,
        invitado_por_id: currentUser.id,
      })

      // Guardar URL, token y datos del usuario
      setInvitationUrl(response.data.invitationUrl)
      setInvitationToken(response.data.token)
      setInvitedUserData({
        email: data.email,
        nombre_completo: data.nombre_completo,
      })
      setStep("success")
      toast.success("¡Enlace de invitación generado!")
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Error al generar la invitación"
      toast.error(errorMessage)
    }
  }

  // Copiar al portapapeles
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invitationUrl)
      setCopied(true)
      toast.success("Enlace copiado al portapapeles")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Error al copiar el enlace")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Invitar Nuevo Usuario
              </DialogTitle>
              <DialogDescription>
                Completa los datos del nuevo usuario. Se generará un enlace de invitación que podrás compartir manualmente.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  {...register("email")}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Nombre Completo */}
              <div className="space-y-2">
                <Label htmlFor="nombre_completo">Nombre Completo *</Label>
                <Input
                  id="nombre_completo"
                  placeholder="Juan Pérez"
                  {...register("nombre_completo")}
                  disabled={isSubmitting}
                />
                {errors.nombre_completo && (
                  <p className="text-sm text-destructive">{errors.nombre_completo.message}</p>
                )}
              </div>

              {/* Rol */}
              <div className="space-y-2">
                <Label htmlFor="rol_id">Rol *</Label>
                <Select
                  value={selectedRolId}
                  onValueChange={(value) => setValue("rol_id", value, { shouldValidate: true })}
                  disabled={isSubmitting || !!initialRole}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesCompletos.map((rol) => (
                      <SelectItem key={rol.id} value={rol.id}>
                        {rol.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {initialRole && (
                  <p className="text-xs text-muted-foreground">
                    El usuario será invitado al rol: <span className="font-medium">{initialRole.nombre}</span>
                  </p>
                )}
                {errors.rol_id && (
                  <p className="text-sm text-destructive">{errors.rol_id.message}</p>
                )}
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
                      Generando...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Generar Enlace
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                ¡Enlace de Invitación Generado!
              </DialogTitle>
              <DialogDescription>
                Copia el siguiente enlace y compártelo con el nuevo usuario. El enlace expirará en 24 horas.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Enlace de invitación */}
              <div className="space-y-2">
                <Label>Enlace de Invitación</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1 min-w-0">
                    <Input
                      value={invitationUrl}
                      readOnly
                      className="font-mono text-xs pr-2 truncate"
                      title={invitationUrl}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    className="shrink-0"
                    title="Copiar enlace"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Haz clic en el botón para copiar el enlace completo
                </p>
              </div>

              {/* Información adicional */}
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <h4 className="text-sm font-medium mb-2">Próximos pasos:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Comparte este enlace con el nuevo usuario para que complete su registro</li>
                  <li>O completa el registro tú mismo usando el botón de abajo</li>
                  <li>El enlace expirará en 24 horas</li>
                </ul>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="w-full sm:w-auto"
              >
                Cerrar
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowCompleteRegistrationModal(true)}
                className="w-full sm:w-auto"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Completar Registro Ahora
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setStep("form")
                  setInvitationUrl("")
                  setInvitationToken("")
                  setInvitedUserData(null)
                  setCopied(false)
                  reset()
                }}
                className="w-full sm:w-auto"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Invitar a Otro Usuario
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>

      {/* Modal para completar registro por admin */}
      {invitedUserData && (
        <CompleteRegistrationModal
          open={showCompleteRegistrationModal}
          onOpenChange={setShowCompleteRegistrationModal}
          token={invitationToken}
          invitacionData={invitedUserData}
          onSuccess={async () => {
            toast.success("Usuario registrado exitosamente")
            handleClose()
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
          }}
        />
      )}
    </Dialog>
  )
}
