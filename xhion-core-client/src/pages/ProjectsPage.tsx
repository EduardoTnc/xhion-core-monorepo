import { ProjectWorkspaceEnhanced } from "@/components/projects/ProjectWorkspaceEnhanced"
import { useLocation } from "react-router-dom"

export default function ProjectsPage() {
  const location = useLocation()
  const state = location.state as any
  const proyectoId = state?.proyectoId as string | undefined

  return <ProjectWorkspaceEnhanced proyectoId={proyectoId} />
}