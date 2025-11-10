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
  ShoppingCart,
  Palette,
  Code,
  UserCheck,
  Wrench,
  Command,
} from "lucide-react"
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
    title: "Organización",
    url: "#",
    icon: Building2,
    items: [
      { title: "Usuarios", url: "/usuarios" },
      { title: "Roles y Permisos", url: "/roles" },
    ],
  },
  {
    title: "Sistema",
    url: "#",
    icon: Settings,
    items: [
      { title: "Configuración", url: "/configuraciones" },
      { title: "Seguridad", url: "/auditoria" },
    ],
  },
]

// Mapeo de íconos y colores por nombre de departamento
const departmentIcons: Record<string, { icon: any; color: string }> = {
  "Ventas": { icon: ShoppingCart, color: "text-green-600" },
  "Marketing": { icon: Sparkles, color: "text-purple-600" },
  "Diseño": { icon: Palette, color: "text-pink-600" },
  "Sistemas": { icon: Code, color: "text-blue-600" },
  "Recursos Humanos": { icon: UserCheck, color: "text-orange-600" },
  "Mantenimiento": { icon: Wrench, color: "text-yellow-600" },
  "Mantenimiento y Taller": { icon: Wrench, color: "text-yellow-600" },
}

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

  // Obtener ícono y color para un departamento
  const getDepartmentStyle = (nombre: string) => {
    return departmentIcons[nombre] || { icon: Building2, color: "text-gray-600" }
  }

  return (
    <>
      <SidebarContainer collapsible="icon" variant="sidebar">
        {/* Header with Logo */}
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Zap className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
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
        <SidebarFooter className="border-t">
          {/* Acciones Rápidas */}
          <div className="px-3 py-2">
            <Button
              variant="outline"
              className="w-full gap-2 justify-start"
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
          </div>

          {/* Departamentos */}
          <div className="px-3 py-2">
            <p className="mb-2 px-2 text-xs font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">
              Departamentos
            </p>
            <TooltipProvider>
              <div className="grid grid-cols-3 gap-2">
                {departamentos.map((dept) => {
                  const { icon: Icon, color } = getDepartmentStyle(dept.nombre)
                  return (
                    <Tooltip key={dept.id}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-12 flex-col gap-1 p-2"
                          onClick={() => handleDepartmentClick(dept.id)}
                        >
                          <Icon className={`h-5 w-5 ${color}`} />
                          <span className="text-[10px] truncate w-full group-data-[collapsible=icon]:hidden">
                            {dept.nombre.split(' ')[0]}
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{dept.nombre}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
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
