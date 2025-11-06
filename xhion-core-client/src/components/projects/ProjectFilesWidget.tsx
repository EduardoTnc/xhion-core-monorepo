import { useState, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  Grid3x3,
  List,
  ChevronRight,
  File,
  FileImage,
  FileVideo,
  FileArchive,
  FileSpreadsheet,
  FileCode,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"

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

interface ProjectFilesWidgetProps {
  archivos: ProjectFile[]
  isPreview?: boolean
  onExpand?: () => void
  onUpload?: (files: FileList) => void
  onDownload?: (archivo: ProjectFile) => void
  onDelete?: (archivoId: string) => void
  onView?: (archivo: ProjectFile) => void
}

export function ProjectFilesWidget({
  archivos,
  isPreview = false,
  onExpand,
  onUpload,
  onDownload,
  onDelete,
  onView,
}: ProjectFilesWidgetProps) {
  const [showFullView, setShowFullView] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExpand = () => {
    if (isPreview && onExpand) {
      onExpand()
    } else {
      setShowFullView(true)
    }
  }

  // Drag & Drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0 && onUpload) {
      onUpload(files)
      toast.success(`${files.length} archivo(s) subido(s)`)
    }
  }, [onUpload])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0 && onUpload) {
      onUpload(files)
      toast.success(`${files.length} archivo(s) subido(s)`)
    }
  }

  // Organizar archivos por tipo
  const archivosPorTipo = archivos.reduce((acc, archivo) => {
    const extension = archivo.nombre.split('.').pop()?.toLowerCase() || 'otro'
    let categoria = 'Otros'

    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
      categoria = 'Imágenes'
    } else if (['mp4', 'avi', 'mov', 'wmv'].includes(extension)) {
      categoria = 'Videos'
    } else if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) {
      categoria = 'Documentos'
    } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
      categoria = 'Hojas de Cálculo'
    } else if (['zip', 'rar', '7z', 'tar'].includes(extension)) {
      categoria = 'Archivos Comprimidos'
    } else if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json'].includes(extension)) {
      categoria = 'Código'
    }

    if (!acc[categoria]) {
      acc[categoria] = []
    }
    acc[categoria].push(archivo)
    return acc
  }, {} as Record<string, ProjectFile[]>)

  const getFileIcon = (nombre: string) => {
    const extension = nombre.split('.').pop()?.toLowerCase() || ''

    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
      return <FileImage className="h-5 w-5 text-blue-600" />
    } else if (['mp4', 'avi', 'mov', 'wmv'].includes(extension)) {
      return <FileVideo className="h-5 w-5 text-purple-600" />
    } else if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) {
      return <FileText className="h-5 w-5 text-red-600" />
    } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
      return <FileSpreadsheet className="h-5 w-5 text-green-600" />
    } else if (['zip', 'rar', '7z', 'tar'].includes(extension)) {
      return <FileArchive className="h-5 w-5 text-orange-600" />
    } else if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json'].includes(extension)) {
      return <FileCode className="h-5 w-5 text-yellow-600" />
    }
    return <File className="h-5 w-5 text-gray-600" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const renderGridView = (archivosToShow: ProjectFile[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {archivosToShow.map((archivo) => (
        <div
          key={archivo.id}
          className="group relative p-3 rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer"
          onClick={() => onView && onView(archivo)}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            {getFileIcon(archivo.nombre)}
            <div className="w-full">
              <p className="text-xs font-medium line-clamp-2 mb-1">{archivo.nombre}</p>
              <p className="text-[10px] text-muted-foreground">{formatFileSize(archivo.tamano)}</p>
            </div>
          </div>

          {/* Acciones al hover */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            {onDownload && (
              <Button
                variant="secondary"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  onDownload(archivo)
                }}
              >
                <Download className="h-3 w-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(archivo.id)
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  const renderTableView = (archivosToShow: ProjectFile[]) => (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead className="hidden sm:table-cell">Tamaño</TableHead>
            <TableHead className="hidden md:table-cell">Subido por</TableHead>
            <TableHead className="hidden md:table-cell">Fecha</TableHead>
            <TableHead className="w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {archivosToShow.map((archivo) => (
            <TableRow key={archivo.id} className="cursor-pointer" onClick={() => onView && onView(archivo)}>
              <TableCell>{getFileIcon(archivo.nombre)}</TableCell>
              <TableCell className="font-medium">{archivo.nombre}</TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground">
                {formatFileSize(archivo.tamano)}
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {archivo.subidoPor.nombre}
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {format(new Date(archivo.fechaSubida), "dd MMM yyyy", { locale: es })}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation()
                        onView(archivo)
                      }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {onDownload && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDownload(archivo)
                      }}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(archivo.id)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  const renderContent = () => {
    const archivosToShow = isPreview ? archivos.slice(0, 6) : archivos

    return (
      <div className="space-y-4">
        {/* Zona de Drop */}
        {!isPreview && onUpload && (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
              isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
            )}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className={cn("h-10 w-10 mx-auto mb-2", isDragging ? "text-primary" : "text-muted-foreground")} />
            <p className="text-sm font-medium mb-1">
              {isDragging ? "Suelta los archivos aquí" : "Arrastra archivos o haz clic para seleccionar"}
            </p>
            <p className="text-xs text-muted-foreground">
              Soporta cualquier tipo de archivo
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-lg bg-muted/50">
            <div className="flex items-center gap-1.5 mb-1">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] text-muted-foreground">Total</span>
            </div>
            <span className="text-xl font-bold">{archivos.length}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-muted/50">
            <div className="flex items-center gap-1.5 mb-1">
              <Grid3x3 className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-[10px] text-muted-foreground">Tipos</span>
            </div>
            <span className="text-xl font-bold">{Object.keys(archivosPorTipo).length}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-muted/50">
            <div className="flex items-center gap-1.5 mb-1">
              <FileArchive className="h-3.5 w-3.5 text-orange-600" />
              <span className="text-[10px] text-muted-foreground">Tamaño</span>
            </div>
            <span className="text-sm font-bold">
              {formatFileSize(archivos.reduce((sum, a) => sum + a.tamano, 0))}
            </span>
          </div>
        </div>

        {/* Contenido */}
        {archivos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay archivos subidos</p>
            {!isPreview && onUpload && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3"
              >
                <Plus className="h-4 w-4 mr-2" />
                Subir Primer Archivo
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Toggle de vista en modo completo */}
            {!isPreview && (
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Archivos ({archivos.length})</h3>
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "table")}>
                  <TabsList className="h-8">
                    <TabsTrigger value="grid" className="h-6 px-2">
                      <Grid3x3 className="h-3.5 w-3.5" />
                    </TabsTrigger>
                    <TabsTrigger value="table" className="h-6 px-2">
                      <List className="h-3.5 w-3.5" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}

            {/* Vista por tipo en modo completo */}
            {!isPreview && viewMode === "grid" ? (
              <Tabs defaultValue={Object.keys(archivosPorTipo)[0]} className="space-y-3">
                <TabsList className="w-full justify-start overflow-x-auto">
                  {Object.keys(archivosPorTipo).map((tipo) => (
                    <TabsTrigger key={tipo} value={tipo} className="text-xs">
                      {tipo} ({archivosPorTipo[tipo].length})
                    </TabsTrigger>
                  ))}
                </TabsList>
                {Object.entries(archivosPorTipo).map(([tipo, archivosDelTipo]) => (
                  <TabsContent key={tipo} value={tipo} className="mt-0">
                    {renderGridView(archivosDelTipo)}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <>
                {viewMode === "grid" ? renderGridView(archivosToShow) : renderTableView(archivosToShow)}
              </>
            )}
          </div>
        )}

        {/* Ver más en vista previa */}
        {isPreview && archivos.length > 6 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleExpand}
          >
            Ver todos los archivos ({archivos.length})
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    )
  }

  if (isPreview) {
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleExpand}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            Documentos del Proyecto
            <Badge variant="secondary" className="ml-auto">
              {archivos.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {renderContent()}
      
      {/* Dialog para vista completa cuando no es preview */}
      <Dialog open={showFullView} onOpenChange={setShowFullView}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Documentos del Proyecto
            </DialogTitle>
            <DialogDescription>
              Arrastra archivos o haz clic para subirlos. Vista de tabla y grid disponibles.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            {renderContent()}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
