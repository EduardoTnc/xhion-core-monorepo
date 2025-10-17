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
import { Loader2, Copy, Check, UserPlus, Link as LinkIcon } from "lucide-react"
import { toast } from "sonner"
import { useRoleStore } from "../../store/roleStore"
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
  const { rolesCompletos } = useRoleStore()
  const [step, setStep] = useState<"form" | "success">("form")
  const [invitationUrl, setInvitationUrl] = useState("")
  const [copied, setCopied] = useState(false)

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
      // Obtener usuario actual del localStorage o contexto
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
      
      const response = await apiClient.post("/api/v1/invitaciones", {
        ...data,
        invitado_por_id: currentUser.id,
      })

      // Guardar URL y cambiar a vista de éxito
      setInvitationUrl(response.data.invitationUrl)
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
                  <Input
                    value={invitationUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Información adicional */}
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <h4 className="text-sm font-medium mb-2">Próximos pasos:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Comparte este enlace con el nuevo usuario</li>
                  <li>El usuario creará su contraseña</li>
                  <li>El usuario completará su perfil</li>
                  <li>El enlace expirará en 24 horas</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Listo
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setStep("form")
                  setInvitationUrl("")
                  setCopied(false)
                  reset()
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Invitar a Otro Usuario
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
