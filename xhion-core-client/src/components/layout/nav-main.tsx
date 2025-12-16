import { ChevronRight, Lock, type LucideIcon } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuthStore } from "@/store/authStore"

export interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  /** Permission required to access this item (e.g., 'departamentos.ver') */
  requiredPermission?: string
  items?: {
    title: string
    url: string
    requiredPermission?: string
  }[]
}

export function NavMain({
  items,
  label = "Navegación",
}: {
  items: NavItem[]
  label?: string
}) {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  
  // Check if user has a specific permission
  const hasPermission = (permission?: string): boolean => {
    if (!permission) return true // No permission required
    if (!user?.permisos) return false
    return user.permisos.includes(permission)
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = location.pathname === item.url || 
                          item.items?.some(sub => location.pathname === sub.url)
          const isAllowed = hasPermission(item.requiredPermission)
          
          // Si el item tiene subitems, usar Collapsible
          if (item.items && item.items.length > 0) {
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => {
                        const isSubActive = location.pathname === subItem.url
                        const isSubAllowed = hasPermission(subItem.requiredPermission)
                        
                        if (!isSubAllowed) {
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2 px-2 py-1.5 text-sm opacity-50 cursor-not-allowed">
                                      <Lock className="h-3 w-3" />
                                      <span>{subItem.title}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="right">
                                    <p>No tienes permiso para acceder</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </SidebarMenuSubItem>
                          )
                        }
                        
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild isActive={isSubActive}>
                              <NavLink to={subItem.url}>
                                <span>{subItem.title}</span>
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          }

          // Si no tiene permiso, mostrar item deshabilitado
          if (!isAllowed) {
            return (
              <SidebarMenuItem key={item.title}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton 
                        className="opacity-50 cursor-not-allowed pointer-events-auto"
                        tooltip={item.title}
                      >
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>No tienes permiso para acceder</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </SidebarMenuItem>
            )
          }

          // Si no tiene subitems y tiene permiso, mostrar item simple
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                <NavLink to={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
