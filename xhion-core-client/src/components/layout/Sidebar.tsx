import { useState } from "react"
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  Lightbulb,
  Settings,
  Building2,
  Zap,
  Users,
  User,
  Shield,
  Lock,
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { getDepartmentIcon } from "@/lib/department-icons"
import { Button } from "@/components/ui/button"
import {
  Sidebar as SidebarContainer,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { CreateProjectModal } from "@/components/projects/CreateProjectModal"
import { useSystemSettings } from "@/hooks/queries"
import { NavMain, type NavItem } from "./nav-main"
import { useNavigate } from "react-router-dom"
import { useDepartments } from "@/hooks/queries"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const isHexColor = (value?: string | null) => {
  if (!value || typeof value !== "string") return false
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(value.trim())
}

const hexToRgba = (hex: string, alpha = 0.18) => {
  let sanitized = hex.replace("#", "")
  if (sanitized.length === 3) {
    sanitized = sanitized
      .split("")
      .map((char) => char + char)
      .join("")
  }

  const parsed = parseInt(sanitized, 16)
  if (Number.isNaN(parsed)) return `rgba(29, 30, 34, ${alpha})`

  const r = (parsed >> 16) & 255
  const g = (parsed >> 8) & 255
  const b = parsed & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Navegación principal organizada por grupos
const navigationMain: NavItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    // Dashboard siempre visible
  },
  {
    title: "Proyectos",
    url: "/proyectos",
    icon: FolderKanban,
    requiredPermission: "proyectos.ver",
  },
  {
    title: "Tareas",
    url: "/tareas",
    icon: CheckSquare,
    requiredPermission: "tareas.ver",
  },
  {
    title: "Calendario",
    url: "/calendario",
    icon: Calendar,
    // Calendario siempre visible
  },
]

// Herramientas y funcionalidades avanzadas
const navigationTools: NavItem[] = [
  {
    title: "Ideas",
    url: "/ideas",
    icon: Lightbulb,
    requiredPermission: "ideas.ver",
  },
]

// Administración y configuración
const navigationAdmin: NavItem[] = [
  {
    title: "Usuarios",
    url: "/usuarios",
    icon: Users,
    requiredPermission: "usuarios.ver",
  },
  {
    title: "Roles y Permisos",
    url: "/roles",
    icon: Shield,
    requiredPermission: "roles.ver",
  },
  {
    title: "Configuración de Cuenta",
    url: "/perfil/configuracion",
    icon: User,
    // Perfil propio siempre visible
  },
  {
    title: "Config. Sistema",
    url: "/sistema/configuracion",
    icon: Settings,
    requiredPermission: "sistema.configurar",
  },
  {
    title: "Seguridad",
    url: "/auditoria",
    icon: Lock,
    requiredPermission: "auditoria.ver",
  },
]


