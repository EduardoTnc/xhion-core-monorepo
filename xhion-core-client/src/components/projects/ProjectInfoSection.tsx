import { useState } from "react"
import { ProjectStagesWidget } from "./ProjectStagesWidget"
import { ProjectTeamWidget } from "./ProjectTeamWidget"
import { ProjectFilesWidget } from "./ProjectFilesWidget"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Etapa {
  id: string
  nombre: string
  descripcion?: string
  orden: number
  fechaInicio?: string
  fechaFin?: string
  presupuestoAsignado?: number
  presupuestoGastado?: number
  completada?: boolean
  color?: string
}

interface Miembro {
  usuarioId: string
  usuario: {
    id: string
    nombre: string
    email: string
    avatar?: string
  }
  rol: "responsable" | "miembro" | "observador"
}

interface ProjectFile {
  id: string
  nombre: string
  tipo: string
  tamano: number
  url: string
  fechaSubida: string
  subidoPor: {
    id: string
    nombre: string
  }
}

interface ProjectInfoSectionProps {
  etapas: Etapa[]
  miembros: Miembro[]
  archivos: ProjectFile[]
  onCreateEtapa?: () => void
  onEditEtapa?: (etapa: Etapa) => void
  onDeleteEtapa?: (etapaId: string) => void
  onAddMiembro?: () => void
  onRemoveMiembro?: (miembroId: string) => void
  onUploadFile?: (files: FileList) => void
  onDownloadFile?: (archivo: ProjectFile) => void
  onDeleteFile?: (archivoId: string) => void
  onViewFile?: (archivo: ProjectFile) => void
}

type ActiveSection = "preview" | "stages" | "team" | "files"

export function ProjectInfoSection({
  etapas,
  miembros,
  archivos,
  onCreateEtapa,
  onEditEtapa,
  onDeleteEtapa,
  onAddMiembro,
  onRemoveMiembro,
  onUploadFile,
  onDownloadFile,
  onDeleteFile,
  onViewFile,
}: ProjectInfoSectionProps) {
  const [activeSection, setActiveSection] = useState<ActiveSection>("preview")

  return (
    <div className="border-b bg-card">
      <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        {/* Vista Previa - Muestra los 3 widgets */}
        {activeSection === "preview" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            <ProjectStagesWidget
              etapas={etapas}
              isPreview
              onExpand={() => setActiveSection("stages")}
            />
            <ProjectTeamWidget
              miembros={miembros}
              isPreview
              onExpand={() => setActiveSection("team")}
            />
            <ProjectFilesWidget
              archivos={archivos}
              isPreview
              onExpand={() => setActiveSection("files")}
            />
          </div>
        )}

        {/* Vista Completa - Etapas */}
        {activeSection === "stages" && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-semibold">Etapas del Proyecto</h2>
              <button
                onClick={() => setActiveSection("preview")}
                className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                ← Volver a vista general
              </button>
            </div>
            <ScrollArea className="h-[300px] sm:h-[400px] pr-2 sm:pr-4">
              <ProjectStagesWidget
                etapas={etapas}
                isPreview={false}
                onCreateEtapa={onCreateEtapa}
                onEditEtapa={onEditEtapa}
                onDeleteEtapa={onDeleteEtapa}
              />
            </ScrollArea>
          </div>
        )}

        {/* Vista Completa - Equipo */}
        {activeSection === "team" && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-semibold">Equipo del Proyecto</h2>
              <button
                onClick={() => setActiveSection("preview")}
                className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                ← Volver a vista general
              </button>
            </div>
            <ScrollArea className="h-[300px] sm:h-[400px] pr-2 sm:pr-4">
              <ProjectTeamWidget
                miembros={miembros}
                isPreview={false}
                onAddMiembro={onAddMiembro}
                onRemoveMiembro={onRemoveMiembro}
              />
            </ScrollArea>
          </div>
        )}

        {/* Vista Completa - Archivos */}
        {activeSection === "files" && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-semibold">Documentos del Proyecto</h2>
              <button
                onClick={() => setActiveSection("preview")}
                className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                ← Volver a vista general
              </button>
            </div>
            <ScrollArea className="h-[350px] sm:h-[450px] lg:h-[500px] pr-2 sm:pr-4">
              <ProjectFilesWidget
                archivos={archivos}
                isPreview={false}
                onUpload={onUploadFile}
                onDownload={onDownloadFile}
                onDelete={onDeleteFile}
                onView={onViewFile}
              />
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  )
}
