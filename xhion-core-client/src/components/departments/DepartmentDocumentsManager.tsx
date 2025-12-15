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
import {
  useDocumentosDepartamento,
  useCreateDocumentoDepartamento,
  useUpdateDocumentoDepartamento,
  useDeleteDocumentoDepartamento,
} from "@/hooks/queries"
import { TipoDocumentoDepartamento } from "@/services/conocimientoService"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const documentoSchema = z.object({
  tipo: z.enum([
    TipoDocumentoDepartamento.Resumen,
    TipoDocumentoDepartamento.Objetivos,
    TipoDocumentoDepartamento.Especificaciones,
    TipoDocumentoDepartamento.LeccionesAprendidas,
    TipoDocumentoDepartamento.Documentacion,
    TipoDocumentoDepartamento.Notas,
  ] as const),
  titulo: z.string().min(1, "El título es requerido").max(255),
  contenido: z.string().min(1, "El contenido es requerido"),
})

type DocumentoFormData = z.infer<typeof documentoSchema>

interface DepartmentDocumentsManagerProps {
  departamentoId: string
  departamentoNombre: string
  variant?: "default" | "condensed"
}

const tipoIcons = {
  [TipoDocumentoDepartamento.Resumen]: FileText,
  [TipoDocumentoDepartamento.Objetivos]: Target,
  [TipoDocumentoDepartamento.Especificaciones]: FileCheck,
  [TipoDocumentoDepartamento.LeccionesAprendidas]: Lightbulb,
  [TipoDocumentoDepartamento.Documentacion]: BookOpen,
  [TipoDocumentoDepartamento.Notas]: StickyNote,
}

const tipoColors = {
  [TipoDocumentoDepartamento.Resumen]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  [TipoDocumentoDepartamento.Objetivos]:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  [TipoDocumentoDepartamento.Especificaciones]:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  [TipoDocumentoDepartamento.LeccionesAprendidas]:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  [TipoDocumentoDepartamento.Documentacion]:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  [TipoDocumentoDepartamento.Notas]: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
}

const tipoLabels = {
  [TipoDocumentoDepartamento.Resumen]: "Resumen",
  [TipoDocumentoDepartamento.Objetivos]: "Objetivos",
  [TipoDocumentoDepartamento.Especificaciones]: "Especificaciones",
  [TipoDocumentoDepartamento.LeccionesAprendidas]: "Lecciones Aprendidas",
  [TipoDocumentoDepartamento.Documentacion]: "Documentación",
  [TipoDocumentoDepartamento.Notas]: "Notas",
}

