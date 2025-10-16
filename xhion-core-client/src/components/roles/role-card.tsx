import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Save, AlertCircle, Loader2 } from "lucide-react"
import { useRoleStore } from "../../store/roleStore"
import { toast } from "sonner"

// Mapeo de módulos y acciones para la UI
const permissionModules = [
  {
    id: "proyecto",
    name: "Proyectos",
    description: "Gestión de proyectos y etapas",
    actions: ["crear", "leer", "actualizar", "eliminar"],
  },
  {
    id: "tarea",
    name: "Tareas",
    description: "Gestión de tareas y asignaciones",
    actions: ["crear", "leer", "actualizar", "eliminar"],
  },
  {
    id: "usuario",
    name: "Usuarios",
    description: "Gestión de usuarios del sistema",
    actions: ["crear", "leer", "actualizar", "eliminar"],
  },
  {
    id: "rol",
    name: "Roles y Permisos",
    description: "Configuración de roles y permisos",
    actions: ["crear", "leer", "actualizar", "eliminar"],
  },
  {
    id: "auditoria",
    name: "Auditoría",
    description: "Acceso a registros de auditoría",
    actions: ["leer"],
  },
  {
    id: "configuracion",
    name: "Configuración",
    description: "Configuración global del sistema",
    actions: ["actualizar"],
  },
]

const actionLabels: Record<string, string> = {
  crear: "Crear",
  leer: "Leer",
  actualizar: "Editar",
  eliminar: "Eliminar",
}

export function RoleCard() {
  const { selectedRole, permisosActivosSet, updateRolePermissions, isLoading } = useRoleStore()
  const [localPermissions, setLocalPermissions] = useState<Set<string>>(new Set())
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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
  const hasPermission = (moduleId: string, action: string): boolean => {
    const permissionName = `${moduleId}:${action}`
    return localPermissions.has(permissionName)
  }

  // Toggle de un permiso
  const togglePermission = (moduleId: string, action: string) => {
    const permissionName = `${moduleId}:${action}`
    const newPermissions = new Set(localPermissions)
    
    if (newPermissions.has(permissionName)) {
      newPermissions.delete(permissionName)
    } else {
      newPermissions.add(permissionName)
    }
    
    setLocalPermissions(newPermissions)
    setHasChanges(true)
  }

  // Guardar cambios
  const handleSave = async () => {
    if (!selectedRole) return
    
    setIsSaving(true)
    try {
      // Convertir nombres de permisos a IDs
      // Obtener todos los permisos del rol seleccionado para mapear nombres a IDs
      const permisosMap = new Map(
        selectedRole.permisos.map(rp => [rp.permiso?.nombreAccion || '', rp.permisoId])
      )
      
      // Filtrar solo los IDs de permisos que están activos
      const permisosIds = Array.from(localPermissions)
        .map(nombre => permisosMap.get(nombre))
        .filter((id): id is string => id !== undefined)
      
      await updateRolePermissions(selectedRole.id, permisosIds)
      setHasChanges(false)
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

      {/* Permissions matrix */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/30 p-4">
          <h3 className="text-sm font-semibold text-foreground">Matriz de Permisos</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Configura los permisos específicos para cada módulo del sistema
          </p>
        </div>

        <div className="divide-y divide-border">
          {permissionModules.map((module) => (
            <div key={module.id} className="p-4 hover:bg-muted/20 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground">{module.name}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">{module.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  {module.actions.map((action) => (
                    <div key={action} className="flex flex-col items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">{actionLabels[action]}</span>
                      <Checkbox 
                        checked={hasPermission(module.id, action)}
                        onCheckedChange={() => togglePermission(module.id, action)}
                        disabled={isLoading || isSaving}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Permission summary */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Resumen de Permisos</h3>
        <div className="flex flex-wrap gap-2">
          {permissionModules.map((module) => {
            const enabledActions = module.actions.filter((action) => hasPermission(module.id, action))
            if (enabledActions.length === 0) return null

            return (
              <Badge key={module.id} variant="secondary" className="text-xs">
                {module.name}: {enabledActions.map((a) => actionLabels[a]).join(", ")}
              </Badge>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
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
  )
}
