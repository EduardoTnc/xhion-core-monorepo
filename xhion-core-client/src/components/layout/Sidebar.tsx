import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  Sparkles,
  Lightbulb,
  Settings,
  Plus,
  Building2,
  Zap,
  Wallet,
  Command,
  Users,
  Shield,
  Lock,
} from "lucide-react"
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
import { CreateProjectModal } from "@/components/modals/create-project-modal"
import { NavMain, type NavItem } from "./nav-main"
import { AISearchModal } from "@/components/modals/ai-search-modal"
import { useNavigate } from "react-router-dom"
import { useDepartmentStore } from "@/store/departmentStore"
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
  },
  {
    title: "Proyectos",
    url: "/proyectos",
    icon: FolderKanban,
  },
  {
    title: "Tareas",
    url: "/tareas",
    icon: CheckSquare,
  },
  {
    title: "Calendario",
    url: "/calendario",
    icon: Calendar,
  },
  {
    title: "Finanzas",
    url: "/finanzas",
    icon: Wallet,
  },
]

// Herramientas y funcionalidades avanzadas
const navigationTools: NavItem[] = [
  {
    title: "IA Insights",
    url: "/ai-insights",
    icon: Sparkles,
  },
  {
    title: "Ideas",
    url: "/ideas",
    icon: Lightbulb,
  },
]

// Administración y configuración
const navigationAdmin: NavItem[] = [
  {
    title: "Usuarios",
    url: "/usuarios",
    icon: Users,
  },
  {
    title: "Roles y Permisos",
    url: "/roles",
    icon: Shield,
  },
  {
    title: "Configuración",
    url: "/configuraciones",
    icon: Settings,
  },
  {
    title: "Seguridad",
    url: "/auditoria",
    icon: Lock,
  },
]


export function Sidebar() {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [isAISearchOpen, setIsAISearchOpen] = useState(false)
  const { setOpenMobile } = useSidebar()
  const navigate = useNavigate()
  const { departamentos, fetchDepartamentos } = useDepartmentStore()

  // Cargar departamentos al montar el componente
  useEffect(() => {
    fetchDepartamentos()
  }, [])

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
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground group-data-[collapsible=icon]:size-10">
                  <Zap className="size-4 group-data-[collapsible=icon]:size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">Xhion Core</span>
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

          {/* Departamentos */}
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

          {/* Acciones Rápidas */}
          <div className="px-3 py-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full gap-2 justify-start group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
                    size="sm"
                    onClick={() => {
                      setIsAISearchOpen(true)
                      setOpenMobile(false)
                    }}
                  >
                    <Command className="h-4 w-4" />
                    <span className="group-data-[collapsible=icon]:hidden">Acciones Rápidas</span>
                    <kbd className="ml-auto hidden h-5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:inline-block group-data-[collapsible=icon]:hidden">
                      ⌘K
                    </kbd>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  <div className="flex flex-col gap-1">
                    <p>Acciones Rápidas</p>
                    <kbd className="text-[10px] text-muted-foreground">⌘K</kbd>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

        </SidebarFooter>

        <SidebarRail />
      </SidebarContainer>

      {/* Create Project Modal */}
      <CreateProjectModal open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen} />

      {/* AI Search Modal */}
      <AISearchModal open={isAISearchOpen} onOpenChange={setIsAISearchOpen} />
    </>
  )
}
