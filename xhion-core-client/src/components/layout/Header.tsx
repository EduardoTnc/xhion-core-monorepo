import { Search, Bell, Activity, User, Moon, Sun, Menu, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AISearchModal } from "@/components/modals/ai-search-modal"
import { useTheme } from "@/components/providers/ThemeProvider"
import { useSidebar } from "@/components/providers/SidebarProvider"
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
} from "@/components/ui/dropdown-menu"

export function Header() {
  const navigate = useNavigate()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { toggleMobileMenu } = useSidebar()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      // Llamar al servicio de logout (opcional, limpia la sesión en el servidor)
      await authService.logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      // Limpiar el estado local
      logout()
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
      <header className="sticky top-0 z-50 flex h-14 md:h-16 items-center gap-2 md:gap-4 border-b border-border bg-card/50 px-4 md:px-6 backdrop-blur-sm">
        <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="lg:hidden h-9 w-9 shrink-0">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

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

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl || undefined} alt={user?.nombreCompleto} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user ? getUserInitials(user.nombreCompleto) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.nombreCompleto}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.rol || 'Usuario'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/perfil')}>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/configuraciones')}>
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* AI Search Modal */}
      <AISearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  )
}
