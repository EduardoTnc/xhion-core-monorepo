import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Shield, Loader2, CheckCircle2 } from "lucide-react"
import { useUsersForRoles, useRolesWithDetails } from "@/hooks/queries"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { userService } from "../../services/userService"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ChangeUserRoleModalProps {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Función para obtener iniciales
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function ChangeUserRoleModal({ userId, open, onOpenChange }: ChangeUserRoleModalProps) {
  // TanStack Query hooks
  const { data: todosLosUsuarios = [] } = useUsersForRoles()
  const { data: rolesCompletos = [] } = useRolesWithDetails()
  const queryClient = useQueryClient()
  const [selectedRoleId, setSelectedRoleId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Buscar el usuario
  const user = todosLosUsuarios.find(u => u.id === userId)

  // Inicializar con el rol actual del usuario
  useEffect(() => {
    if (user && open) {
      setSelectedRoleId(user.rolId || "")
    }
  }, [user, open])

  // Manejar submit
  const handleSubmit = async () => {
    if (!selectedRoleId || !user) {
      toast.error("Por favor selecciona un rol")
      return
    }

    if (selectedRoleId === user.rolId) {
      toast.info("El usuario ya tiene este rol asignado")
      onOpenChange(false)
      return
    }

    setIsSubmitting(true)
    try {
      await userService.changeRole(userId, selectedRoleId)

      const newRole = rolesCompletos.find(r => r.id === selectedRoleId)
      toast.success(`Rol cambiado a "${newRole?.nombre}" exitosamente`)

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all })

      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar el rol del usuario')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null

  const currentRole = rolesCompletos.find(r => r.id === user.rolId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cambiar Rol de Usuario</DialogTitle>
          <DialogDescription>
            Selecciona el nuevo rol para el usuario. Los permisos se actualizarán automáticamente.
          </DialogDescription>
        </DialogHeader>

        {/* Info del usuario */}
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatarUrl || undefined} alt={user.nombreCompleto} />
              <AvatarFallback>{getInitials(user.nombreCompleto)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{user.nombreCompleto}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            {currentRole && (
              <Badge
                variant="outline"
                style={{
                  borderColor: currentRole.color || undefined,
                  color: currentRole.color || undefined
                }}
              >
                <Shield className="h-3 w-3 mr-1" />
                {currentRole.nombre}
              </Badge>
            )}
          </div>
        </div>

        {/* Selector de roles */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Seleccionar Nuevo Rol</Label>
          <ScrollArea className="h-[300px] rounded-lg border border-border p-4">
            <RadioGroup value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <div className="space-y-3">
                {rolesCompletos.map((role) => {
                  const isCurrentRole = role.id === user.rolId
                  const isSelected = role.id === selectedRoleId

                  return (
                    <div
                      key={role.id}
                      className={`flex items-start gap-3 rounded-lg border p-4 transition-all cursor-pointer ${isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      onClick={() => setSelectedRoleId(role.id)}
                    >
                      <RadioGroupItem value={role.id} id={role.id} className="mt-1" />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="h-8 w-8 rounded-md flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: role.color || '#666' }}
                          >
                            <Shield className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Label
                                htmlFor={role.id}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {role.nombre}
                              </Label>
                              {isCurrentRole && (
                                <Badge variant="secondary" className="text-xs">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Rol Actual
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {role.descripcion || 'Sin descripción'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground">
                            {role.permisos.length} permisos • {role._count?.usuarios || 0} usuarios
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </RadioGroup>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedRoleId || selectedRoleId === user.rolId}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cambiando...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Cambiar Rol
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
