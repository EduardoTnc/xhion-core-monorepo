import { SystemSettingsView } from "@/components/settings/system-settings-view"
import { useAuthStore } from "@/store/authStore"
import { Navigate } from "react-router-dom"
import { ShieldAlert } from "lucide-react"

export default function SystemSettingsPage() {
    const { user } = useAuthStore()

    // Verificar permiso sistema.configurar_empresa
    const hasPermission = user?.permisos?.includes("sistema.configurar_empresa") ||
        user?.permisos?.includes("sistema.configurar") ||
        user?.rol === "Administrador"

    if (!hasPermission) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                    <ShieldAlert className="h-8 w-8 text-destructive" />
                </div>
                <h1 className="text-2xl font-semibold text-foreground">Acceso Denegado</h1>
                <p className="text-center text-muted-foreground max-w-md">
                    No tienes permisos para acceder a la configuración del sistema.
                    Contacta con un administrador si necesitas acceso.
                </p>
            </div>
        )
    }

    return <SystemSettingsView />
}