export function DepartmentDocumentsManager({
  departamentoId,
  departamentoNombre,
  variant = "default",
}: DepartmentDocumentsManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedDocumento, setSelectedDocumento] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterTipo, setFilterTipo] = useState<string>("all")
  const isCondensed = variant === "condensed"

  // TanStack Query for documents
  const { data: documentosDepartamento = [], isLoading } = useDocumentosDepartamento(departamentoId)
  const createMutation = useCreateDocumentoDepartamento()
  const updateMutation = useUpdateDocumentoDepartamento()
  const deleteMutation = useDeleteDocumentoDepartamento()

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
      tipo: TipoDocumentoDepartamento.Notas,
      titulo: "",
      contenido: "",
    },
  })

  const selectedTipo = watch("tipo")

  useEffect(() => {
    if (selectedDocumento && showEditModal) {
      reset({
        tipo: selectedDocumento.tipo,
        titulo: selectedDocumento.titulo,
        contenido: selectedDocumento.contenido,
      })
    } else if (showCreateModal) {
      reset({
        tipo: TipoDocumentoDepartamento.Notas,
        titulo: "",
        contenido: "",
      })
    }
  }, [selectedDocumento, showEditModal, showCreateModal, reset])

  const onSubmitCreate = async (data: DocumentoFormData) => {
    try {
      await createMutation.mutateAsync({
        ...data,
        departamentoId,
      })
      setShowCreateModal(false)
      reset()
    } catch (error) {
      // Mutations handle errors
    }
  }

  const onSubmitEdit = async (data: DocumentoFormData) => {
    if (!selectedDocumento) return
    try {
      await updateMutation.mutateAsync({
        id: selectedDocumento.id,
        data,
        departamentoId,
      })
      setShowEditModal(false)
      setSelectedDocumento(null)
      reset()
    } catch (error) {
      // Mutations handle errors
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este documento?")) return
    try {
      await deleteMutation.mutateAsync({ id, departamentoId })
    } catch (error) {
      // Mutations handle errors
    }
  }

  const handleEdit = (documento: any) => {
    setSelectedDocumento(documento)
    setShowEditModal(true)
  }

  // Filtrar documentos
  const filteredDocumentos = documentosDepartamento.filter((doc) => {
    const matchesSearch =
      doc.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.contenido.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTipo = filterTipo === "all" || doc.tipo === filterTipo
    return matchesSearch && matchesTipo
  })

  const modalElements = (
    <>
      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Documento</DialogTitle>
            <DialogDescription>
              Agrega documentación importante para el departamento
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
                onValueChange={(value) => setValue("tipo", value as TipoDocumentoDepartamento)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tipoLabels).map(([key, label]) => {
                    const Icon = tipoIcons[key as TipoDocumentoDepartamento]
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
              <Button type="submit" className="gap-2">
                <Plus className="h-4 w-4" />
                Guardar documento
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Documento</DialogTitle>
            <DialogDescription>Actualiza la información relevante del documento</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">
                Tipo de Documento <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedTipo}
                onValueChange={(value) => setValue("tipo", value as TipoDocumentoDepartamento)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tipoLabels).map(([key, label]) => {
                    const Icon = tipoIcons[key as TipoDocumentoDepartamento]
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

            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input id="titulo" placeholder="Título del documento" {...register("titulo")} />
              {errors.titulo && (
                <p className="text-sm text-destructive">{errors.titulo.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contenido">Contenido</Label>
              <Textarea id="contenido" rows={10} {...register("contenido")} />
              {errors.contenido && (
                <p className="text-sm text-destructive">{errors.contenido.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditModal(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="gap-2">
                <Edit className="h-4 w-4" />
                Guardar cambios
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )

  const latestDocument = documentosDepartamento
    .slice()
    .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())[0]

  if (isCondensed) {
    const recentDocs = filteredDocumentos.slice(0, 4)

    return (
      <>
        <div className="space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Documentos</p>
              <p className="text-sm text-muted-foreground">
                {filteredDocumentos.length} activos · {Object.keys(tipoLabels).length} tipos disponibles
              </p>
              {latestDocument && (
                <p className="text-[11px] text-muted-foreground">
                  Última actualización {format(new Date(latestDocument.fechaCreacion), "dd MMM yyyy", { locale: es })}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-3 text-[11px]"
                onClick={() => setShowCreateModal(true)}
              >
                Nuevo documento
              </Button>
              {recentDocs.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-3 text-[11px]"
                  onClick={() => handleEdit(recentDocs[0])}
                >
                  Editar último
                </Button>
              )}
            </div>
          </div>

          {isLoading ? (
            <p className="text-muted-foreground">Cargando documentos...</p>
          ) : recentDocs.length === 0 ? (
            <p className="text-muted-foreground">No hay documentos registrados en este departamento.</p>
          ) : (
            <ul className="space-y-2 text-muted-foreground">
              {recentDocs.map((documento) => (
                <li key={documento.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <button
                      className="text-left text-sm font-medium text-foreground hover:underline line-clamp-1"
                      onClick={() => handleEdit(documento)}
                    >
                      {documento.titulo}
                    </button>
                    <p className="text-[11px] uppercase tracking-[0.2em]">
                      {tipoLabels[documento.tipo]}
                    </p>
                  </div>
                  <div className="text-right text-[10px] uppercase tracking-[0.2em]">
                    <p>{documento.creadoPor?.nombreCompleto || "Sistema"}</p>
                    <p>{format(new Date(documento.fechaCreacion), "dd MMM", { locale: es })}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {modalElements}
      </>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Documentos del Departamento</h2>
          <p className="text-sm text-muted-foreground mt-1">{departamentoNombre}</p>
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
            <h3 className="text-lg font-semibold">Documentos de Departamento</h3>
            <p className="text-muted-foreground">
              {searchQuery || filterTipo !== "all"
                ? "No se encontraron documentos con los filtros aplicados"
                : "No hay documentos en este departamento"}
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
              Agrega documentación importante para el departamento
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
                onValueChange={(value) => setValue("tipo", value as TipoDocumentoDepartamento)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tipoLabels).map(([key, label]) => {
                    const Icon = tipoIcons[key as TipoDocumentoDepartamento]
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
                onValueChange={(value) => setValue("tipo", value as TipoDocumentoDepartamento)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tipoLabels).map(([key, label]) => {
                    const Icon = tipoIcons[key as TipoDocumentoDepartamento]
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
