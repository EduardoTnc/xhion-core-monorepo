"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  FileText,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Download,
  Search,
  Filter,
  Target,
  Lightbulb,
  BookOpen,
  FileCheck,
  StickyNote,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useConocimientoStore } from "@/store/conocimientoStore"
import { TipoDocumentoProyecto } from "@/services/conocimientoService"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const documentoSchema = z.object({
  tipo: z.nativeEnum(TipoDocumentoProyecto),
  titulo: z.string().min(1, "El título es requerido").max(255),
  contenido: z.string().min(1, "El contenido es requerido"),
})

type DocumentoFormData = z.infer<typeof documentoSchema>

interface ProjectDocumentsManagerProps {
  proyectoId: string
  proyectoNombre: string
}

const tipoIcons = {
  [TipoDocumentoProyecto.Resumen]: FileText,
  [TipoDocumentoProyecto.Objetivos]: Target,
  [TipoDocumentoProyecto.Especificaciones]: FileCheck,
  [TipoDocumentoProyecto.LeccionesAprendidas]: Lightbulb,
  [TipoDocumentoProyecto.Documentacion]: BookOpen,
  [TipoDocumentoProyecto.Notas]: StickyNote,
}

const tipoColors = {
  [TipoDocumentoProyecto.Resumen]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  [TipoDocumentoProyecto.Objetivos]:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  [TipoDocumentoProyecto.Especificaciones]:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  [TipoDocumentoProyecto.LeccionesAprendidas]:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  [TipoDocumentoProyecto.Documentacion]:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  [TipoDocumentoProyecto.Notas]: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
}

const tipoLabels = {
  [TipoDocumentoProyecto.Resumen]: "Resumen",
  [TipoDocumentoProyecto.Objetivos]: "Objetivos",
  [TipoDocumentoProyecto.Especificaciones]: "Especificaciones",
  [TipoDocumentoProyecto.LeccionesAprendidas]: "Lecciones Aprendidas",
  [TipoDocumentoProyecto.Documentacion]: "Documentación",
  [TipoDocumentoProyecto.Notas]: "Notas",
}

