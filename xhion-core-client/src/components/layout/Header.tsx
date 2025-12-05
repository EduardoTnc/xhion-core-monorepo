import { Bell, Activity, User, Moon, Sun, LogOut, ChevronsUpDown, Palette, Shield, Globe, Wifi, WifiOff, Server, RefreshCw, CheckCircle2, AlertCircle, XCircle, Zap, Loader2, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useState, useEffect, useMemo } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { AISearchModal } from "@/components/modals/ai-search-modal"
import { MagnusAvatar } from "@/components/ai/magnus-avatar"
import { useTheme } from "@/components/providers/ThemeProvider"
import { useAuthStore } from "../../store/authStore"
import { useAiSearchStore } from "../../store/aiSearchStore"
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
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { useServiceWorker } from "@/hooks/useServiceWorker"
import { useWebSocket } from "@/hooks/useWebSocket"
import { cn } from "@/lib/utils"

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuthStore()
  const { isOnline, isUpdateAvailable, updateServiceWorker } = useServiceWorker()
  const { isConnected, isConnecting } = useWebSocket()

  // AI Search state
  const { isLoading: isAiLoading, backgroundQuery } = useAiSearchStore()

  // Show notification when AI query completes in background
  useEffect(() => {
    if (backgroundQuery?.status === "success" && !isSearchOpen) {
      toast.success("Magnus ha respondido tu consulta", {
        description: "Haz clic en el buscador para ver la respuesta",
        action: {
          label: "Ver",
          onClick: () => setIsSearchOpen(true),
        },
      })
    } else if (backgroundQuery?.status === "error" && !isSearchOpen) {
      toast.error("Error al consultar a Magnus", {
        description: backgroundQuery.error || "Intenta de nuevo",
      })
    }
  }, [backgroundQuery?.status, isSearchOpen])

  const getSystemStatus = useMemo(() => {
    if (!isOnline) return { status: 'error', color: 'text-destructive', bg: 'bg-destructive', label: 'Sin conexión', icon: WifiOff }
    if (!isConnected) return { status: 'warning', color: 'text-amber-500', bg: 'bg-amber-500', label: 'Servidor desconectado', icon: Server }
    if (isUpdateAvailable) return { status: 'info', color: 'text-blue-500', bg: 'bg-blue-500', label: 'Actualización disponible', icon: RefreshCw }
    return { status: 'healthy', color: 'text-green-500', bg: 'bg-green-500', label: 'Sistemas operativos', icon: Activity }
  }, [isOnline, isConnected, isUpdateAvailable])

  const systemStatus = getSystemStatus
  const StatusIcon = systemStatus.icon

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
    if (path.startsWith('/perfil/configuracion')) return 'Configuración de Perfil'
    if (path.startsWith('/sistema/configuracion')) return 'Configuración del Sistema'
    if (path.startsWith('/perfil')) return 'Mi Perfil'
    return 'Xhion Core'
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
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

  // Get AI status indicator
  const getAiStatusIndicator = () => {
    if (isAiLoading || backgroundQuery?.status === "processing") {
      return {
        show: true,
        type: "loading",
        text: "Procesando...",
        icon: <Loader2 className="h-3 w-3 animate-spin" />,
      }
    }
    if (backgroundQuery?.status === "success" && !isSearchOpen) {
      return {
        show: true,
        type: "success",
        text: "Respuesta lista",
        icon: <Sparkles className="h-3 w-3" />,
      }
    }
    if (backgroundQuery?.status === "error") {
      return {
        show: true,
        type: "error",
        text: "Error",
        icon: <AlertCircle className="h-3 w-3" />,
      }
    }
    return { show: false }
  }

  const aiStatus = getAiStatusIndicator()

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
          <div className="relative w-full max-w-2xl group">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 transition-transform duration-300 group-hover:scale-110">
              {isAiLoading || backgroundQuery?.status === "processing" ? (
                <div className="h-6 w-6 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-[#FFBF00] animate-spin" />
                </div>
              ) : backgroundQuery?.status === "success" && !isSearchOpen ? (
                <div className="h-6 w-6 flex items-center justify-center relative">
                  <MagnusAvatar state="speaking" size="sm" className="h-6 w-6" />
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                </div>
              ) : (
                <MagnusAvatar state="idle" size="sm" className="h-6 w-6" />
              )}
            </div>
            <Input
              type="search"
              placeholder={
                isAiLoading || backgroundQuery?.status === "processing"
                  ? "Magnus está pensando..."
                  : backgroundQuery?.status === "success" && !isSearchOpen
                    ? "¡Respuesta lista! Haz clic para ver"
                    : "Preguntar a Magnus..."
              }
              className={cn(
                "w-full cursor-pointer pl-10 pr-12 md:pr-20 text-sm transition-all placeholder:text-[#FFBF00]/70",
                isAiLoading || backgroundQuery?.status === "processing"
                  ? "border-[#FFBF00]/50 bg-[#FFBF00]/10 animate-pulse"
                  : backgroundQuery?.status === "success" && !isSearchOpen
                    ? "border-green-500/50 bg-green-500/10 hover:bg-green-500/15"
                    : "border-[#FFBF00]/30 bg-[#FFBF00]/5 hover:bg-[#FFBF00]/10 hover:border-[#FFBF00]/50 focus-visible:ring-[#FFBF00]/50"
              )}
              onClick={() => setIsSearchOpen(true)}
              readOnly
            />

            {/* Status indicator badge */}
            {aiStatus.show && (
              <div className={cn(
                "absolute right-14 md:right-20 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium",
                aiStatus.type === "loading" && "bg-[#FFBF00]/20 text-[#FFBF00]",
                aiStatus.type === "success" && "bg-green-500/20 text-green-600 dark:text-green-400",
                aiStatus.type === "error" && "bg-red-500/20 text-red-600 dark:text-red-400"
              )}>
                {aiStatus.icon}
                <span className="hidden sm:inline">{aiStatus.text}</span>
              </div>
            )}

            <kbd className="pointer-events-none absolute right-2 md:right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-[#FFBF00]/20 bg-[#FFBF00]/10 px-1.5 font-mono text-[10px] font-medium text-[#FFBF00] opacity-100">
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

          {/* System Status */}
          <HoverCard openDelay={100} closeDelay={200}>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hidden md:flex h-9 w-9">
                <StatusIcon className={cn("h-5 w-5 transition-colors", systemStatus.color)} />
                <span className={cn("absolute right-1.5 top-1.5 h-2 w-2 rounded-full animate-pulse", systemStatus.bg)} />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-0" align="end">
              <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium text-sm">Estado del Sistema</h4>
                </div>
                <p className={cn("text-xs font-medium", systemStatus.color)}>
                  {systemStatus.label}
                </p>
              </div>
              <div className="p-2 grid gap-1">
                {/* Internet Status */}
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-full bg-background border", isOnline ? "border-green-200 text-green-600" : "border-destructive/20 text-destructive")}>
                      {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Internet</span>
                      <span className="text-xs text-muted-foreground">{isOnline ? 'Conectado' : 'Sin conexión'}</span>
                    </div>
                  </div>
                  {isOnline ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-destructive" />}
                </div>

                {/* Server Status */}
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-full bg-background border", isConnected ? "border-green-200 text-green-600" : "border-amber-200 text-amber-600")}>
                      <Server className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Servidor</span>
                      <span className="text-xs text-muted-foreground">
                        {isConnected ? 'Conectado' : isConnecting ? 'Reconectando...' : 'Desconectado'}
                      </span>
                    </div>
                  </div>
                  {isConnected ? (
                    <div className="flex items-center gap-1 text-xs text-green-600 font-mono bg-green-50 dark:bg-green-950/30 px-1.5 py-0.5 rounded">
                      <Zap className="h-3 w-3" />
                      <span>OK</span>
                    </div>
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                </div>

                {/* AI Status */}
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-full bg-background border",
                      isAiLoading ? "border-[#FFBF00]/50 text-[#FFBF00]" : "border-[#FFBF00]/30 text-[#FFBF00]/70"
                    )}>
                      {isAiLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Magnus AI</span>
                      <span className="text-xs text-muted-foreground">
                        {isAiLoading ? 'Procesando consulta...' : backgroundQuery?.status === "success" ? 'Respuesta lista' : 'Disponible'}
                      </span>
                    </div>
                  </div>
                  {isAiLoading ? (
                    <div className="flex items-center gap-1 text-xs text-[#FFBF00] font-mono bg-[#FFBF00]/10 px-1.5 py-0.5 rounded animate-pulse">
                      <span>...</span>
                    </div>
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-[#FFBF00]" />
                  )}
                </div>

                {/* Update Status */}
                {isUpdateAvailable && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-md">
                    <div className="flex items-start gap-3">
                      <RefreshCw className="h-4 w-4 text-blue-600 mt-0.5 animate-spin" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Actualización disponible</p>
                        <p className="text-xs text-blue-600/80 dark:text-blue-400 mb-2">Nueva versión del sistema detectada.</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full h-7 text-xs border-blue-200 hover:bg-blue-100 text-blue-700"
                          onClick={() => updateServiceWorker()}
                        >
                          Actualizar ahora
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </HoverCardContent>
          </HoverCard>

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
                <DropdownMenuItem onClick={() => navigate('/perfil/configuracion?tab=profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/perfil/configuracion?tab=notifications')}>
                  <Bell className="mr-2 h-4 w-4" />
                  Notificaciones
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/perfil/configuracion?tab=security')}>
                  <Shield className="mr-2 h-4 w-4" />
                  Seguridad
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/perfil/configuracion?tab=appearance')}>
                  <Palette className="mr-2 h-4 w-4" />
                  Apariencia
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/perfil/configuracion?tab=data')}>
                  <Globe className="mr-2 h-4 w-4" />
                  Datos y Privacidad
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
