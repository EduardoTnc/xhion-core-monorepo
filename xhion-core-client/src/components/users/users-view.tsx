import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, UserPlus, MoreVertical, Shield, Eye, Ban, CheckCircle2, Trash2, Filter, Users, UserCheck, UserX, TrendingUp } from "lucide-react"
import { useRoleStore } from "../../store/roleStore"
import { InviteUserModal } from "../users/InviteUserModal"
import { UserDetailsModal } from "./user-details-modal"
import { ChangeUserRoleModal } from "./change-user-role-modal"
import { InvitationsStatsModal } from "./InvitationsStatsModal"
import { userService } from "../../services/userService"
import { toast } from "sonner"
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

// Función para formatear fechas
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
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

export function UsersView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [userToToggle, setUserToToggle] = useState<{ id: string; currentStatus: string } | null>(null)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)

  const {
    todosLosUsuarios,
    rolesCompletos,
    isLoading,
    fetchInitialData,
  } = useRoleStore()

  // Cargar datos iniciales
  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  // Filtrar usuarios
  const filteredUsers = todosLosUsuarios.filter(user => {
    // Filtro de búsqueda
    const matchesSearch = 
      user.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    // Filtro de rol
    const matchesRole = roleFilter === "all" || user.rolId === roleFilter

    // Filtro de estado
    const matchesStatus = statusFilter === "all" || user.estado === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  // Estadísticas
  const totalUsers = todosLosUsuarios.length
  const activeUsers = todosLosUsuarios.filter(u => u.estado === "ACTIVO").length
  const inactiveUsers = todosLosUsuarios.filter(u => u.estado === "INACTIVO").length

  // Manejar ver detalles
  const handleViewDetails = (userId: string) => {
    setSelectedUserId(userId)
    setIsDetailsModalOpen(true)
  }

  // Manejar cambiar rol
  const handleChangeRole = (userId: string) => {
    setSelectedUserId(userId)
    setIsChangeRoleModalOpen(true)
  }

  // Manejar activar/desactivar usuario
  const handleToggleUserStatus = async () => {
    if (!userToToggle) return

    setIsTogglingStatus(true)
    try {
      const newStatus = userToToggle.currentStatus === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
      await userService.updateStatus(userToToggle.id, newStatus)
      
      toast.success(`Usuario ${newStatus === 'ACTIVO' ? 'activado' : 'desactivado'} exitosamente`)
      setUserToToggle(null)
      
      // Recargar datos
      await fetchInitialData()
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar estado del usuario')
    } finally {
      setIsTogglingStatus(false)
    }
  }

  // Manejar eliminar usuario
  const handleDeleteUser = async () => {
    if (!userToDelete) return

    setIsDeleting(true)
    try {
      await userService.deleteUser(userToDelete)
      
      toast.success('Usuario eliminado exitosamente')
      setUserToDelete(null)
      
      // Recargar datos
      await fetchInitialData()
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar usuario')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          {/* Título y botón */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Gestión de Usuarios</h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Administra todos los usuarios del sistema
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                className="gap-2"
                onClick={() => setIsStatsModalOpen(true)}
              >
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Estadísticas</span>
              </Button>
              <Button 
                className="gap-2 w-full sm:w-auto"
                onClick={() => setIsInviteModalOpen(true)}
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Invitar Usuario</span>
                <span className="sm:hidden">Invitar</span>
              </Button>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <p className="text-xl sm:text-2xl font-semibold text-foreground mt-1">{totalUsers}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-500" />
                <p className="text-xs text-muted-foreground">Activos</p>
              </div>
              <p className="text-xl sm:text-2xl font-semibold text-foreground mt-1">{activeUsers}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <UserX className="h-4 w-4 text-red-500" />
                <p className="text-xs text-muted-foreground">Inactivos</p>
              </div>
              <p className="text-xl sm:text-2xl font-semibold text-foreground mt-1">{inactiveUsers}</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filtro por rol */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                {rolesCompletos.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro por estado */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="ACTIVO">Activos</SelectItem>
                <SelectItem value="INACTIVO">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {isLoading ? (
          // Skeleton loading
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          // Empty state
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                  ? "No se encontraron usuarios"
                  : "No hay usuarios"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza invitando usuarios al sistema"}
              </p>
              {!searchQuery && roleFilter === "all" && statusFilter === "all" && (
                <Button 
                  className="mt-4 gap-2"
                  onClick={() => setIsInviteModalOpen(true)}
                >
                  <UserPlus className="h-4 w-4" />
                  Invitar Usuario
                </Button>
              )}
            </div>
          </div>
        ) : (
          // Lista de usuarios
          <div className="space-y-3">
            {filteredUsers.map((user) => {
              const userRole = rolesCompletos.find(r => r.id === user.rolId)
              
              return (
                <div
                  key={user.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 rounded-lg border border-border bg-card p-3 sm:p-4 transition-all hover:border-primary/50 hover:shadow-sm"
                >
                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatarUrl || undefined} alt={user.nombreCompleto} />
                    <AvatarFallback>{getInitials(user.nombreCompleto)}</AvatarFallback>
                  </Avatar>

                  {/* Info del usuario */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {user.nombreCompleto}
                      </h4>
                      <Badge 
                        variant={user.estado === "ACTIVO" ? "default" : "secondary"} 
                        className="text-xs"
                      >
                        {user.estado === "ACTIVO" ? "Activo" : "Inactivo"}
                      </Badge>
                      {userRole && (
                        <Badge 
                          variant="outline" 
                          className="text-xs"
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
                    <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground">
                      <span className="truncate">{user.email}</span>
                      {user.puestoTrabajo && (
                        <span className="hidden sm:inline">•</span>
                      )}
                      {user.puestoTrabajo && (
                        <span>{user.puestoTrabajo.titulo}</span>
                      )}
                      <span className="hidden sm:inline">•</span>
                      <span>Unido: {formatDate(user.fechaIngreso)}</span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem onClick={() => handleViewDetails(user.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalles
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem onClick={() => handleChangeRole(user.id)}>
                        <Shield className="mr-2 h-4 w-4" />
                        Cambiar Rol
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem onClick={() => setUserToToggle({ id: user.id, currentStatus: user.estado })}>
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
                        onClick={() => setUserToDelete(user.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar Usuario
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })}
          </div>
        )}

        {/* Contador */}
        {!isLoading && filteredUsers.length > 0 && (
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm text-muted-foreground text-center">
              Mostrando {filteredUsers.length} de {totalUsers} usuarios
            </p>
          </div>
        )}
      </div>

      {/* Modales */}
      <InviteUserModal
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
      />

      <InvitationsStatsModal
        open={isStatsModalOpen}
        onOpenChange={setIsStatsModalOpen}
      />

      {selectedUserId && (
        <>
          <UserDetailsModal
            userId={selectedUserId}
            open={isDetailsModalOpen}
            onOpenChange={setIsDetailsModalOpen}
          />

          <ChangeUserRoleModal
            userId={selectedUserId}
            open={isChangeRoleModalOpen}
            onOpenChange={setIsChangeRoleModalOpen}
          />
        </>
      )}

      {/* Alert Dialog para cambiar estado */}
      <AlertDialog open={!!userToToggle} onOpenChange={() => setUserToToggle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {userToToggle?.currentStatus === 'ACTIVO' ? '¿Desactivar usuario?' : '¿Activar usuario?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {userToToggle?.currentStatus === 'ACTIVO'
                ? 'El usuario no podrá acceder al sistema hasta que sea reactivado.'
                : 'El usuario podrá acceder nuevamente al sistema.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isTogglingStatus}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleUserStatus}
              disabled={isTogglingStatus}
            >
              {isTogglingStatus ? 'Procesando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog para eliminar */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El usuario será eliminado permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
