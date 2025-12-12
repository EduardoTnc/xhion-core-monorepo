import { useState, useEffect, useMemo } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Save,
  AlertCircle,
  Loader2,
  Search,
  CheckCircle2,
  Circle,
  Eye,
  Plus,
  Pencil,
  Trash2,
  Shield,
  Settings,
  Info
} from "lucide-react"
import { usePermissions, useUpdateRolePermissions } from "@/hooks/queries"
import { MODULOS_PERMISOS, type PermisoDefinicion } from "@/constants/permissions"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Restricted } from "../auth/Restricted"

// Helper to determine permission style based on action name
const getPermissionStyle = (actionName: string) => {
  const lowerName = actionName.toLowerCase()

  if (lowerName.includes('crear') || lowerName.includes('create') || lowerName.includes('add')) {
    return {
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      hoverColor: "hover:bg-green-500/20",
      icon: Plus
    }
  }

  if (lowerName.includes('ver') || lowerName.includes('leer') || lowerName.includes('read') || lowerName.includes('obtener')) {
    return {
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      hoverColor: "hover:bg-blue-500/20",
      icon: Eye
    }
  }

  if (lowerName.includes('editar') || lowerName.includes('actualizar') || lowerName.includes('update') || lowerName.includes('modificar')) {
    return {
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      hoverColor: "hover:bg-amber-500/20",
      icon: Pencil
    }
  }

  if (lowerName.includes('eliminar') || lowerName.includes('borrar') || lowerName.includes('delete') || lowerName.includes('remove')) {
    return {
      color: "text-red-600",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      hoverColor: "hover:bg-red-500/20",
      icon: Trash2
    }
  }

  return {
    color: "text-slate-600",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/20",
    hoverColor: "hover:bg-slate-500/20",
    icon: Shield
  }
}

import type { RolCompleto } from "@/types"

interface RoleCardProps {
  role: RolCompleto;
}

