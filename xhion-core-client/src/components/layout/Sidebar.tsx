import { useState } from "react"
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  Sparkles,
  Lightbulb,
  Shield,
  Settings,
  Plus,
  Users,
  Building2,
  UserCog,
  Zap,
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
import { NavUser } from "./nav-user"

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
      { title: "Departamentos", url: "/departamentos" },
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

export function Sidebar() {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const { setOpenMobile } = useSidebar()

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
          <div className="mt-auto px-3 py-2">
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
          </div>
        </SidebarContent>

        {/* Footer with User Info */}
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
        
        <SidebarRail />
      </SidebarContainer>

      {/* Create Project Modal */}
      <CreateProjectModal open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen} />
    </>
  )
}
