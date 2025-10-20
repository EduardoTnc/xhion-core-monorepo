import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Plus, Shield, Users, Pencil } from "lucide-react"
import { RoleCard } from "./role-card"
import { UsersList } from "./users-list"
import { RoleDialog } from "./role-dialog"
import { useRoleStore } from "../../store/roleStore"
import type { RolConConteo } from "../../types"

// Función para aplicar color dinámico (clase Tailwind o hex)
const applyRoleColor = (color: string) => {
  // Si es una clase de Tailwind (empieza con bg-), retornarla directamente
  if (color.startsWith('bg-')) {
    return color;
  }
  // Si es un código hex, retornar null para usar style inline
  return null;
};

export function RolesView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [view, setView] = useState<"roles" | "users">("roles")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<RolConConteo | null>(null)
  
  // Conectar con el store
  const { 
    rolesCompletos, 
    selectedRole, 
    isLoading, 
    fetchInitialData, 
    selectRole,
    createRole,
    updateRole,
  } = useRoleStore()

  // Cargar todos los datos al montar el componente (Eager Loading)
  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  // Seleccionar el primer rol cuando se carguen
  useEffect(() => {
    if (rolesCompletos.length > 0 && !selectedRole) {
      selectRole(rolesCompletos[0].id)
    }
  }, [rolesCompletos, selectedRole, selectRole])

  // Filtrar roles por búsqueda
  const filteredRoles = rolesCompletos.filter(role =>
    role.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calcular total de usuarios
  const totalUsers = rolesCompletos.reduce((sum, role) => sum + (role._count?.usuarios || 0), 0)

  // Manejar creación de rol
  const handleCreateRole = () => {
    setEditingRole(null)
    setIsDialogOpen(true)
  }

  // Manejar edición de rol
  const handleEditRole = (role: RolConConteo) => {
    setEditingRole(role)
    setIsDialogOpen(true)
  }

  // Manejar submit del formulario
  const handleSubmitRole = async (data: { nombre: string; descripcion?: string; color?: string }) => {
    if (editingRole) {
      await updateRole(editingRole.id, data)
    } else {
      await createRole(data)
    }
  }

  return (
    <div className="flex h-full">
      {/* Roles sidebar */}
      <div className="w-80 border-r border-border bg-card">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Roles</h2>
              <Button size="sm" className="gap-2" onClick={handleCreateRole}>
                <Plus className="h-4 w-4" />
                Nuevo
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Roles list */}
          <div className="flex-1 overflow-y-auto p-2">
            {isLoading ? (
              // Skeleton loading
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-3 mb-2">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              ))
            ) : filteredRoles.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No se encontraron roles
              </div>
            ) : (
              filteredRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => selectRole(role.id)}
                  className={`group w-full rounded-lg p-3 text-left transition-colors ${
                    selectedRole?.id === role.id
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        applyRoleColor(role.color) || ''
                      }`}
                      style={!applyRoleColor(role.color) ? { backgroundColor: role.color } : undefined}
                    >
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{role.nombre}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {role._count?.usuarios || 0} usuarios
                      </div>
                    </div>
                    <div
                      className="h-8 w-8 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditRole(role)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Stats */}
          <div className="border-t border-border p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-2xl font-semibold text-foreground mt-1">{rolesCompletos.length}</p>
                <p className="text-xs text-muted-foreground">Total Roles</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-2xl font-semibold text-foreground">{totalUsers}</p>
                <p className="text-xs text-muted-foreground">Total usuarios</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-border bg-card p-6">
            {selectedRole ? (
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">{selectedRole.nombre}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedRole.descripcion || 'Sin descripción'}
                  </p>
                </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={view === "roles" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("roles")}
                  className="gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Permisos
                </Button>
                <Button
                  variant={view === "users" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("users")}
                  className="gap-2"
                >
                  <Users className="h-4 w-4" />
                  Usuarios
                </Button>
                </div>
              </div>
            ) : (
              <Skeleton className="h-20 w-full" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedRole ? (
              view === "roles" ? <RoleCard /> : <UsersList />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Selecciona un rol para ver sus detalles</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog para crear/editar roles */}
      <RoleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        role={editingRole}
        onSubmit={handleSubmitRole}
      />
    </div>
  )
}