export function RoleCard({ role }: RoleCardProps) {
  // TanStack Query mutation for updating permissions
  const updatePermissionsMutation = useUpdateRolePermissions()

  // Get all available permissions from the system
  const { data: allPermissions = [] } = usePermissions()

  // Extract active permission names from the role
  const permisosActivosSet = useMemo(() => {
    return new Set(
      role.permisos
        .filter(rp => rp.permiso !== null)
        .map(rp => rp.permiso!.nombreAccion)
    )
  }, [role.permisos])

  const [localPermissions, setLocalPermissions] = useState<Set<string>>(new Set())
  const [hasChanges, setHasChanges] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedModule, setSelectedModule] = useState<string>(MODULOS_PERMISOS[0]?.id || "proyectos")

  // Inicializar permisos locales desde el rol
  useEffect(() => {
    setLocalPermissions(new Set(permisosActivosSet))
    setHasChanges(false)
  }, [permisosActivosSet, role.id])

  // isSaving comes from mutation state
  const isSaving = updatePermissionsMutation.isPending

  // Verificar si un permiso está activo (O(1) lookup)
  const hasPermission = (nombreAccion: string): boolean => {
    return localPermissions.has(nombreAccion)
  }

  // Toggle de un permiso
  const togglePermission = (nombreAccion: string) => {
    const newPermissions = new Set(localPermissions)

    if (newPermissions.has(nombreAccion)) {
      newPermissions.delete(nombreAccion)
    } else {
      newPermissions.add(nombreAccion)
    }

    setLocalPermissions(newPermissions)
    setHasChanges(true)
  }

  // Seleccionar/deseleccionar todos los permisos de un módulo
  const toggleModulePermissions = (moduloId: string) => {
    const modulo = MODULOS_PERMISOS.find(m => m.id === moduloId)
    if (!modulo) return

    const newPermissions = new Set(localPermissions)
    const permisosModulo = modulo.permisos.map(p => p.nombreAccion)
    const todosActivos = permisosModulo.every(p => newPermissions.has(p))

    if (todosActivos) {
      // Deseleccionar todos
      permisosModulo.forEach(p => newPermissions.delete(p))
    } else {
      // Seleccionar todos
      permisosModulo.forEach(p => newPermissions.add(p))
    }

    setLocalPermissions(newPermissions)
    setHasChanges(true)
  }

  // Verificar si todos los permisos de un módulo están activos
  const isModuleFullySelected = (moduloId: string): boolean => {
    const modulo = MODULOS_PERMISOS.find(m => m.id === moduloId)
    if (!modulo) return false
    return modulo.permisos.every(p => localPermissions.has(p.nombreAccion))
  }

  // Filtrar permisos por búsqueda
  const filteredPermisos = (permisos: PermisoDefinicion[]) => {
    if (!searchQuery) return permisos
    return permisos.filter(p =>
      p.nombreAccion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Guardar cambios usando TanStack Query mutation
  const handleSave = async () => {
    // Crear mapa de nombreAccion -> permisoId desde todos los permisos del sistema
    const permisosMap = new Map(
      allPermissions.map(p => [p.nombreAccion, p.id])
    )

    // Convertir nombres de permisos activos a IDs
    const permisosIds = Array.from(localPermissions)
      .map(nombre => permisosMap.get(nombre))
      .filter((id): id is string => id !== undefined)

    try {
      await updatePermissionsMutation.mutateAsync({
        roleId: role.id,
        permisosIds
      })
      setHasChanges(false)
    } catch (error) {
      // Error is handled by the mutation's onError callback
    }
  }

  // Cancelar cambios
  const handleCancel = () => {
    setLocalPermissions(new Set(permisosActivosSet))
    setHasChanges(false)
  }

  // Contar permisos activos
  const permisosActivos = localPermissions.size
  const permisosTotal = MODULOS_PERMISOS.reduce((acc, m) => acc + m.permisos.length, 0)

  return (
    <div className="space-y-2 h-full flex flex-col pb-4">
      {/* Warning for admin role - Compact */}
      {(role.nombre === "Administrador" || role.nombre === "Admin") && (
        <div className="rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 flex items-center gap-2 flex-shrink-0">
          <AlertCircle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Rol de administrador: modificar permisos puede afectar la seguridad del sistema.
          </p>
        </div>
      )}

      {/* Enhanced Stats Bar */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 px-2 sm:px-4 py-1.5 sm:py-2 border rounded-lg bg-gradient-to-r from-card to-card/50 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="p-1 sm:p-1.5 bg-primary/10 rounded-md">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-0.5 sm:gap-1">
            <span className="text-sm sm:text-lg font-bold text-foreground">{permisosActivos}</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">activos</span>
          </div>
        </div>
        <div className="hidden sm:block h-6 w-px bg-border/50" />
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="p-1 sm:p-1.5 bg-muted/50 rounded-md">
            <Settings className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </div>
          <div className="flex items-baseline gap-0.5 sm:gap-1">
            <span className="text-sm sm:text-lg font-bold text-foreground">{permisosTotal}</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">totales</span>
          </div>
        </div>
        <div className="hidden sm:block h-6 w-px bg-border/50" />
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="p-1 sm:p-1.5 bg-green-500/10 rounded-md">
            <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          </div>
          <div className="flex items-baseline gap-0.5 sm:gap-1">
            <span className="text-sm sm:text-lg font-bold text-green-600">{Math.round((permisosActivos / permisosTotal) * 100)}%</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">cobertura</span>
          </div>
        </div>
      </div>

      {/* Search and Content */}
      <div className="flex-1 flex flex-col min-h-0 border rounded-lg bg-card overflow-hidden">
        <div className="p-2 border-b border-border flex items-center gap-3 bg-muted/30">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar permisos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background h-8 text-sm"
            />
          </div>
        </div>

        <Tabs value={selectedModule} onValueChange={setSelectedModule} className="flex-1 flex flex-col min-h-0">
          <div className="border-b border-border bg-muted/10">
            {/* Horizontal scrollable tabs container */}
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              <TabsList className="inline-flex w-max min-w-full bg-transparent p-0 h-auto gap-2 px-3 pt-2 pb-0">
                {MODULOS_PERMISOS.map((modulo) => {
                  const permisosModulo = modulo.permisos.length
                  const permisosActivos = modulo.permisos.filter(p => localPermissions.has(p.nombreAccion)).length
                  const isActive = selectedModule === modulo.id

                  return (
                    <TabsTrigger
                      key={modulo.id}
                      value={modulo.id}
                      className={cn(
                        "relative gap-2 px-4 py-2.5 rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-background data-[state=active]:shadow-none transition-all",
                        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="font-medium">{modulo.nombre}</span>
                      <Badge
                        variant={isActive ? "default" : "secondary"}
                        className={cn(
                          "text-[10px] px-1.5 h-5 min-w-[1.25rem]",
                          isActive ? "bg-primary/10 text-primary hover:bg-primary/20" : ""
                        )}
                      >
                        {permisosActivos}/{permisosModulo}
                      </Badge>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </div>
          </div>

          <div className="flex-1 overflow-hidden bg-background">
            {MODULOS_PERMISOS.map((modulo) => {
              const permisosFiltrados = filteredPermisos(modulo.permisos)
              const todosSeleccionados = isModuleFullySelected(modulo.id)

              return (
                <TabsContent key={modulo.id} value={modulo.id} className="h-full m-0 p-0 data-[state=inactive]:hidden">
                  <div className="flex flex-col h-full">
                    {/* Module Header Actions */}
                    <div className="p-3 border-b border-border flex items-center justify-between bg-muted/5 flex-shrink-0">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{modulo.nombre}</h3>
                        <p className="text-xs text-muted-foreground">{modulo.descripcion}</p>
                      </div>
                      <Button
                        variant={todosSeleccionados ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => toggleModulePermissions(modulo.id)}
                        disabled={isSaving}
                        className="gap-2 h-8"
                      >
                        {todosSeleccionados ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                            <span className="text-primary">Todos seleccionados</span>
                          </>
                        ) : (
                          <>
                            <Circle className="h-3.5 w-3.5" />
                            Seleccionar todos
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Permissions Grid */}
                    <div className="flex-1 overflow-y-auto p-3">
                      {permisosFiltrados.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                          <Search className="h-8 w-8 mb-2 opacity-20" />
                          <p>No se encontraron permisos</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {permisosFiltrados.map((permiso) => {
                            const isSelected = hasPermission(permiso.nombreAccion)
                            const style = getPermissionStyle(permiso.nombreAccion)
                            const Icon = style.icon

                            return (
                              <div
                                key={permiso.nombreAccion}
                                onClick={() => !isSaving && togglePermission(permiso.nombreAccion)}
                                className={cn(
                                  "group relative flex flex-col gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-sm",
                                  isSelected
                                    ? cn("bg-background ring-1 ring-primary/20", style.borderColor)
                                    : "bg-card border-border hover:border-primary/30"
                                )}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className={cn("p-1.5 rounded-lg transition-colors", isSelected ? style.bgColor : "bg-muted")}>
                                      <Icon className={cn("h-4 w-4", isSelected ? style.color : "text-muted-foreground")} />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className={cn("text-sm font-medium truncate", isSelected ? "text-foreground" : "text-muted-foreground")}>
                                        {permiso.nombreAccion}
                                      </span>
                                    </div>
                                  </div>
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => togglePermission(permiso.nombreAccion)}
                                    disabled={isSaving}
                                    className={cn("data-[state=checked]:bg-primary data-[state=checked]:border-primary", isSelected ? "opacity-100" : "opacity-50 group-hover:opacity-100")}
                                  />
                                </div>

                                <div className="flex items-center gap-2">
                                  <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                                    {permiso.descripcion}
                                  </p>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="p-1 hover:bg-muted rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Info className="h-3 w-3 text-muted-foreground" />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="max-w-[250px]">
                                        <p className="text-xs">{permiso.descripcion}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>

                                {/* Active Indicator Strip */}
                                {isSelected && (
                                  <div className={cn("absolute left-0 top-3 bottom-3 w-1 rounded-r-full", style.bgColor.replace('/10', '/50'))} />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              )
            })}
          </div>
        </Tabs>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-border mt-auto flex-shrink-0">
        <div className="text-sm text-muted-foreground">
          {hasChanges && (
            <span className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="font-medium text-amber-600">Cambios sin guardar</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={!hasChanges || isSaving}
            className="hover:bg-muted"
          >
            Cancelar
          </Button>
          <Restricted to="roles.editar">
            <Button
              className="gap-2 min-w-[140px]"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </Restricted>
        </div>
      </div>
    </div>
  )
}
