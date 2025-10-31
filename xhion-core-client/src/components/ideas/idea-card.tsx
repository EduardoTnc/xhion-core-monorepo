"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThumbsUp, MessageSquare, Sparkles, MoreVertical, Edit, Trash2 } from "lucide-react"
import { useIdeasStore } from "@/store/ideasStore"
import { useAuthStore } from "@/store/authStore"
import { EditIdeaModal } from "./edit-idea-modal"
import { DeleteIdeaDialog } from "./delete-idea-dialog"
import { IdeaDetailsModal } from "./idea-details-modal"
import type { Idea } from "@/services/ideasService"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface IdeaCardProps {
  idea: Idea
  onUpdate?: () => void
}

export function IdeaCard({ idea, onUpdate }: IdeaCardProps) {
  const { votarIdea } = useIdeasStore()
  const { user } = useAuthStore()
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const isAuthor = user?.id === idea.autorId

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation() // Evitar que se abra el modal al votar
    await votarIdea(idea.id)
    if (onUpdate) onUpdate()
  }

  const handleCardClick = () => {
    setShowDetailsModal(true)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Evaluating":
        return "border-amber-500/20 bg-amber-500/10 text-amber-600"
      case "Approved":
        return "border-green-500/20 bg-green-500/10 text-green-600"
      case "InDevelopment":
        return "border-blue-500/20 bg-blue-500/10 text-blue-600"
      case "Implemented":
        return "border-green-500/20 bg-green-500/10 text-green-600"
      case "Rejected":
        return "border-red-500/20 bg-red-500/10 text-red-600"
      default:
        return "border-border bg-muted text-muted-foreground"
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

  const formatDate = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
  }

  return (
    <>
      <div 
        className="group rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md cursor-pointer"
        onClick={handleCardClick}
      >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground leading-tight">{idea.titulo}</h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">{idea.descripcion}</p>
        </div>
        {isAuthor && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShowEditModal(true); }}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShowDeleteDialog(true); }} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
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

      {/* AI Insight */}
      {idea.aiInsight && (
        <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-medium text-primary">Análisis IA</span>
                {idea.aiScore && (
                  <Badge variant="secondary" className="text-xs">
                    Score: {idea.aiScore}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{idea.aiInsight}</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={idea.autor.avatarUrl || "/placeholder.svg"} alt={idea.autor.nombreCompleto} />
            <AvatarFallback>{idea.autor.nombreCompleto.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{idea.autor.nombreCompleto}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{formatDate(idea.fechaCreacion)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={idea.hasVoted ? "default" : "ghost"} 
            size="sm" 
            className="gap-1.5 h-8 px-2"
            onClick={handleVote}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            <span className="text-xs">{idea._count.votos}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 h-8 px-2">
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="text-xs">{idea._count.comentarios}</span>
          </Button>
        </div>
      </div>
      </div>

      {/* Modales - FUERA del div de la card */}
      <IdeaDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        ideaId={idea.id}
        onUpdate={onUpdate}
      />
      
      {isAuthor && (
        <>
          <EditIdeaModal
            open={showEditModal}
            onOpenChange={setShowEditModal}
            idea={idea}
            onSuccess={onUpdate}
          />
          <DeleteIdeaDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            idea={idea}
            onSuccess={onUpdate}
          />
        </>
      )}
    </>
  )
}
