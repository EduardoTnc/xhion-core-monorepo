"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Loader2 } from "lucide-react"
import { useProjects } from "@/hooks/queries"
import { useCreateTask } from "@/hooks/mutations/useTaskMutations"

const formSchema = z.object({
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  descripcion: z.string().optional(),
  prioridad: z.enum(["Baja", "Media", "Alta", "Urgente"]),
  proyectoId: z.string().min(1, "Selecciona un proyecto"),
  fechaVencimiento: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface CreateTaskQuickModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

/**
 * Modal Rápido de Creación de Tareas
 * 
 * Modal simplificado para crear tareas rápidamente desde el dashboard
 */
export function CreateTaskQuickModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateTaskQuickModalProps) {
  // TanStack Query hooks
  const { data: proyectos = [] } = useProjects()
  const createTaskMutation = useCreateTask()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: "",
      descripcion: "",
      prioridad: "Media",
      proyectoId: "",
      fechaVencimiento: undefined,
    },
  })

  const onSubmit = async (values: FormValues) => {
    createTaskMutation.mutate(
      {
        ...values,
        estado: "Por_Hacer",
      },
      {
        onSuccess: () => {
          form.reset()
          onOpenChange(false)
          if (onSuccess) {
            onSuccess()
          }
        },
      }
    )
  }

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "Urgente":
        return "text-red-600"
      case "Alta":
        return "text-orange-600"
      case "Media":
        return "text-yellow-600"
      case "Baja":
        return "text-green-600"
      default:
        return ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nueva Tarea Rápida</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Título */}
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Revisar documentación del proyecto"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descripción */}
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe la tarea..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Proyecto y Prioridad en Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Proyecto */}
              <FormField
                control={form.control}
                name="proyectoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proyecto *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {proyectos
                          .filter((p) => p.estado === "Activo")
                          .map((proyecto) => (
                            <SelectItem key={proyecto.id} value={proyecto.id}>
                              {proyecto.nombre}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Prioridad */}
              <FormField
                control={form.control}
                name="prioridad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridad *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Baja">
                          <span className={getPrioridadColor("Baja")}>
                            Baja
                          </span>
                        </SelectItem>
                        <SelectItem value="Media">
                          <span className={getPrioridadColor("Media")}>
                            Media
                          </span>
                        </SelectItem>
                        <SelectItem value="Alta">
                          <span className={getPrioridadColor("Alta")}>
                            Alta
                          </span>
                        </SelectItem>
                        <SelectItem value="Urgente">
                          <span className={getPrioridadColor("Urgente")}>
                            Urgente
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Fecha de Vencimiento */}
            <FormField
              control={form.control}
              name="fechaVencimiento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Vencimiento</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value ? new Date(field.value) : undefined}
                      onDateChange={(date) => {
                        field.onChange(date?.toISOString())
                      }}
                      minDate={new Date()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createTaskMutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createTaskMutation.isPending}>
                {createTaskMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Tarea
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
