import { UserCog } from "lucide-react"

/**
 * Página de gestión de usuarios (placeholder)
 * TODO: Implementar vista completa de usuarios con tabla, filtros, etc.
 */
export default function UsuariosPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <UserCog className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Vista de Usuarios
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          Esta página mostrará una vista completa de todos los usuarios del sistema.
          <br />
          Por ahora, puedes gestionar usuarios desde la sección de <strong>Roles y Permisos</strong>.
        </p>
      </div>
    </div>
  )
}
