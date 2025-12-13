"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThumbsUp, MessageSquare, Sparkles, Calendar, User, MoreVertical, Edit, Trash2, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useIdea } from "@/hooks/queries"
import { useVoteIdea } from "@/hooks/mutations/useIdeaMutations"
import { useAuthStore } from "@/store/authStore"
import { IdeaComments } from "./idea-comments"
import { EditIdeaModal } from "./edit-idea-modal"
import { DeleteIdeaDialog } from "./delete-idea-dialog"

interface IdeaDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ideaId: string
  onUpdate?: () => void
}

export function IdeaDetailsModal({ open, onOpenChange, ideaId, onUpdate }: IdeaDetailsModalProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // TanStack Query hooks
  const { data: idea, isLoading, refetch } = useIdea(ideaId, { enabled: open && !!ideaId })
  const voteIdeaMutation = useVoteIdea()
  const { user } = useAuthStore()

  const handleVote = async () => {
    if (!idea) return
    voteIdeaMutation.mutate(idea.id)
  }

  const handleSuccess = () => {
    refetch()
    onUpdate?.()
  }

  const handleDeleteSuccess = () => {
    onOpenChange(false)
    onUpdate?.()
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Feature":
        return "bg-chart-1/10 text-chart-1 border-chart-1/20"
      case "Improvement":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20"
      case "Innovation":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20"
      case "Recommendation":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "Feature":
        return "Nueva funcionalidad"
      case "Improvement":
        return "Mejora"
      case "Innovation":
        return "Innovación"
      case "Recommendation":
        return "Recomendación"
      default:
        return category
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Evaluating":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "Approved":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "InDevelopment":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20"
      case "Implemented":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      case "Rejected":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Evaluating":
        return "En evaluación"
      case "Approved":
        return "Aprobada"
      case "InDevelopment":
        return "En desarrollo"
      case "Implemented":
        return "Implementada"
      case "Rejected":
        return "Rechazada"
      default:
        return status
    }
  }

  const formatDate = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const isAuthor = user?.id === idea?.autorId

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0 flex flex-col">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : idea ? (
            <>
              <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-2xl font-bold leading-tight mb-2">
                      {idea.titulo}
                    </DialogTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={getCategoryColor(idea.categoria)}>
                        {getCategoryLabel(idea.categoria)}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(idea.estado)}>
                        {getStatusLabel(idea.estado)}
                      </Badge>
                      {idea.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Menú de acciones (solo para autor) */}
                  {isAuthor && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="flex-shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 overflow-y-auto px-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                <div className="space-y-6 pb-6">
                  {/* Descripción */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Descripción</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {idea.descripcion}
                    </p>
                  </div>

                  {/* AI Insight */}
                  {idea.aiInsight && (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-sm font-semibold text-primary">Análisis IA</span>
                            {idea.aiScore && (
                              <Badge variant="secondary" className="text-xs">
                                Score: {idea.aiScore}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{idea.aiInsight}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Información del autor */}
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={idea.autor.avatarUrl} />
                      <AvatarFallback>{getInitials(idea.autor.nombreCompleto)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{idea.autor.nombreCompleto}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{formatDate(idea.fechaCreacion)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Estadísticas */}
                  <div className="flex items-center gap-4">
                    <Button
                      variant={idea.hasVoted ? "default" : "outline"}
                      size="sm"
                      className="gap-2"
                      onClick={handleVote}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>{idea._count.votos}</span>
                      <span className="hidden sm:inline">
                        {idea._count.votos === 1 ? "voto" : "votos"}
                      </span>
                    </Button>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      <span>{idea._count.comentarios}</span>
                      <span className="hidden sm:inline">
                        {idea._count.comentarios === 1 ? "comentario" : "comentarios"}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Sección de comentarios */}
                  <div>
                    <IdeaComments ideaId={idea.id} />
                  </div>
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">No se pudo cargar la idea</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modales de edición y eliminación */}
      {idea && isAuthor && (
        <>
          <EditIdeaModal
            open={showEditModal}
            onOpenChange={setShowEditModal}
            idea={idea}
            onSuccess={handleSuccess}
          />
          <DeleteIdeaDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            idea={idea}
            onSuccess={handleDeleteSuccess}
          />
        </>
      )}
    </>
  )
}