export function ProjectDocumentsManager({
  proyectoId,
  proyectoNombre,
}: ProjectDocumentsManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedDocumento, setSelectedDocumento] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterTipo, setFilterTipo] = useState<string>("all")

  const {
    documentosProyecto,
    isLoading,
    fetchDocumentosProyecto,
    createDocumentoProyecto,
    updateDocumentoProyecto,
    deleteDocumentoProyecto,
  } = useConocimientoStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<DocumentoFormData>({
    resolver: zodResolver(documentoSchema),
    defaultValues: {
      tipo: TipoDocumentoProyecto.Notas,
      titulo: "",
      contenido: "",
    },
  })

  const selectedTipo = watch("tipo")

  useEffect(() => {
    fetchDocumentosProyecto(proyectoId)
  }, [proyectoId])

  useEffect(() => {
    if (selectedDocumento && showEditModal) {
      reset({
        tipo: selectedDocumento.tipo,
        titulo: selectedDocumento.titulo,
        contenido: selectedDocumento.contenido,
      })
    } else if (showCreateModal) {
      reset({
        tipo: TipoDocumentoProyecto.Notas,
        titulo: "",
        contenido: "",
      })
    }
  }, [selectedDocumento, showEditModal, showCreateModal, reset])

  const onSubmitCreate = async (data: DocumentoFormData) => {
    try {
      await createDocumentoProyecto({
        ...data,
        proyectoId,
      })
      setShowCreateModal(false)
      reset()
    } catch (error) {
      console.error("Error al crear documento:", error)
    }
  }

  const onSubmitEdit = async (data: DocumentoFormData) => {
    if (!selectedDocumento) return
    try {
      await updateDocumentoProyecto(selectedDocumento.id, data)
      setShowEditModal(false)
      setSelectedDocumento(null)
      reset()
    } catch (error) {
      console.error("Error al actualizar documento:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este documento?")) return
    try {
      await deleteDocumentoProyecto(id)
    } catch (error) {
      console.error("Error al eliminar documento:", error)
    }
  }

  const handleEdit = (documento: any) => {
    setSelectedDocumento(documento)
    setShowEditModal(true)
  }

  // Filtrar documentos
  const documentos = documentosProyecto.get(proyectoId) || []
  const filteredDocumentos = documentos.filter((doc) => {
    const matchesSearch =
      doc.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.contenido.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTipo = filterTipo === "all" || doc.tipo === filterTipo
    return matchesSearch && matchesTipo
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Documentos del Proyecto</h2>
          <p className="text-sm text-muted-foreground mt-1">{proyectoNombre}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Documento
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {Object.entries(tipoLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Documents Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Cargando documentos...</div>
      ) : filteredDocumentos.length === 0 ? (
        <Card className="border-border bg-card p-12">
          <div className="text-center space-y-3">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">
              {searchQuery || filterTipo !== "all"
                ? "No se encontraron documentos con los filtros aplicados"
                : "No hay documentos en este proyecto"}
            </p>
            {!searchQuery && filterTipo === "all" && (
              <Button onClick={() => setShowCreateModal(true)} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Crear primer documento
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocumentos.map((documento) => {
            const TipoIcon = tipoIcons[documento.tipo]
            return (
              <Card key={documento.id} className="border-border bg-card p-6 hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <Badge className={tipoColors[documento.tipo]}>
                      <TipoIcon className="h-3 w-3 mr-1" />
                      {tipoLabels[documento.tipo]}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(documento)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(documento.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{documento.titulo}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {documento.contenido}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>
                      {format(new Date(documento.fechaCreacion), "dd MMM yyyy", { locale: es })}
                    </span>
                    <span>{documento.creadoPor?.nombreCompleto || "Sistema"}</span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Documento</DialogTitle>
            <DialogDescription>
              Agrega documentación importante para el proyecto
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitCreate)} className="space-y-4 mt-4">
            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="tipo">
                Tipo de Documento <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedTipo}
                onValueChange={(value) => setValue("tipo", value as TipoDocumentoProyecto)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tipoLabels).map(([key, label]) => {
                    const Icon = tipoIcons[key as TipoDocumentoProyecto]
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="titulo">
                Título <span className="text-destructive">*</span>
              </Label>
              <Input id="titulo" placeholder="Título del documento" {...register("titulo")} />
              {errors.titulo && (
                <p className="text-sm text-destructive">{errors.titulo.message}</p>
              )}
            </div>

            {/* Contenido */}
            <div className="space-y-2">
              <Label htmlFor="contenido">
                Contenido <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="contenido"
                placeholder="Escribe el contenido del documento..."
                rows={10}
                {...register("contenido")}
              />
              {errors.contenido && (
                <p className="text-sm text-destructive">{errors.contenido.message}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Crear Documento</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Documento</DialogTitle>
            <DialogDescription>Actualiza la información del documento</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4 mt-4">
            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="tipo-edit">
                Tipo de Documento <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedTipo}
                onValueChange={(value) => setValue("tipo", value as TipoDocumentoProyecto)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tipoLabels).map(([key, label]) => {
                    const Icon = tipoIcons[key as TipoDocumentoProyecto]
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="titulo-edit">
                Título <span className="text-destructive">*</span>
              </Label>
              <Input
                id="titulo-edit"
                placeholder="Título del documento"
                {...register("titulo")}
              />
              {errors.titulo && (
                <p className="text-sm text-destructive">{errors.titulo.message}</p>
              )}
            </div>

            {/* Contenido */}
            <div className="space-y-2">
              <Label htmlFor="contenido-edit">
                Contenido <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="contenido-edit"
                placeholder="Escribe el contenido del documento..."
                rows={10}
                {...register("contenido")}
              />
              {errors.contenido && (
                <p className="text-sm text-destructive">{errors.contenido.message}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">Actualizar Documento</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
