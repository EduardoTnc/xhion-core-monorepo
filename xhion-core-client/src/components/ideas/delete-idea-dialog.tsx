"use client"

import { useState } from "react"
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
import { useIdeasStore } from "@/store/ideasStore"
import { toast } from "sonner"
import type { Idea } from "@/services/ideasService"

interface DeleteIdeaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  idea: Idea
  onSuccess?: () => void
}

export function DeleteIdeaDialog({ open, onOpenChange, idea, onSuccess }: DeleteIdeaDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { eliminarIdea } = useIdeasStore()

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await eliminarIdea(idea.id)
      toast.success("Idea eliminada correctamente")
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error("Error al eliminar idea:", error)
      toast.error(error.response?.data?.message || "Error al eliminar la idea")
    } finally {
      setIsDeleting(false)
    }
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
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
