import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Plus, Shield, Users, Pencil, ArrowLeft } from "lucide-react"
import { RoleCard } from "./role-card"
import { UsersList } from "./users-list"
import { RoleDialog } from "./role-dialog"
// TanStack Query hooks - replacing useRoleStore for data fetching
import { useRolesWithDetails, useCreateRole, useUpdateRole } from "@/hooks/queries"
import type { RolConConteo } from "../../types"
import { cn } from "@/lib/utils"
import { Restricted } from "../auth/Restricted"

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
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)

  // Estado para controlar la vista en móvil (lista vs detalle)
  const [showMobileDetail, setShowMobileDetail] = useState(false)

  // ==================== TanStack Query Hooks ====================
  const { data: rolesCompletos = [], isLoading } = useRolesWithDetails()
  const createRoleMutation = useCreateRole()
  const updateRoleMutation = useUpdateRole()

  // Obtener el rol seleccionado de los datos
  const selectedRole = rolesCompletos.find(r => r.id === selectedRoleId) || null

  // Seleccionar el primer rol cuando se carguen (solo en desktop)
  useEffect(() => {
    if (rolesCompletos.length > 0 && !selectedRoleId && window.innerWidth >= 1024) {
      setSelectedRoleId(rolesCompletos[0].id)
    }
  }, [rolesCompletos, selectedRoleId])

  // Filtrar roles por búsqueda
  const filteredRoles = rolesCompletos.filter(role =>
    role.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calcular total de usuarios
  const totalUsers = rolesCompletos.reduce((sum, role) => sum + (role._count?.usuarios || 0), 0)

  // Manejar selección de rol
  const handleSelectRole = (roleId: string) => {
    setSelectedRoleId(roleId)
    setShowMobileDetail(true)
  }

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

  // Manejar submit del formulario - Using TanStack Query mutations
  const handleSubmitRole = async (data: { nombre: string; descripcion?: string; color?: string }) => {
    if (editingRole) {
      await updateRoleMutation.mutateAsync({ id: editingRole.id, data })
    } else {
      await createRoleMutation.mutateAsync(data)
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="flex h-full flex-col lg:flex-row overflow-hidden bg-background">
      {/* Roles sidebar - Visible en desktop siempre, en móvil solo si no hay detalle activo */}
      <div className={cn(
        "w-full lg:w-80 border-r border-border bg-card flex-col h-full",
        showMobileDetail ? "hidden lg:flex" : "flex"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Roles
              </h2>
              <Restricted to="roles.crear">
                <Button size="sm" className="gap-2 shadow-sm" onClick={handleCreateRole}>
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Nuevo Rol</span>
                  <span className="sm:hidden">Nuevo</span>
                </Button>
              </Restricted>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50"
              />
            </div>
          </div>

          {/* Roles list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoading ? (
              // Skeleton loading
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-3 mb-2 rounded-xl border border-transparent bg-muted/10">
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
              <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                <div className="p-3 rounded-full bg-muted mb-3">
                  <Shield className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No se encontraron roles</p>
                <p className="text-xs text-muted-foreground mt-1">Intenta con otra búsqueda o crea un nuevo rol</p>
              </div>
            ) : (
              filteredRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleSelectRole(role.id)}
                  className={cn(
                    "group w-full rounded-xl p-3 text-left transition-all duration-200 border",
                    selectedRole?.id === role.id
                      ? "bg-primary/5 border-primary/20 shadow-sm"
                      : "bg-card border-transparent hover:bg-muted/50 hover:border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105",
                        applyRoleColor(role.color) || ''
                      )}
                      style={!applyRoleColor(role.color) ? { backgroundColor: role.color } : undefined}
                    >
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-medium text-sm truncate",
                        selectedRole?.id === role.id ? "text-primary" : "text-foreground"
                      )}>
                        {role.nombre}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {role._count?.usuarios || 0} usuarios
                      </div>
                    </div>
                    <div
                      className="h-8 w-8 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background shadow-sm cursor-pointer border border-border"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditRole(role)
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Stats */}
          <div className="border-t border-border p-4 bg-muted/5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
                <p className="text-2xl font-bold text-foreground tracking-tight">{rolesCompletos.length}</p>
                <p className="text-xs text-muted-foreground font-medium">Roles Totales</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
                <p className="text-2xl font-bold text-foreground tracking-tight">{totalUsers}</p>
                <p className="text-xs text-muted-foreground font-medium">Usuarios Asignados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content - Visible en desktop siempre, en móvil solo si hay detalle activo */}
      <div className={cn(
        "flex-1 flex-col overflow-hidden bg-background h-full",
        showMobileDetail ? "flex" : "hidden lg:flex"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-border bg-card/50 backdrop-blur-sm p-4 sticky top-0 z-10">
            {selectedRole ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  {/* Botón Back solo móvil */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden -ml-2"
                    onClick={() => setShowMobileDetail(false)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>

                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-foreground truncate flex items-center gap-2">
                      {selectedRole.nombre}
                      <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {selectedRole._count?.usuarios || 0} usuarios
                      </span>
                    </h1>
                    <p className="text-sm text-muted-foreground truncate">
                      {selectedRole.descripcion || 'Sin descripción'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                  <Button
                    variant={view === "roles" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setView("roles")}
                    className="gap-2 flex-1 sm:flex-none"
                  >
                    <Shield className="h-4 w-4" />
                    Permisos
                  </Button>
                  <Button
                    variant={view === "users" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setView("users")}
                    className="gap-2 flex-1 sm:flex-none"
                  >
                    <Users className="h-4 w-4" />
                    Usuarios
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 h-[88px]">
                <div className="hidden lg:block w-full">
                  <p className="text-muted-foreground">Selecciona un rol para ver detalles</p>
                </div>
                {/* En móvil si no hay rol seleccionado, mostramos placeholder o nada (pero la lógica de showMobileDetail lo maneja) */}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden relative">
            {selectedRole ? (
              <div className="absolute inset-0 p-4 sm:p-6 overflow-y-auto">
                {view === "roles" ? <RoleCard role={selectedRole} /> : <UsersList role={selectedRole} />}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <Shield className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Ningún rol seleccionado</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                  Selecciona un rol de la lista para ver y editar sus permisos y usuarios asignados.
                </p>
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
