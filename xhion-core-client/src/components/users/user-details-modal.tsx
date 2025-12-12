import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Mail,
  Calendar,
  Shield,
  Briefcase,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Hash
} from "lucide-react"
import { useUsersForRoles, useRolesWithDetails } from "@/hooks/queries"

interface UserDetailsModalProps {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Función para formatear fechas
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
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

export function UserDetailsModal({ userId, open, onOpenChange }: UserDetailsModalProps) {
  // TanStack Query hooks
  const { data: todosLosUsuarios = [] } = useUsersForRoles()
  const { data: rolesCompletos = [] } = useRolesWithDetails()

  // Buscar el usuario
  const user = todosLosUsuarios.find(u => u.id === userId)
  const userRole = user ? rolesCompletos.find(r => r.id === user.rolId) : null

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Detalles del Usuario</DialogTitle>
          <DialogDescription>
            Información completa del usuario y su configuración en el sistema
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
          <div className="space-y-6">
            {/* Header con avatar y nombre */}
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatarUrl || undefined} alt={user.nombreCompleto} />
                <AvatarFallback className="text-2xl">{getInitials(user.nombreCompleto)}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-foreground">{user.nombreCompleto}</h3>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <Badge
                    variant={user.estado === "ACTIVO" ? "default" : "secondary"}
                    className="gap-1"
                  >
                    {user.estado === "ACTIVO" ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {user.estado}
                  </Badge>
                  {userRole && (
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: userRole.color || undefined,
                        color: userRole.color || undefined
                      }}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {userRole.nombre}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Información de contacto */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Información de Contacto
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm text-foreground">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Información laboral */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Información Laboral
              </h4>
              <div className="space-y-3">
                {user.puestoTrabajo ? (
                  <>
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Puesto de Trabajo</p>
                        <p className="text-sm text-foreground">{user.puestoTrabajo.titulo}</p>
                      </div>
                    </div>
                    {user.puestoTrabajo.descripcion && (
                      <div className="flex items-start gap-3">
                        <div className="h-4 w-4" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Descripción</p>
                          <p className="text-sm text-foreground">{user.puestoTrabajo.descripcion}</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin puesto de trabajo asignado</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Rol y permisos */}
            {userRole && (
              <>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Rol y Permisos
                  </h4>
                  <div className="space-y-3">
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: userRole.color || '#666' }}
                        >
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{userRole.nombre}</p>
                          <p className="text-xs text-muted-foreground">
                            {userRole.descripcion || 'Sin descripción'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-2">Permisos asignados:</p>
                        <p className="text-sm font-semibold text-foreground">
                          {userRole.permisos.length} permisos activos
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />
              </>
            )}

            {/* Fechas importantes */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Fechas Importantes
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Fecha de Ingreso</p>
                    <p className="text-sm text-foreground">{formatDate(user.fechaIngreso)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Última Actualización</p>
                    <p className="text-sm text-foreground">{formatDate(user.actualizadoEn)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Fecha de Creación</p>
                    <p className="text-sm text-foreground">{formatDate(user.creadoEn)}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Información del sistema */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Información del Sistema
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">ID de Usuario</p>
                    <p className="text-xs font-mono text-foreground break-all">{user.id}</p>
                  </div>
                </div>
                {userRole && (
                  <div className="flex items-start gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">ID de Rol</p>
                      <p className="text-xs font-mono text-foreground break-all">{user.rolId}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
