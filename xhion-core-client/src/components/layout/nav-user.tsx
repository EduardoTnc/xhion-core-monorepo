import { Plus } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { CreateProjectModal } from "@/components/projects/CreateProjectModal"

export function NavUser() {
  const [showCreateProject, setShowCreateProject] = useState(false)

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <Button
            onClick={() => setShowCreateProject(true)}
            className="w-full gap-2"
            size="lg"
          >
            <Plus className="h-4 w-4" />
            Nuevo Proyecto
          </Button>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Modal de Crear Proyecto */}
      <CreateProjectModal
        open={showCreateProject}
        onOpenChange={setShowCreateProject}
      />
    </>
  )
}
