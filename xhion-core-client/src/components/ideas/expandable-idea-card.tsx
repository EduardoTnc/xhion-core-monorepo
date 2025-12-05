"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
    ThumbsUp,
    MessageSquare,
    Sparkles,
    Edit,
    Trash2,
    Loader2,
    Send,
    User,
    Calendar,
    X,
    Clock,
    CheckCircle,
    Rocket,
    ShieldCheck,
    XCircle,
} from "lucide-react"
import { useIdeasStore } from "@/store/ideasStore"
import { useAuthStore } from "@/store/authStore"
import { ideasService } from "@/services/ideasService"
import type { Idea } from "@/services/ideasService"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { InlineIdeaEditor } from "./inline-idea-editor"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ExpandableIdeaCardProps {
    idea: Idea
    isExpanded: boolean
    onToggleExpand: () => void
    onUpdate?: () => void
}

export function ExpandableIdeaCard({ idea, isExpanded, onToggleExpand, onUpdate }: ExpandableIdeaCardProps) {
    const { votarIdea, eliminarIdea } = useIdeasStore()
    const { user } = useAuthStore()

    const [isEditing, setIsEditing] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [ideaData, setIdeaData] = useState(idea)

    // Comments
    const [comments, setComments] = useState<any[]>([])
    const [isLoadingComments, setIsLoadingComments] = useState(false)
    const [newComment, setNewComment] = useState("")
    const [isSendingComment, setIsSendingComment] = useState(false)

    const isAuthor = user?.id === ideaData.autorId

    // Load full idea data and comments when expanded
    useEffect(() => {
        if (isExpanded) {
            loadFullData()
        }
    }, [isExpanded, idea.id])

    const loadFullData = async () => {
        setIsLoadingComments(true)
        try {
            const [fullIdea, commentsData] = await Promise.all([
                ideasService.obtenerPorId(idea.id),
                ideasService.obtenerComentarios(idea.id),
            ])
            setIdeaData(fullIdea)
            setComments(commentsData)
        } catch (error) {
            console.error("Error loading idea data:", error)
        } finally {
            setIsLoadingComments(false)
        }
    }

    const handleVote = async (e: React.MouseEvent) => {
        e.stopPropagation()

        // Optimistic update - immediately update UI
        const wasVoted = ideaData.hasVoted
        setIdeaData(prev => ({
            ...prev,
            hasVoted: !prev.hasVoted,
            _count: {
                ...prev._count,
                votos: prev.hasVoted ? prev._count.votos - 1 : prev._count.votos + 1
            }
        }))

        try {
            await votarIdea(ideaData.id)
            // Silent update to parent for stats only (no list reload)
            onUpdate?.()
        } catch (error) {
            // Revert on error
            setIdeaData(prev => ({
                ...prev,
                hasVoted: wasVoted,
                _count: {
                    ...prev._count,
                    votos: wasVoted ? prev._count.votos + 1 : prev._count.votos - 1
                }
            }))
            toast.error("Error al votar")
        }
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await eliminarIdea(ideaData.id)
            onUpdate?.()
        } catch (error) {
            console.error("Error deleting:", error)
        } finally {
            setIsDeleting(false)
            setShowDeleteDialog(false)
        }
    }

    const handleSendComment = async () => {
        if (!newComment.trim() || !user) return

        const commentText = newComment.trim()
        const tempId = `temp-${Date.now()}`

        // Create optimistic comment
        const optimisticComment = {
            id: tempId,
            contenido: commentText,
            fechaCreacion: new Date().toISOString(),
            autor: {
                id: user.id,
                nombreCompleto: user.nombreCompleto,
                avatarUrl: user.avatarUrl
            }
        }

        // Optimistic update - add comment immediately
        setComments(prev => [...prev, optimisticComment])
        setNewComment("")
        setIdeaData(prev => ({
            ...prev,
            _count: { ...prev._count, comentarios: prev._count.comentarios + 1 }
        }))

        setIsSendingComment(true)
        try {
            const realComment = await ideasService.crearComentario(ideaData.id, commentText)
            // Replace temp comment with real one
            setComments(prev => prev.map(c => c.id === tempId ? realComment : c))
            // Silent update for stats
            onUpdate?.()
        } catch (error) {
            console.error("Error sending comment:", error)
            // Revert on error
            setComments(prev => prev.filter(c => c.id !== tempId))
            setIdeaData(prev => ({
                ...prev,
                _count: { ...prev._count, comentarios: prev._count.comentarios - 1 }
            }))
            toast.error("Error al enviar comentario")
        } finally {
            setIsSendingComment(false)
        }
    }

    const handleEditSuccess = () => {
        setIsEditing(false)
        loadFullData()
        onUpdate?.()
    }

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "Feature": return "bg-blue-500/10 text-blue-600 border-blue-500/20"
            case "Improvement": return "bg-green-500/10 text-green-600 border-green-500/20"
            case "Innovation": return "bg-purple-500/10 text-purple-600 border-purple-500/20"
            case "Recommendation": return "bg-amber-500/10 text-amber-600 border-amber-500/20"
            default: return "bg-muted text-muted-foreground"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Evaluating": return <Clock className="h-3 w-3" />
            case "Approved": return <CheckCircle className="h-3 w-3" />
            case "InDevelopment": return <Rocket className="h-3 w-3" />
            case "Implemented": return <ShieldCheck className="h-3 w-3" />
            case "Rejected": return <XCircle className="h-3 w-3" />
            default: return null
        }
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "Evaluating": return "bg-amber-500 text-white border-amber-600"
            case "Approved": return "bg-green-500 text-white border-green-600"
            case "InDevelopment": return "bg-blue-500 text-white border-blue-600"
            case "Implemented": return "bg-emerald-500 text-white border-emerald-600"
            case "Rejected": return "bg-red-500 text-white border-red-600"
            default: return "bg-muted text-muted-foreground border-border"
        }
    }

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            Evaluating: "En evaluación",
            Approved: "Aprobada",
            InDevelopment: "En desarrollo",
            Implemented: "Implementada",
            Rejected: "Rechazada",
        }
        return labels[status] || status
    }

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            Feature: "Nueva funcionalidad",
            Improvement: "Mejora",
            Innovation: "Innovación",
            Recommendation: "Recomendación",
        }
        return labels[category] || category
    }

    const formatDate = (date: string) => {
        return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
    }

    const getInitials = (name: string) => {
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    }

    // Show editor instead of card
    if (isEditing) {
        return (
            <InlineIdeaEditor
                onClose={() => setIsEditing(false)}
                onSuccess={handleEditSuccess}
                ideaId={ideaData.id}
                initialData={{
                    titulo: ideaData.titulo,
                    descripcion: ideaData.descripcion,
                    categoria: ideaData.categoria,
                    tags: ideaData.tags,
                }}
            />
        )
    }

    return (
        <>
            <div
                className={`
          rounded-xl border bg-card transition-all duration-300 overflow-hidden
          ${isExpanded
                        ? "border-primary/50 shadow-lg shadow-primary/5"
                        : "border-border hover:border-primary/30 hover:shadow-md cursor-pointer"
                    }
        `}
            >
                {/* Collapsed Card Header - Always visible */}
                <div
                    className={`p-5 ${!isExpanded ? "cursor-pointer" : ""}`}
                    onClick={!isExpanded ? onToggleExpand : undefined}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-foreground leading-tight">{ideaData.titulo}</h3>
                            <p className={`mt-2 text-sm text-muted-foreground leading-relaxed ${!isExpanded ? "line-clamp-2" : ""}`}>
                                {ideaData.descripcion}
                            </p>
                        </div>
                        {isExpanded && (
                            <Button variant="ghost" size="icon" onClick={onToggleExpand} className="flex-shrink-0">
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Status Badge - Distinct styling */}
                    <div className="mt-3 flex items-center gap-2">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(ideaData.estado)}`}>
                            {getStatusIcon(ideaData.estado)}
                            {getStatusLabel(ideaData.estado)}
                        </div>
                    </div>

                    {/* Category and Tags */}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={getCategoryColor(ideaData.categoria)}>
                            {getCategoryLabel(ideaData.categoria)}
                        </Badge>
                        {ideaData.tags.slice(0, isExpanded ? undefined : 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                        {!isExpanded && ideaData.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                                +{ideaData.tags.length - 2}
                            </Badge>
                        )}
                    </div>

                    {/* Footer - Collapsed */}
                    {!isExpanded && (
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={ideaData.autor.avatarUrl} />
                                    <AvatarFallback className="text-xs">{getInitials(ideaData.autor.nombreCompleto)}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">{ideaData.autor.nombreCompleto}</span>
                                <span className="text-xs text-muted-foreground">·</span>
                                <span className="text-xs text-muted-foreground">{formatDate(ideaData.fechaCreacion)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={ideaData.hasVoted ? "default" : "ghost"}
                                    size="sm"
                                    className="gap-1.5 h-8 px-2"
                                    onClick={handleVote}
                                >
                                    <ThumbsUp className="h-3.5 w-3.5" />
                                    <span className="text-xs">{ideaData._count.votos}</span>
                                </Button>
                                <div className="flex items-center gap-1.5 text-muted-foreground px-2">
                                    <MessageSquare className="h-3.5 w-3.5" />
                                    <span className="text-xs">{ideaData._count.comentarios}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className="border-t border-border animate-in slide-in-from-top-2 duration-200">
                        {/* AI Insight */}
                        {ideaData.aiInsight && (
                            <div className="mx-5 mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                                <div className="flex items-start gap-3">
                                    <Sparkles className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <span className="text-sm font-semibold text-primary">Análisis Magnus IA</span>
                                            {ideaData.aiScore && (
                                                <Badge variant="secondary" className="text-xs">
                                                    Score: {ideaData.aiScore}/100
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{ideaData.aiInsight}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Author Info */}
                        <div className="mx-5 mt-4 flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={ideaData.autor.avatarUrl} />
                                <AvatarFallback>{getInitials(ideaData.autor.nombreCompleto)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{ideaData.autor.nombreCompleto}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">{formatDate(ideaData.fechaCreacion)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mx-5 mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={ideaData.hasVoted ? "default" : "outline"}
                                    size="sm"
                                    className="gap-2"
                                    onClick={handleVote}
                                >
                                    <ThumbsUp className="h-4 w-4" />
                                    <span>{ideaData._count.votos} {ideaData._count.votos === 1 ? "voto" : "votos"}</span>
                                </Button>
                            </div>

                            {isAuthor && (
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" className="gap-2" onClick={() => setIsEditing(true)}>
                                        <Edit className="h-4 w-4" />
                                        Editar
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="gap-2 text-destructive hover:text-destructive"
                                        onClick={() => setShowDeleteDialog(true)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Eliminar
                                    </Button>
                                </div>
                            )}
                        </div>

                        <Separator className="my-4" />

                        {/* Comments Section */}
                        <div className="px-5 pb-5">
                            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Comentarios ({ideaData._count.comentarios})
                            </h4>

                            {isLoadingComments ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Comments List */}
                                    {comments.length > 0 ? (
                                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                            {comments.map((comment) => (
                                                <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                                        <AvatarImage src={comment.autor?.avatarUrl} />
                                                        <AvatarFallback className="text-xs">
                                                            {getInitials(comment.autor?.nombreCompleto || "U")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-sm font-medium">{comment.autor?.nombreCompleto}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatDate(comment.fechaCreacion)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{comment.contenido}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            No hay comentarios aún. ¡Sé el primero!
                                        </p>
                                    )}

                                    {/* New Comment Input */}
                                    <div className="flex gap-2 pt-2">
                                        <Textarea
                                            placeholder="Escribe un comentario..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            rows={2}
                                            className="resize-none flex-1"
                                        />
                                        <Button
                                            size="icon"
                                            onClick={handleSendComment}
                                            disabled={!newComment.trim() || isSendingComment}
                                            className="flex-shrink-0 self-end"
                                        >
                                            {isSendingComment ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Send className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar esta idea?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. La idea "{ideaData.titulo}" será eliminada permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Eliminando...
                                </>
                            ) : (
                                "Eliminar"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
