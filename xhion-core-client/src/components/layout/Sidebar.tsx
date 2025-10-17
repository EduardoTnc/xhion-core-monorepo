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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CreateProjectModal } from "@/components/modals/create-project-modal"
import { useSidebar } from "@/components/providers/SidebarProvider"
import { NavLink, useLocation } from "react-router-dom"

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "Departamentos", icon: Building2, href: "/departamentos" },
  { name: "Proyectos", icon: FolderKanban, href: "/proyectos" },
  { name: "Tareas", icon: CheckSquare, href: "/tareas" },
  { name: "Calendario", icon: Calendar, href: "/calendario" },
  { name: "IA Insights", icon: Sparkles, href: "/ai-insights" },
  { name: "Ideas", icon: Lightbulb, href: "/ideas" },
  { name: "Usuarios", icon: UserCog, href: "/usuarios" },
  { name: "Roles y Permisos", icon: Users, href: "/roles" },
  { name: "Seguridad / Auditoría", icon: Shield, href: "/auditoria" },
  { name: "Configuración", icon: Settings, href: "/configuraciones" },
]

export function Sidebar() {
  const location = useLocation()
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useSidebar()

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-sidebar transition-transform duration-300 lg:static lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex h-14 md:h-16 items-center border-b border-sidebar-border px-6">
          <h1 className="text-xl font-bold text-sidebar-foreground">
            Xhion <span className="text-primary">Core</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </NavLink>
            )
          })}
        </nav>

        {/* New Project Button */}
        <div className="border-t border-sidebar-border p-4">
          <Button
            className="w-full gap-2"
            size="lg"
            onClick={() => {
              setIsCreateProjectOpen(true)
              setIsMobileMenuOpen(false)
            }}
          >
            <Plus className="h-4 w-4" />
            Nuevo Proyecto
          </Button>
        </div>
      </aside>

      {/* Create Project Modal */}
      <CreateProjectModal open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen} />
    </>
  )
}