export function Sidebar() {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const { setOpenMobile } = useSidebar()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  // Check if user has a specific permission
  const hasPermission = (permission: string): boolean => {
    if (!user?.permisos) return false
    return user.permisos.includes(permission)
  }

  // Check if user can view departments
  const canViewDepartments = hasPermission("departamentos.ver")

  // TanStack Query for departments - only fetch if user has permission
  const { data: departamentos = [] } = useDepartments({ enabled: canViewDepartments })

  const { data: settings } = useSystemSettings()

  const nombreEmpresa = settings?.nombreEmpresa || "Negocios Bigander"
  const logoUrl = settings?.logoUrl

  // Helper para construir URL completa de imagen
  const getFullUrl = (url: string | null | undefined): string => {
    if (!url) return ""
    if (url.startsWith('http') || url.startsWith('data:')) return url
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    return `${baseUrl}${url}`
  }

  const handleDepartmentClick = (departamentoId: string) => {
    navigate(`/departamentos/${departamentoId}`)
    setOpenMobile(false)
  }

  return (
    <>
      <SidebarContainer collapsible="icon" variant="sidebar">
        {/* Header with Logo */}
        <SidebarHeader className="group-data-[collapsible=icon]:p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-primary-foreground group-data-[collapsible=icon]:size-10">
                  {logoUrl ? (
                    <img src={getFullUrl(logoUrl)} alt="Logo" className="h-full w-full object-contain rounded-lg" />
                  ) : (
                    <Zap className="size-4 group-data-[collapsible=icon]:size-5" />
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">{nombreEmpresa}</span>
                  <span className="truncate text-xs text-muted-foreground">Enterprise</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* Navigation Menu */}
        <SidebarContent>
          <NavMain items={navigationMain} label="Principal" />
          <NavMain items={navigationTools} label="Herramientas" />
          <NavMain items={navigationAdmin} label="Administración" />

          {/* Quick Action Button */}
          {/* <div className="mt-auto px-3 py-2">
            <Button
              className="w-full gap-2"
              size="sm"
              onClick={() => {
                setIsCreateProjectOpen(true)
                setOpenMobile(false)
              }}
            >
              <Plus className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">Nuevo Proyecto</span>
            </Button>
          </div> */}
        </SidebarContent>

        {/* Footer with Departments & Quick Actions */}
        <SidebarFooter className="border-t group-data-[collapsible=icon]:p-2">

          {/* Departamentos - Solo visible si tiene permiso */}
          {canViewDepartments ? (
          <div className="px-3 py-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-1">
            <div className="flex items-center justify-between mb-2 px-2 group-data-[collapsible=icon]:justify-center">
              <p className="text-xs font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">
                Departamentos
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7"
                      onClick={() => {
                        navigate('/departamentos')
                        setOpenMobile(false)
                      }}
                    >
                      <Building2 className="h-3.5 w-3.5 group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    <p>Ver Todos los Departamentos</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <TooltipProvider>
              <div className="grid grid-cols-3 gap-2 group-data-[collapsible=icon]:grid-cols-1 group-data-[collapsible=icon]:gap-1">
                {departamentos.map((dept) => {
                  const { icon: Icon, color } = getDepartmentIcon(dept.icono)
                  const rawColor = dept.color
                  const hasHexColor = isHexColor(rawColor)
                  const accentHex = hasHexColor ? rawColor! : undefined
                  const haloClass = !hasHexColor && rawColor ? rawColor : !hasHexColor ? "bg-muted/40" : ""
                  const iconFallbackClass = !rawColor ? color : ""
                  const iconTextClass = rawColor && !hasHexColor ? "text-white" : iconFallbackClass
                  return (
                    <Tooltip key={dept.id}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-12 flex-col gap-1 p-0 group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:flex-row group-data-[collapsible=icon]:justify-center"
                          onClick={() => handleDepartmentClick(dept.id)}
                        >
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-lg border group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 ${haloClass}`}
                            style={
                              hasHexColor && accentHex
                                ? {
                                  backgroundColor: hexToRgba(accentHex, 0.18),
                                  borderColor: hexToRgba(accentHex, 0.45),
                                }
                                : undefined
                            }
                          >
                            <Icon
                              className={`h-5 w-5 group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:w-4 ${iconTextClass}`}
                              style={hasHexColor && accentHex ? { color: accentHex } : undefined}
                            />
                          </div>
                          <span className="text-[10px] truncate w-full group-data-[collapsible=icon]:hidden">
                            {dept.nombre.split(' ')[0]}
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-medium">
                        <p>{dept.nombre}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </TooltipProvider>
          </div>
          ) : (
            /* Departamentos deshabilitado si no tiene permiso */
            <div className="px-3 py-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-1 opacity-50">
              <div className="flex items-center justify-between mb-2 px-2 group-data-[collapsible=icon]:justify-center">
                <p className="text-xs font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">
                  Departamentos
                </p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7 cursor-not-allowed"
                        disabled
                      >
                        <Lock className="h-3.5 w-3.5 group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      <p>No tienes permiso para ver departamentos</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}



        </SidebarFooter>

        <SidebarRail />
      </SidebarContainer>

      {/* Create Project Modal */}
      <CreateProjectModal open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen} />
    </>
  )
}
