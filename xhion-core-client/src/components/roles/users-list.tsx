import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, UserPlus, MoreVertical, Mail, Calendar, Shield, UserCog, Trash2, Eye, Ban, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { useRoleStore } from "../../store/roleStore"
import { InviteUserModal } from "../users/InviteUserModal"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

// Función para formatear fechas
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
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

export function UsersList() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [userToRemove, setUserToRemove] = useState<string | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)
  const { 
    todosLosUsuarios,
    selectedRole,
    rolesCompletos,
  } = useRoleStore()

  // Filtrar usuarios del rol seleccionado (instantáneo - en memoria)
  const usersInRole = selectedRole 
    ? todosLosUsuarios.filter(user => user.rolId === selectedRole.id)
    : []

  // Filtrar usuarios por búsqueda
  const filteredUsers = usersInRole.filter(user =>
    user.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Manejar cambio de rol
  const handleChangeRole = (userId: string) => {
    // Navegar al panel de usuarios con el usuario seleccionado
    navigate(`/usuarios?selected=${userId}`)
    toast.info('Redirigiendo al panel de usuarios...')
  }

  // Manejar ver perfil
  const handleViewProfile = (userId: string) => {
    navigate(`/usuarios/${userId}`)
  }

  // Manejar remover del rol
  const handleRemoveFromRole = async () => {
    if (!userToRemove || !selectedRole) return

    setIsRemoving(true)
    try {
      // TODO: Implementar endpoint para remover usuario de rol
      // await userService.removeFromRole(userToRemove, selectedRole.id)
      
      toast.success('Usuario removido del rol exitosamente')
      setUserToRemove(null)
      
      // Recargar datos
      // await fetchInitialData()
    } catch (error: any) {
      toast.error(error.message || 'Error al remover usuario del rol')
    } finally {
      setIsRemoving(false)
    }
  }

  // Manejar activar/desactivar usuario
  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
      // TODO: Implementar endpoint para cambiar estado
      // await userService.updateStatus(userId, newStatus)
      
      toast.success(`Usuario ${newStatus === 'ACTIVO' ? 'activado' : 'desactivado'} exitosamente`)
      
      // Recargar datos
      // await fetchInitialData()
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar estado del usuario')
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and add - Responsive */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button 
          className="gap-2 w-full sm:w-auto"
          onClick={() => setIsInviteModalOpen(true)}
        >
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Invitar Usuario</span>
          <span className="sm:hidden">Invitar</span>
        </Button>
      </div>

      {/* Users list */}
      <div className="space-y-2">
        {filteredUsers.length === 0 && searchQuery ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">No se encontraron usuarios</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
          <div
            key={user.id}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 rounded-lg border border-border bg-card p-3 sm:p-4 transition-all hover:border-primary/50 hover:shadow-sm"
          >
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
              <AvatarImage src={user.avatarUrl || undefined} alt={user.nombreCompleto} />
              <AvatarFallback>{getInitials(user.nombreCompleto)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 w-full">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-medium text-foreground truncate">{user.nombreCompleto}</h4>
                <Badge 
                  variant={user.estado === "ACTIVO" ? "default" : "secondary"} 
                  className="text-xs"
                >
                  {user.estado === "ACTIVO" ? "Activo" : user.estado}
                </Badge>
              </div>
              <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1 truncate">
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.puestoTrabajo && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    {user.puestoTrabajo.titulo}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-left sm:text-right">
                <p className="text-xs font-medium text-foreground">Unido</p>
                <p className="text-xs text-muted-foreground">{formatDate(user.fechaIngreso)}</p>
              </div>
              
              {/* Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => handleViewProfile(user.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Perfil
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => handleChangeRole(user.id)}>
                    <Shield className="mr-2 h-4 w-4" />
                    Cambiar Rol
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => handleToggleUserStatus(user.id, user.estado)}>
                    {user.estado === 'ACTIVO' ? (
                      <>
                        <Ban className="mr-2 h-4 w-4" />
                        Desactivar Usuario
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Activar Usuario
                      </>
                    )}
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={() => setUserToRemove(user.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remover del Rol
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          ))
        )}
      </div>

      {/* Contador de usuarios */}
      {filteredUsers.length > 0 && (
        <div className="border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredUsers.length} {filteredUsers.length === 1 ? 'usuario' : 'usuarios'}
            {searchQuery && ` que coinciden con "${searchQuery}"`}
          </p>
        </div>
      )}

      {usersInRole.length === 0 && !searchQuery && (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <UserPlus className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-sm font-medium text-foreground">No hay usuarios asignados</h3>
          <p className="mt-1 text-sm text-muted-foreground">Comienza invitando usuarios a este rol</p>
          <Button 
            className="mt-4 gap-2"
            onClick={() => setIsInviteModalOpen(true)}
          >
            <UserPlus className="h-4 w-4" />
            Invitar Usuario
          </Button>
        </div>
      )}

      {/* Modal de invitación */}
      <InviteUserModal
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        initialRole={selectedRole || undefined}
      />

      {/* Alert Dialog para remover usuario */}
      <AlertDialog open={!!userToRemove} onOpenChange={() => setUserToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Remover usuario del rol?</AlertDialogTitle>
            <AlertDialogDescription>
              El usuario ya no tendrá los permisos asociados a este rol. Esta acción no elimina al usuario del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveFromRole}
              disabled={isRemoving}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isRemoving ? 'Removiendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
