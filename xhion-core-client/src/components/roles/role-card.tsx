import { useState, useEffect } from "react"
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
import { useRoleStore } from "../../store/roleStore"
import { toast } from "sonner"
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

export function RoleCard() {
  const { selectedRole, permisosActivosSet, updateRolePermissions, isLoading, todosLosPermisos } = useRoleStore()
  const [localPermissions, setLocalPermissions] = useState<Set<string>>(new Set())
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedModule, setSelectedModule] = useState<string>(MODULOS_PERMISOS[0]?.id || "proyectos")

  // Inicializar permisos locales desde el Set optimizado del store
  useEffect(() => {
    setLocalPermissions(new Set(permisosActivosSet))
    setHasChanges(false)
  }, [permisosActivosSet, selectedRole])

  if (!selectedRole) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Selecciona un rol para ver sus permisos</p>
      </div>
    )
  }

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

  // Guardar cambios
  const handleSave = async () => {
    if (!selectedRole) return

    setIsSaving(true)
    try {
      // Crear mapa de nombreAccion -> permisoId desde todos los permisos del sistema
      const permisosMap = new Map(
        todosLosPermisos.map(p => [p.nombreAccion, p.id])
      )

      // Convertir nombres de permisos activos a IDs
      const permisosIds = Array.from(localPermissions)
        .map(nombre => permisosMap.get(nombre))
        .filter((id): id is string => id !== undefined)

      await updateRolePermissions(selectedRole.id, permisosIds)
      setHasChanges(false)
      toast.success(`Permisos actualizados: ${permisosIds.length} permisos asignados`)
    } catch (error) {
      // El error ya se maneja en el store con toast
    } finally {
      setIsSaving(false)
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
    <div className="space-y-4 sm:space-y-6 h-full flex flex-col">
      {/* Warning for admin role */}
      {(selectedRole.nombre === "Administrador" || selectedRole.nombre === "Admin") && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 flex-shrink-0">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground mb-1">Rol de Administrador</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Este rol tiene control total del sistema. Modificar sus permisos puede afectar la seguridad y
                funcionalidad de la plataforma.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 flex-shrink-0">
        <div className="rounded-lg border border-border bg-card p-2 sm:p-4 flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-1 sm:gap-4 text-center sm:text-left">
          <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg shrink-0">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-lg sm:text-2xl font-bold text-foreground leading-none sm:leading-tight">{permisosActivos}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate w-full">Activos</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-2 sm:p-4 flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-1 sm:gap-4 text-center sm:text-left">
          <div className="p-1.5 sm:p-2 bg-muted rounded-lg shrink-0">
            <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-lg sm:text-2xl font-bold text-foreground leading-none sm:leading-tight">{permisosTotal}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate w-full">Totales</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-2 sm:p-4 flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-1 sm:gap-4 text-center sm:text-left">
          <div className="p-1.5 sm:p-2 bg-green-500/10 rounded-lg shrink-0">
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          </div>
          <div className="min-w-0">
            <p className="text-lg sm:text-2xl font-bold text-foreground leading-none sm:leading-tight">
              {Math.round((permisosActivos / permisosTotal) * 100)}%
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate w-full">Cobertura</p>
          </div>
        </div>
      </div>

      {/* Search and Content */}
      <div className="flex-1 flex flex-col min-h-0 border rounded-lg bg-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4 bg-muted/30">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar permisos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
        </div>

        <Tabs value={selectedModule} onValueChange={setSelectedModule} className="flex-1 flex flex-col min-h-0">
          <div className="px-4 pt-4 border-b border-border bg-muted/10">
            <ScrollArea className="w-full whitespace-nowrap pb-0">
              <TabsList className="inline-flex w-max min-w-full bg-transparent p-0 h-auto gap-2 mb-0">
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
            </ScrollArea>
          </div>

          <div className="flex-1 overflow-hidden bg-background">
            {MODULOS_PERMISOS.map((modulo) => {
              const permisosFiltrados = filteredPermisos(modulo.permisos)
              const todosSeleccionados = isModuleFullySelected(modulo.id)

              return (
                <TabsContent key={modulo.id} value={modulo.id} className="h-full m-0 p-0 data-[state=inactive]:hidden">
                  <div className="flex flex-col h-full">
                    {/* Module Header Actions */}
                    <div className="p-4 border-b border-border flex items-center justify-between bg-muted/5 flex-shrink-0">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{modulo.nombre}</h3>
                        <p className="text-xs text-muted-foreground">{modulo.descripcion}</p>
                      </div>
                      <Button
                        variant={todosSeleccionados ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => toggleModulePermissions(modulo.id)}
                        disabled={isLoading || isSaving}
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
                    <div className="flex-1 overflow-y-auto p-4">
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
                                onClick={() => !isLoading && !isSaving && togglePermission(permiso.nombreAccion)}
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
                                    disabled={isLoading || isSaving}
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
