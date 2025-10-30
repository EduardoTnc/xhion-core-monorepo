import { Search, Bell, Activity, User, Moon, Sun, LogOut, ChevronsUpDown, Palette, Shield, Globe } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { AISearchModal } from "@/components/modals/ai-search-modal"
import { useTheme } from "@/components/providers/ThemeProvider"
import { useAuthStore } from "../../store/authStore"
import { authService } from "../../services/authService"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
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

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuthStore()

  // Obtener nombre de la página actual
  const getPageName = () => {
    const path = location.pathname
    if (path === '/') return 'Dashboard'
    if (path.startsWith('/proyectos')) return 'Proyectos'
    if (path.startsWith('/tareas')) return 'Tareas'
    if (path.startsWith('/calendario')) return 'Calendario'
    if (path.startsWith('/ai-insights')) return 'IA Insights'
    if (path.startsWith('/ideas')) return 'Ideas'
    if (path.startsWith('/departamentos')) return 'Departamentos'
    if (path.startsWith('/usuarios')) return 'Usuarios'
    if (path.startsWith('/roles')) return 'Roles y Permisos'
    if (path.startsWith('/auditoria')) return 'Seguridad'
    if (path.startsWith('/configuraciones')) return 'Configuración'
    if (path.startsWith('/perfil')) return 'Mi Perfil'
    return 'Xhion Core'
  }

  const handleLogout = async () => {
    try {
      // Llamar al servicio de logout (opcional, limpia la sesión en el servidor)
      await authService.logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      // Limpiar el estado local
      logout()
      setShowLogoutDialog(false)
      toast.success('Sesión cerrada exitosamente')
      navigate('/login', { replace: true })
    }
  }

  // Obtener iniciales del usuario
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-border bg-card/95 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{getPageName()}</span>
          </div>
        </div>

        {/* AI Search Bar */}
        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar o preguntar a la IA…"
              className="w-full cursor-pointer bg-secondary/50 pl-10 pr-12 md:pr-20 text-sm"
              onClick={() => setIsSearchOpen(true)}
              readOnly
            />
            <kbd className="pointer-events-none absolute right-2 md:right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 md:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* System Status - Hidden on mobile */}
          <Button variant="ghost" size="icon" className="relative hidden md:flex h-9 w-9">
            <Activity className="h-5 w-5 text-primary" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-[10px]">3</Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Nueva tarea asignada</p>
                  <p className="text-xs text-muted-foreground">Hace 5 minutos</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Reunión en 30 minutos</p>
                  <p className="text-xs text-muted-foreground">Hace 10 minutos</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Proyecto actualizado</p>
                  <p className="text-xs text-muted-foreground">Hace 1 hora</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu - Estilo shadcn template */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-auto gap-2 rounded-full px-2 hover:bg-accent">
                <Avatar className="h-7 w-7 rounded-lg">
                  <AvatarImage src={user?.avatarUrl || undefined} alt={user?.nombreCompleto} />
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs">
                    {user ? getUserInitials(user.nombreCompleto) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-xs">{user?.nombreCompleto}</span>
                  <span className="truncate text-[10px] text-muted-foreground">
                    {user?.rol || 'Usuario'}
                  </span>
                </div>
                <ChevronsUpDown className="hidden md:block ml-auto size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px] rounded-lg">
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.avatarUrl || undefined} alt={user?.nombreCompleto} />
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                      {user ? getUserInitials(user.nombreCompleto) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.nombreCompleto}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate('/configuraciones?tab=profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/configuraciones?tab=notifications')}>
                  <Bell className="mr-2 h-4 w-4" />
                  Notificaciones
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/configuraciones?tab=security')}>
                  <Shield className="mr-2 h-4 w-4" />
                  Seguridad
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/configuraciones?tab=appearance')}>
                  <Palette className="mr-2 h-4 w-4" />
                  Apariencia
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/configuraciones?tab=system')}>
                  <Globe className="mr-2 h-4 w-4" />
                  Sistema
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowLogoutDialog(true)} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* AI Search Modal */}
      <AISearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de cerrar tu sesión. Deberás iniciar sesión nuevamente para acceder al sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cerrar sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
