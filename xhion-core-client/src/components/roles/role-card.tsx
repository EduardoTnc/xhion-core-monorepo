import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Save, AlertCircle, Loader2, Search, CheckCircle2, Circle } from "lucide-react"
import { useRoleStore } from "../../store/roleStore"
import { toast } from "sonner"
import { MODULOS_PERMISOS, CATEGORIAS_PERMISOS, type PermisoDefinicion } from "@/constants/permissions"
import { cn } from "@/lib/utils"

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

  // Verificar si algunos permisos del módulo están activos
  const isModulePartiallySelected = (moduloId: string): boolean => {
    const modulo = MODULOS_PERMISOS.find(m => m.id === moduloId)
    if (!modulo) return false
    const algunoActivo = modulo.permisos.some(p => localPermissions.has(p.nombreAccion))
    const todosActivos = modulo.permisos.every(p => localPermissions.has(p.nombreAccion))
    return algunoActivo && !todosActivos
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
    <div className="space-y-6">
      {/* Warning for admin role */}
      {(selectedRole.nombre === "Administrador" || selectedRole.nombre === "Admin") && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
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

      {/* Estadísticas de permisos */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-2xl font-bold text-foreground">{permisosActivos}</p>
          <p className="text-xs text-muted-foreground mt-1">Permisos activos</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-2xl font-bold text-foreground">{permisosTotal}</p>
          <p className="text-xs text-muted-foreground mt-1">Total disponibles</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-2xl font-bold text-foreground">
            {Math.round((permisosActivos / permisosTotal) * 100)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">Cobertura</p>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar permisos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs por módulo - Scroll Horizontal Mejorado */}
      <Tabs value={selectedModule} onValueChange={setSelectedModule} className="space-y-4">
        <div className="relative">
          {/* Contenedor con scroll horizontal nativo */}
          <div className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent pb-2">
            <TabsList className="inline-flex w-max min-w-full">
              {MODULOS_PERMISOS.map((modulo) => {
                const permisosModulo = modulo.permisos.length
                const permisosActivos = modulo.permisos.filter(p => localPermissions.has(p.nombreAccion)).length
                
                return (
                  <TabsTrigger 
                    key={modulo.id} 
                    value={modulo.id}
                    className="relative gap-1.5 flex-shrink-0 text-xs sm:text-sm whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">{modulo.nombre}</span>
                    <span className="sm:hidden">{modulo.nombre.slice(0, 4)}</span>
                    <Badge variant="secondary" className="text-[10px] sm:text-xs px-1 sm:px-2">
                      {permisosActivos}/{permisosModulo}
                    </Badge>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>
        </div>

        {MODULOS_PERMISOS.map((modulo) => {
          const permisosFiltrados = filteredPermisos(modulo.permisos)
          const todosSeleccionados = isModuleFullySelected(modulo.id)
          const algunosSeleccionados = isModulePartiallySelected(modulo.id)

          return (
            <TabsContent key={modulo.id} value={modulo.id} className="space-y-4">
              {/* Header del módulo */}
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">{modulo.nombre}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{modulo.descripcion}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleModulePermissions(modulo.id)}
                    disabled={isLoading || isSaving}
                    className="gap-2"
                  >
                    {todosSeleccionados ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Deseleccionar todos
                      </>
                    ) : (
                      <>
                        <Circle className="h-4 w-4" />
                        Seleccionar todos
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Lista de permisos */}
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <ScrollArea className="h-[400px]">
                  <div className="divide-y divide-border">
                    {permisosFiltrados.length === 0 ? (
                      <div className="p-8 text-center text-sm text-muted-foreground">
                        No se encontraron permisos que coincidan con la búsqueda
                      </div>
                    ) : (
                      permisosFiltrados.map((permiso) => (
                        <div
                          key={permiso.nombreAccion}
                          className="p-4 hover:bg-muted/20 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <Checkbox
                              checked={hasPermission(permiso.nombreAccion)}
                              onCheckedChange={() => togglePermission(permiso.nombreAccion)}
                              disabled={isLoading || isSaving}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium text-foreground">
                                  {permiso.nombreAccion}
                                </p>
                                {permiso.categoria && (
                                  <Badge variant="outline" className="text-xs">
                                    {permiso.categoria}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {permiso.descripcion}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          )
        })}
      </Tabs>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          {hasChanges && (
            <span className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Tienes cambios sin guardar
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={!hasChanges || isSaving}
          >
            Cancelar
          </Button>
          <Button 
            className="gap-2"
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
        </div>
      </div>
    </div>
  )
}
