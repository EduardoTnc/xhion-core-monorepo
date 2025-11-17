import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Paperclip, Download, Eye, Trash2, UserPlus, Upload } from "lucide-react"

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
  miembros: Miembro[]
  archivos: ProjectFile[]
  onAddMiembro?: () => void
  onRemoveMiembro?: (miembroId: string) => void
  onUploadFile?: (files: FileList) => void
  onDownloadFile?: (archivo: ProjectFile) => void
  onDeleteFile?: (archivoId: string) => void
  onViewFile?: (archivo: ProjectFile) => void
}

export function ProjectInfoSection({
  miembros,
  archivos,
  onAddMiembro,
  onRemoveMiembro,
  onUploadFile,
  onDownloadFile,
  onDeleteFile,
  onViewFile,
}: ProjectInfoSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatSize = (size?: number) => {
    if (!size) return "0 KB"
    if (size < 1_000_000) return `${Math.round(size / 1024)} KB`
    return `${(size / 1_048_576).toFixed(1)} MB`
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return
    onUploadFile?.(event.target.files)
    event.target.value = ""
  }

  return (
    <section className="border-b border-border/40 bg-background/95">
      <div className="px-3 sm:px-4 lg:px-6 py-4">
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Equipo */}
          <div className="flex flex-col gap-3 rounded-xl border border-border/50 bg-card/70 p-4 shadow-sm">
            <header className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>Equipo del proyecto</span>
              </div>
              <span className="text-[10px] font-medium">{miembros.length} miembros</span>
            </header>

            <div className="flex flex-col divide-y divide-border/40 rounded-lg border border-border/40 bg-background/60 text-sm max-h-60 overflow-y-auto">
              {miembros.length === 0 && (
                <p className="py-3 text-center text-muted-foreground text-xs">No hay miembros asignados</p>
              )}
              {miembros.map((miembro) => (
                <div key={miembro.usuarioId} className="flex items-center justify-between gap-3 px-3 py-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={miembro.usuario.avatar} />
                      <AvatarFallback className="text-[11px]">
                        {miembro.usuario.nombre
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold leading-tight truncate">
                        {miembro.usuario.nombre}
                      </p>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        {miembro.rol}
                      </p>
                    </div>
                  </div>
                  {onRemoveMiembro && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-[11px] text-destructive hover:text-destructive"
                      onClick={() => onRemoveMiembro(miembro.usuarioId)}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Quitar
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 text-[12px]">
              {onAddMiembro && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[12px]"
                  onClick={onAddMiembro}
                >
                  <UserPlus className="mr-2 h-3.5 w-3.5" />
                  Invitar miembro
                </Button>
              )}
            </div>
          </div>

          {/* Documentos */}
          <div className="flex flex-col gap-3 rounded-xl border border-border/50 bg-card/70 p-4 shadow-sm">
            <header className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              <div className="flex items-center gap-1">
                <Paperclip className="h-3.5 w-3.5" />
                <span>Documentos</span>
              </div>
              <span className="text-[10px] font-medium">{archivos.length} archivos</span>
            </header>

            <div className="flex flex-col divide-y divide-border/40 rounded-lg border border-border/40 bg-background/60 text-sm max-h-60 overflow-y-auto">
              {archivos.length === 0 && (
                <p className="py-3 text-center text-muted-foreground text-xs">No hay documentos anexados</p>
              )}
              {archivos.map((archivo) => (
                <div key={archivo.id} className="flex items-start justify-between gap-3 px-3 py-2">
                  <div className="space-y-1 min-w-0">
                    <p className="text-[13px] font-semibold leading-tight truncate">
                      {archivo.nombre}
                    </p>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      {archivo.tipo} · {formatSize(archivo.tamano)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                    {onViewFile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[11px]"
                        onClick={() => onViewFile(archivo)}
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        Ver
                      </Button>
                    )}
                    {onDownloadFile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[11px]"
                        onClick={() => onDownloadFile(archivo)}
                      >
                        <Download className="mr-1 h-3.5 w-3.5" />
                        Descargar
                      </Button>
                    )}
                    {onDeleteFile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[11px] text-destructive hover:text-destructive"
                        onClick={() => onDeleteFile(archivo.id)}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Borrar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 text-[12px] items-center">
              {onUploadFile && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[12px]"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-3.5 w-3.5" />
                    Subir archivo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
