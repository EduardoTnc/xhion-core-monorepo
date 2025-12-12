import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Send, Trash2 } from "lucide-react";
import { type Comentario } from "@/services/taskService";
import { useAddTaskComment, useDeleteTaskComment } from "@/hooks/mutations/useTaskMutations";
import { useAuthStore } from "@/store/authStore";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface TaskCommentsProps {
  tareaId: string;
  comentarios: Comentario[];
}

export function TaskComments({ tareaId, comentarios }: TaskCommentsProps) {
  const { user } = useAuthStore();
  // TanStack Query mutations
  const addCommentMutation = useAddTaskComment();
  const deleteCommentMutation = useDeleteTaskComment();

  const [newComment, setNewComment] = useState("");
  const [comentarioToDelete, setComentarioToDelete] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    addCommentMutation.mutate(
      { taskId: tareaId, data: { contenido: newComment } },
      {
        onSuccess: () => {
          setNewComment("");
        },
      }
    );
  };

  const handleDeleteClick = (comentarioId: string) => {
    setComentarioToDelete(comentarioId);
  };

  const handleConfirmDelete = async () => {
    if (!comentarioToDelete) return;

    deleteCommentMutation.mutate(
      { taskId: tareaId, comentarioId: comentarioToDelete },
      {
        onSettled: () => {
          setComentarioToDelete(null);
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Comentarios ({comentarios.length})</h3>

      {/* Lista de comentarios */}
      <ScrollArea className="h-[300px] pr-4">
        {comentarios.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay comentarios aún. Sé el primero en comentar.
          </p>
        ) : (
          <div className="space-y-4">
            {comentarios.map((comentario) => (
              <div key={comentario.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comentario.usuario.avatarUrl} />
                  <AvatarFallback className="text-xs">
                    {getInitials(comentario.usuario.nombreCompleto)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {comentario.usuario.nombreCompleto}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comentario.fechaCreacion), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                    </div>
                    {user?.id === comentario.usuarioId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(comentario.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {comentario.contenido}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Formulario de nuevo comentario */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="Escribe un comentario..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          disabled={addCommentMutation.isPending}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={addCommentMutation.isPending || !newComment.trim()}>
            {addCommentMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Comentar
          </Button>
        </div>
      </form>

      {/* Modal de confirmación para eliminar */}
      <AlertDialog open={!!comentarioToDelete} onOpenChange={() => setComentarioToDelete(null)}>
        <AlertDialogContent className="z-[100]" overlayClassName="z-[99]">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar comentario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El comentario será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
