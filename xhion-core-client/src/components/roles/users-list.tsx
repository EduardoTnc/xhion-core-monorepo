import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, UserPlus, MoreVertical, Mail, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { useRoleStore } from "../../store/roleStore"

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
  const [searchQuery, setSearchQuery] = useState("")
  const { 
    usersInRole, 
    selectedRole,
    isLoadingUsers, 
    fetchUsersInRole,
    currentPage,
    totalPages,
    totalUsers,
  } = useRoleStore()

  // Filtrar usuarios por búsqueda
  const filteredUsers = usersInRole.filter(user =>
    user.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Manejar cambio de página
  const handlePageChange = (newPage: number) => {
    if (selectedRole && newPage >= 1 && newPage <= totalPages) {
      fetchUsersInRole(selectedRole.id, newPage)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and add */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Asignar Usuario
        </Button>
      </div>

      {/* Users list */}
      <div className="space-y-2">
        {isLoadingUsers ? (
          // Skeleton loading
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-3 w-60" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))
        ) : filteredUsers.length === 0 && searchQuery ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">No se encontraron usuarios</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatarUrl || undefined} alt={user.nombreCompleto} />
              <AvatarFallback>{getInitials(user.nombreCompleto)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-foreground">{user.nombreCompleto}</h4>
                <Badge 
                  variant={user.estado === "ACTIVO" ? "default" : "secondary"} 
                  className="text-xs"
                >
                  {user.estado === "ACTIVO" ? "Activo" : user.estado}
                </Badge>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {user.email}
                </div>
                {user.puestoTrabajo && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {user.puestoTrabajo.titulo}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-medium text-foreground">Unido</p>
                <p className="text-xs text-muted-foreground">{formatDate(user.fechaIngreso)}</p>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
          ))
        )}
      </div>

      {/* Paginación */}
      {!isLoadingUsers && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredUsers.length} de {totalUsers} usuarios
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {!isLoadingUsers && usersInRole.length === 0 && !searchQuery && (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <UserPlus className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-sm font-medium text-foreground">No hay usuarios asignados</h3>
          <p className="mt-1 text-sm text-muted-foreground">Comienza asignando usuarios a este rol</p>
          <Button className="mt-4 gap-2">
            <UserPlus className="h-4 w-4" />
            Asignar Usuario
          </Button>
        </div>
      )}
    </div>
  )
}
