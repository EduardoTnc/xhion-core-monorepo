import { useState, useMemo, useCallback, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search, UserPlus, MoreVertical, Shield, Eye, Ban, CheckCircle2, Trash2,
  Users, UserCheck, UserX, TrendingUp, Mail, Clock,
  RefreshCw, SlidersHorizontal, X, Briefcase, Calendar, Hash,
  FileText, FolderKanban, ListTodo, Loader2, ExternalLink, Building,
  Star, Languages, Laptop, Globe, Wifi,
  ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from "lucide-react"
import { useUserPresence } from "@/hooks/useUserPresence"
// TanStack Query hooks - replacing useRoleStore for data fetching
import { useUsers, useUserProfile, useRolesWithDetails, useUpdateUserStatus, useDeleteUser } from "@/hooks/queries"
import { InviteUserModal } from "../users/InviteUserModal"
import { ChangeUserRoleModal } from "./change-user-role-modal"
import { InvitationsStatsModal } from "./InvitationsStatsModal"
import { UserDetailModalBento } from "./user-detail-modal-bento"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Restricted } from "../auth/Restricted"
import { PageHeader, type PageHeaderTab } from "@/components/layout/PageHeader"
import { cn } from "@/lib/utils"

// Función para formatear fechas
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatDateLong = (dateString: string | null | undefined): string => {
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

// Función para calcular antigüedad correctamente con fallback
const getTimeSince = (primaryDate: string | null | undefined, fallbackDate?: string | null | undefined): string => {
  const dateString = primaryDate || fallbackDate
  if (!dateString) return 'Nuevo'
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const years = Math.floor(diffDays / 365)
  const months = Math.floor((diffDays % 365) / 30)

  if (years > 0 && months > 0) return `${years}a ${months}m`
  if (years > 0) return `${years} año${years > 1 ? 's' : ''}`
  if (months > 0) return `${months} mes${months > 1 ? 'es' : ''}`
  if (diffDays > 0) return `${diffDays}d`
  return 'Hoy'
}

// Labels para perfil profesional
const EXPERIENCE_LABELS: Record<string, string> = {
  '0-1': '< 1 año',
  '1-3': '1-3 años',
  '3-5': '3-5 años',
  '5-10': '5-10 años',
  '10+': '10+ años',
}

const LEVEL_LABELS: Record<string, string> = {
  'junior': 'Junior',
  'mid': 'Mid-Level',
  'senior': 'Senior',
  'lead': 'Lead/Principal',
  'executive': 'Ejecutivo',
}

const WORK_MODE_LABELS: Record<string, string> = {
  'remote': 'Remoto',
  'onsite': 'Presencial',
  'hybrid': 'Híbrido',
}

export function UsersView() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<string>("active")
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [userToToggle, setUserToToggle] = useState<{ id: string; currentStatus: string } | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Pagination State
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  // Sorting State
  type SortColumn = 'nombre' | 'rol' | 'puesto' | 'antiguedad' | 'estado'
  const [sortColumn, setSortColumn] = useState<SortColumn>('nombre')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Handle sort column click
  const handleSort = useCallback((column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
    setPage(1)
  }, [sortColumn])

  // ==================== TanStack Query Hooks ====================
  // Replace useRoleStore with TanStack Query hooks
  const { data: todosLosUsuarios = [], isLoading: isLoadingUsers, refetch: refetchUsers } = useUsers()
  const { data: rolesCompletos = [], isLoading: isLoadingRoles } = useRolesWithDetails()
  const { data: fullProfile, isLoading: isLoadingProfile } = useUserProfile(selectedUserId)

  // Mutations
  const updateStatusMutation = useUpdateUserStatus()
  const deleteUserMutation = useDeleteUser()

  // Combined loading state
  const isLoading = isLoadingUsers || isLoadingRoles

  // Check if should show invitations tab from navigation state
  useEffect(() => {
    if (location.state?.showInvitations) {
      setActiveTab("invited")
    }
  }, [location.state])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [searchQuery, roleFilter, statusFilter])

  // Filtrar y ordenar usuarios
  const filteredUsers = useMemo(() => {
    const filtered = todosLosUsuarios.filter(user => {
      const matchesSearch =
        user.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = roleFilter === "all" || user.rolId === roleFilter
      const matchesStatus = statusFilter === "all" || user.estado === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })

    // Sort the filtered results
    return filtered.sort((a, b) => {
      let comparison = 0
      switch (sortColumn) {
        case 'nombre':
          comparison = a.nombreCompleto.localeCompare(b.nombreCompleto, 'es')
          break
        case 'rol':
          const rolA = rolesCompletos.find(r => r.id === a.rolId)?.nombre || ''
          const rolB = rolesCompletos.find(r => r.id === b.rolId)?.nombre || ''
          comparison = rolA.localeCompare(rolB, 'es')
          break
        case 'puesto':
          comparison = (a.puestoTrabajo?.titulo || '').localeCompare(b.puestoTrabajo?.titulo || '', 'es')
          break
        case 'antiguedad':
          const dateA = new Date(a.fechaIngreso || a.fechaCreacion || 0).getTime()
          const dateB = new Date(b.fechaIngreso || b.fechaCreacion || 0).getTime()
          comparison = dateA - dateB
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [todosLosUsuarios, searchQuery, roleFilter, statusFilter, sortColumn, sortDirection, rolesCompletos])

  // Estadísticas
  const totalUsers = todosLosUsuarios.length
  const activeUsers = todosLosUsuarios.filter(u => u.estado === "ACTIVO").length
  const inactiveUsers = todosLosUsuarios.filter(u => u.estado === "INACTIVO").length

  // Real-time presence tracking for all filtered users (needed for sorting by status)
  const filteredUserIds = useMemo(() => filteredUsers.map(u => u.id), [filteredUsers])
  const { isUserOnline, presenceMap } = useUserPresence({ userIds: filteredUserIds })

  // Sort users including by presence status
  const sortedUsers = useMemo(() => {
    if (sortColumn !== 'estado') {
      return filteredUsers // Already sorted in filteredUsers useMemo
    }

    // Sort by presence status (online first or last)
    return [...filteredUsers].sort((a, b) => {
      const aOnline = presenceMap.get(a.id) ? 1 : 0
      const bOnline = presenceMap.get(b.id) ? 1 : 0
      const comparison = bOnline - aOnline // Online users first by default
      return sortDirection === 'asc' ? -comparison : comparison
    })
  }, [filteredUsers, sortColumn, sortDirection, presenceMap])

  // Paginated users (from sorted results)
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * limit
    return sortedUsers.slice(start, start + limit)
  }, [sortedUsers, page, limit])

  // Calculate total pages
  const totalPages = Math.ceil(sortedUsers.length / limit) || 1

  // Check if any filter is active
  const hasActiveFilters = roleFilter !== "all" || statusFilter !== "all"

  // Clear all filters
  const clearFilters = () => {
    setRoleFilter("all")
    setStatusFilter("all")
    setSearchQuery("")
  }

  // Handle user selection
  const handleSelectUser = useCallback((userId: string) => {
    if (selectedUserId === userId) {
      setSelectedUserId(null)
    } else {
      setSelectedUserId(userId)
    }
  }, [selectedUserId])

  // Close detail panel
  const handleCloseDetail = () => {
    setSelectedUserId(null)
    // fullProfile is now managed by TanStack Query, no need to reset
  }

  // Build tabs array
  const headerTabs: PageHeaderTab[] = useMemo(() => [
    { id: "active", label: "Usuarios Activos", icon: UserCheck, badge: activeUsers },
    { id: "invited", label: "Invitaciones", icon: Mail },
  ], [activeUsers])

  // Manejar cambiar rol
  const handleChangeRole = (userId: string) => {
    setSelectedUserId(userId)
    setIsChangeRoleModalOpen(true)
  }

  // Manejar activar/desactivar usuario
  const handleToggleUserStatus = async () => {
    if (!userToToggle) return
    try {
      const newStatus = userToToggle.currentStatus === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
      await updateStatusMutation.mutateAsync({ userId: userToToggle.id, status: newStatus })
      setUserToToggle(null)
    } catch (error: any) {
      // Error handled by mutation's onError
    }
  }

  // Manejar eliminar usuario
  const handleDeleteUser = async () => {
    if (!userToDelete) return
    try {
      await deleteUserMutation.mutateAsync(userToDelete)
      if (selectedUserId === userToDelete) {
        setSelectedUserId(null)
      }
      setUserToDelete(null)
    } catch (error: any) {
      // Error handled by mutation's onError
    }
  }

  // User row component with context menu
  const UserRow = ({ user }: { user: typeof todosLosUsuarios[0] }) => {
    const userRole = rolesCompletos.find(r => r.id === user.rolId)
    const isSelected = selectedUserId === user.id

    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            onClick={() => handleSelectUser(user.id)}
            className={cn(
              "group cursor-pointer rounded-lg border bg-card p-3 transition-all",
              isSelected
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-primary/50 hover:bg-accent/30"
            )}
          >
            {/* Mobile Layout */}
            <div className="md:hidden flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatarUrl || undefined} alt={user.nombreCompleto} />
                <AvatarFallback className="text-sm">{getInitials(user.nombreCompleto)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{user.nombreCompleto}</span>
                  <div className={cn(
                    "h-2 w-2 rounded-full flex-shrink-0",
                    user.estado === "ACTIVO" ? "bg-green-500" : "bg-red-500"
                  )} />
                </div>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:grid grid-cols-12 gap-4 items-center">
              {/* Usuario */}
              <div className="col-span-4 flex items-center gap-3 min-w-0">
                <Avatar className="h-9 w-9 flex-shrink-0">
                  <AvatarImage src={user.avatarUrl || undefined} alt={user.nombreCompleto} />
                  <AvatarFallback className="text-xs">{getInitials(user.nombreCompleto)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{user.nombreCompleto}</span>
                    <div className={cn(
                      "h-2 w-2 rounded-full flex-shrink-0",
                      user.estado === "ACTIVO" ? "bg-green-500" : "bg-red-500"
                    )} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>

              {/* Rol */}
              <div className="col-span-2">
                {userRole && (
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{
                      borderColor: userRole.color || undefined,
                      color: userRole.color || undefined,
                      backgroundColor: userRole.color ? `${userRole.color}15` : undefined
                    }}
                  >
                    {userRole.nombre}
                  </Badge>
                )}
              </div>

              {/* Puesto */}
              <div className="col-span-2">
                <span className="text-xs text-muted-foreground truncate block">
                  {user.puestoTrabajo?.titulo || '-'}
                </span>
              </div>

              {/* Antigüedad */}
              <div className="col-span-2">
                <span className="text-xs text-muted-foreground">
                  {getTimeSince(user.fechaIngreso, user.fechaCreacion)}
                </span>
              </div>

              {/* Acciones */}
              <div className="col-span-2 flex justify-end gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleSelectUser(user.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalles
                    </DropdownMenuItem>
                    <Restricted to="usuarios.gestionar_roles">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        handleChangeRole(user.id)
                      }}>
                        <Shield className="mr-2 h-4 w-4" />
                        Cambiar Rol
                      </DropdownMenuItem>
                    </Restricted>
                    <Restricted to="usuarios.editar">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        setUserToToggle({ id: user.id, currentStatus: user.estado })
                      }}>
                        {user.estado === 'ACTIVO' ? (
                          <>
                            <Ban className="mr-2 h-4 w-4" />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Activar
                          </>
                        )}
                      </DropdownMenuItem>
                    </Restricted>
                    <DropdownMenuSeparator />
                    <Restricted to="usuarios.eliminar">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          setUserToDelete(user.id)
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </Restricted>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem onClick={() => handleSelectUser(user.id)}>
            <Eye className="mr-2 h-4 w-4" />
            Ver Detalles
          </ContextMenuItem>
          <Restricted to="usuarios.gestionar_roles">
            <ContextMenuItem onClick={() => handleChangeRole(user.id)}>
              <Shield className="mr-2 h-4 w-4" />
              Cambiar Rol
            </ContextMenuItem>
          </Restricted>
          <Restricted to="usuarios.editar">
            <ContextMenuItem onClick={() => setUserToToggle({ id: user.id, currentStatus: user.estado })}>
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
            </ContextMenuItem>
          </Restricted>
          <ContextMenuSeparator />
          <Restricted to="usuarios.eliminar">
            <ContextMenuItem
              onClick={() => setUserToDelete(user.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar Usuario
            </ContextMenuItem>
          </Restricted>
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header with integrated tabs */}
      <PageHeader
        icon={Users}
        title="Gestión de Usuarios"
        subtitle="Administra todos los usuarios del sistema"
        tabs={headerTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setIsStatsModalOpen(true)}
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Estadísticas</span>
            </Button>
            <Restricted to="usuarios.crear">
              <Button
                size="sm"
                className="gap-2"
                onClick={() => setIsInviteModalOpen(true)}
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Invitar Usuario</span>
                <span className="sm:hidden">Invitar</span>
              </Button>
            </Restricted>
          </div>
        }
      />

      {/* Content */}
      {activeTab === "active" && (
        <>
          {/* Stats Bar - Compact inline */}
          <div className="border-b border-border bg-card/50 px-4 md:px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Compact Stats */}
              <div className="flex items-center gap-4 md:gap-6">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{totalUsers}</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">total</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">{activeUsers}</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">activos</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserX className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">{inactiveUsers}</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">inactivos</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 hidden sm:flex"
                  onClick={() => refetchUsers()}
                  disabled={isLoading}
                >
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                  Actualizar
                </Button>
                <Button
                  variant={showFilters ? "secondary" : "outline"}
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Filtros</span>
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                      {(roleFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>

            {/* Filters Row - Collapsible */}
            {showFilters && (
              <div className="mt-3 pt-3 border-t border-border flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] h-9">
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[160px] h-9">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ACTIVO">Activos</SelectItem>
                    <SelectItem value="INACTIVO">Inactivos</SelectItem>
                  </SelectContent>
                </Select>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" className="gap-2 h-9" onClick={clearFilters}>
                    <X className="h-4 w-4" />
                    Limpiar
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Split Panel Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel - Users Table */}
            <div className={cn(
              "flex-1 flex flex-col overflow-hidden transition-all",
              selectedUserId ? "hidden md:flex md:w-2/5 lg:w-1/2" : ""
            )}>
              {/* Users Table - same style as Auditoría */}
              <div className="flex-1 overflow-auto">
                {isLoading ? (
                  <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : paginatedUsers.length === 0 ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="bg-muted/50 p-4 rounded-full inline-flex">
                        <Users className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground font-medium">
                        {searchQuery || hasActiveFilters ? "No se encontraron usuarios" : "No hay usuarios"}
                      </p>
                      <p className="text-xs text-muted-foreground/60">
                        {searchQuery || hasActiveFilters
                          ? "Intenta ajustar los filtros de búsqueda"
                          : "Comienza invitando usuarios al sistema"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden m-4">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent">
                          <TableHead
                            className="w-[280px] cursor-pointer select-none hover:bg-muted/50 transition-colors"
                            onClick={() => handleSort('nombre')}
                          >
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Usuario
                              {sortColumn === 'nombre' ? (
                                sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />
                              ) : (
                                <ArrowUpDown className="h-3 w-3 ml-1 opacity-30" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead
                            className="w-[140px] cursor-pointer select-none hover:bg-muted/50 transition-colors"
                            onClick={() => handleSort('rol')}
                          >
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Rol
                              {sortColumn === 'rol' ? (
                                sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />
                              ) : (
                                <ArrowUpDown className="h-3 w-3 ml-1 opacity-30" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead
                            className="hidden md:table-cell w-[160px] cursor-pointer select-none hover:bg-muted/50 transition-colors"
                            onClick={() => handleSort('puesto')}
                          >
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4" />
                              Puesto
                              {sortColumn === 'puesto' ? (
                                sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />
                              ) : (
                                <ArrowUpDown className="h-3 w-3 ml-1 opacity-30" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead
                            className="hidden lg:table-cell w-[120px] cursor-pointer select-none hover:bg-muted/50 transition-colors"
                            onClick={() => handleSort('antiguedad')}
                          >
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Antigüedad
                              {sortColumn === 'antiguedad' ? (
                                sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />
                              ) : (
                                <ArrowUpDown className="h-3 w-3 ml-1 opacity-30" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead
                            className="hidden xl:table-cell w-[130px] cursor-pointer select-none hover:bg-muted/50 transition-colors"
                            onClick={() => handleSort('estado')}
                          >
                            <div className="flex items-center gap-2">
                              <Wifi className="h-4 w-4" />
                              Estado
                              {sortColumn === 'estado' ? (
                                sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />
                              ) : (
                                <ArrowUpDown className="h-3 w-3 ml-1 opacity-30" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead className="w-[80px] text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedUsers.map((user) => {
                          const userRole = rolesCompletos.find(r => r.id === user.rolId)
                          const isSelected = selectedUserId === user.id

                          return (
                            <TableRow
                              key={user.id}
                              className={cn(
                                "cursor-pointer group",
                                isSelected ? "bg-primary/5" : "hover:bg-muted/30"
                              )}
                              onClick={() => handleSelectUser(user.id)}
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8 border border-border transition-transform group-hover:scale-105">
                                    <AvatarImage src={user.avatarUrl || undefined} alt={user.nombreCompleto} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                      {getInitials(user.nombreCompleto)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                                        {user.nombreCompleto}
                                      </span>
                                      <div className={cn(
                                        "h-2 w-2 rounded-full flex-shrink-0",
                                        user.estado === "ACTIVO" ? "bg-green-500" : "bg-red-500"
                                      )} />
                                    </div>
                                    <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                                      {user.email}
                                    </span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {userRole && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs transition-colors"
                                    style={{
                                      borderColor: userRole.color || undefined,
                                      color: userRole.color || undefined,
                                      backgroundColor: userRole.color ? `${userRole.color}15` : undefined
                                    }}
                                  >
                                    {userRole.nombre}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <span className="text-sm text-muted-foreground truncate block max-w-[140px]">
                                  {user.puestoTrabajo?.titulo || '-'}
                                </span>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <code className="rounded bg-muted/50 px-2 py-1 text-xs font-mono text-muted-foreground border border-border/50">
                                  {getTimeSince(user.fechaIngreso, user.fechaCreacion)}
                                </code>
                              </TableCell>
                              <TableCell className="hidden xl:table-cell">
                                {isUserOnline(user.id) ? (
                                  <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-xs gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    En línea
                                  </Badge>
                                ) : (
                                  <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/30 text-xs gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                    Desconectado
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleSelectUser(user.id)}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      Ver Detalles
                                    </DropdownMenuItem>
                                    <Restricted to="usuarios.gestionar_roles">
                                      <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation()
                                        handleChangeRole(user.id)
                                      }}>
                                        <Shield className="mr-2 h-4 w-4" />
                                        Cambiar Rol
                                      </DropdownMenuItem>
                                    </Restricted>
                                    <Restricted to="usuarios.editar">
                                      <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation()
                                        setUserToToggle({ id: user.id, currentStatus: user.estado })
                                      }}>
                                        {user.estado === 'ACTIVO' ? (
                                          <>
                                            <Ban className="mr-2 h-4 w-4" />
                                            Desactivar
                                          </>
                                        ) : (
                                          <>
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Activar
                                          </>
                                        )}
                                      </DropdownMenuItem>
                                    </Restricted>
                                    <DropdownMenuSeparator />
                                    <Restricted to="usuarios.eliminar">
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setUserToDelete(user.id)
                                        }}
                                        className="text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Eliminar
                                      </DropdownMenuItem>
                                    </Restricted>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Enhanced Pagination Footer */}
              {!isLoading && filteredUsers.length > 0 && (
                <div className="border-t border-border p-4 bg-card flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Left side: Record info and page size selector */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      Mostrando {((page - 1) * limit) + 1}-{Math.min(page * limit, filteredUsers.length)} de {filteredUsers.length} usuarios
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">Mostrar:</span>
                      <Select
                        value={limit.toString()}
                        onValueChange={(v) => {
                          setLimit(Number(v))
                          setPage(1)
                        }}
                      >
                        <SelectTrigger className="w-[70px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Right side: Pagination controls */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPage(1)}
                      disabled={page <= 1 || isLoading}
                      title="Primera página"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1 || isLoading}
                      title="Página anterior"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="px-3 text-sm font-medium">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= totalPages || isLoading}
                      title="Página siguiente"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPage(totalPages)}
                      disabled={page >= totalPages || isLoading}
                      title="Última página"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </>
      )}

      {/* Tab: Usuarios Invitados */}
      {activeTab === "invited" && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center max-w-md">
                <Mail className="mx-auto h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">Usuarios Invitados</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Aquí aparecerán los usuarios que han sido invitados pero aún no han aceptado la invitación.
                </p>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div className="text-left flex-1">
                      <p className="text-sm font-medium">Pendientes de aceptación</p>
                      <p className="text-xs text-muted-foreground">Invitaciones enviadas esperando respuesta</p>
                    </div>
                    <Badge variant="secondary">0</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div className="text-left flex-1">
                      <p className="text-sm font-medium">Invitaciones enviadas</p>
                      <p className="text-xs text-muted-foreground">Total de invitaciones en el sistema</p>
                    </div>
                    <Badge variant="secondary">0</Badge>
                  </div>
                </div>
                <Restricted to="usuarios.crear">
                  <Button className="mt-6 gap-2" onClick={() => setIsInviteModalOpen(true)}>
                    <UserPlus className="h-4 w-4" />
                    Enviar Nueva Invitación
                  </Button>
                </Restricted>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Modales */}
      <InviteUserModal open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen} />
      <InvitationsStatsModal open={isStatsModalOpen} onOpenChange={setIsStatsModalOpen} />

      {/* User Detail Modal Bento - Single View Dashboard */}
      <UserDetailModalBento
        userId={selectedUserId}
        open={!!selectedUserId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUserId(null)
          }
        }}
      />

      {selectedUserId && (
        <ChangeUserRoleModal
          userId={selectedUserId}
          open={isChangeRoleModalOpen}
          onOpenChange={setIsChangeRoleModalOpen}
        />
      )}

      {/* Alert Dialogs */}
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
            <AlertDialogCancel disabled={updateStatusMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleUserStatus} disabled={updateStatusMutation.isPending}>
              {updateStatusMutation.isPending ? 'Procesando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El usuario será eliminado permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUserMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteUserMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Helper component for info rows


function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    </div>
  )
}
