"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MessageSquare, Send, Loader2, MoreVertical, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useIdeaComments } from "@/hooks/queries"
import { useAddIdeaComment, useDeleteIdeaComment } from "@/hooks/mutations/useIdeaMutations"
import { useAuthStore } from "@/store/authStore"
import { toast } from "sonner"
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

interface IdeaCommentsProps {
  ideaId: string
}

export function IdeaComments({ ideaId }: IdeaCommentsProps) {
  const [nuevoComentario, setNuevoComentario] = useState("")
  const [comentarioAEliminar, setComentarioAEliminar] = useState<string | null>(null)

  // TanStack Query hooks
  const { data: comentarios = [], isLoading } = useIdeaComments(ideaId)
  const addCommentMutation = useAddIdeaComment()
  const deleteCommentMutation = useDeleteIdeaComment()
  const { user } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nuevoComentario.trim()) {
      toast.error("El comentario no puede estar vacío")
      return
    }

    addCommentMutation.mutate(
      { ideaId, contenido: nuevoComentario.trim() },
      {
        onSuccess: () => {
          setNuevoComentario("")
        },
      }
    )
  }

  const handleDelete = async () => {
    if (!comentarioAEliminar) return

    deleteCommentMutation.mutate(comentarioAEliminar, {
      onSuccess: () => {
        setComentarioAEliminar(null)
      },
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comentarios ({comentarios.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulario de nuevo comentario */}
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            placeholder="Escribe un comentario..."
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
            rows={3}
            disabled={addCommentMutation.isPending}
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={addCommentMutation.isPending || !nuevoComentario.trim()}>
              {addCommentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Comentar
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Lista de comentarios */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : comentarios.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay comentarios aún</p>
            <p className="text-xs">Sé el primero en comentar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comentarios.map((comentario) => (
              <div key={comentario.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={comentario.usuario?.avatarUrl} />
                  <AvatarFallback className="text-xs">
                    {getInitials(comentario.usuario?.nombreCompleto || "Usuario")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {comentario.usuario?.nombreCompleto || "Usuario"}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(comentario.fechaCreacion)}</p>
                    </div>

                    {/* Menú de acciones (solo para el autor del comentario) */}
                    {user?.id === comentario.usuarioId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setComentarioAEliminar(comentario.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  <p className="text-sm mt-1 whitespace-pre-wrap break-words">{comentario.contenido}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dialog de confirmación de eliminación */}
        <AlertDialog open={!!comentarioAEliminar} onOpenChange={(open) => !open && setComentarioAEliminar(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar comentario?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El comentario será eliminado permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteCommentMutation.isPending}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleDelete()
                }}
                disabled={deleteCommentMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteCommentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
