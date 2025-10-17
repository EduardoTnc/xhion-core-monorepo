import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, UserPlus, MoreVertical, Mail, Calendar } from "lucide-react"
import { useState } from "react"
import { useRoleStore } from "../../store/roleStore"
import { InviteUserModal } from "../users/InviteUserModal"

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
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const { 
    todosLosUsuarios,
    selectedRole,
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
        <Button 
          className="gap-2"
          onClick={() => setIsInviteModalOpen(true)}
        >
          <UserPlus className="h-4 w-4" />
          Invitar Usuario
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
    </div>
  )
}
