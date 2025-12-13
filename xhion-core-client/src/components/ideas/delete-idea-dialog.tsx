"use client"

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
import { Loader2 } from "lucide-react"
import { useDeleteIdea } from "@/hooks/mutations/useIdeaMutations"
import type { Idea } from "@/services/ideasService"

interface DeleteIdeaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  idea: Idea
  onSuccess?: () => void
}

export function DeleteIdeaDialog({ open, onOpenChange, idea, onSuccess }: DeleteIdeaDialogProps) {
  const deleteIdeaMutation = useDeleteIdea()

  const handleDelete = async () => {
    deleteIdeaMutation.mutate(idea.id, {
      onSuccess: () => {
        onOpenChange(false)
        onSuccess?.()
      },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Estás a punto de eliminar la idea <span className="font-semibold">"{idea.titulo}"</span>.
            </p>
            <p className="text-destructive">
              Esta acción no se puede deshacer. Se eliminarán también todos los votos y comentarios asociados.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteIdeaMutation.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={deleteIdeaMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteIdeaMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
