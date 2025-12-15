"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Clock, MapPin, Trash2, Loader2 } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { useCalendarStore } from "@/store/calendarStore"
import { useCreateEvent, useUpdateEvent, useDeleteEvent } from "@/hooks/queries"
import { TipoEvento, EstadoEvento, type CreateEventoDto } from "@/services/eventosService"
import { cn } from "@/lib/utils"

const eventFormSchema = z.object({
    titulo: z.string().min(1, "El título es requerido"),
    descripcion: z.string().optional(),
    tipo: z.enum(['Reunion', 'Tarea', 'Proyecto', 'Personal', 'Recordatorio']),
    estado: z.enum(['Pendiente', 'En_Curso', 'Completado', 'Cancelado']).optional(),
    fechaInicio: z.date(),
    horaInicio: z.string(),
    fechaFin: z.date(),
    horaFin: z.string(),
    todoElDia: z.boolean(),
    ubicacion: z.string().optional(),
    color: z.string().optional(),
    proyectoId: z.string().optional(),
    tareaId: z.string().optional(),
})

type EventFormValues = z.infer<typeof eventFormSchema>

const eventColors = [
    { value: '#3b82f6', label: 'Azul' },
    { value: '#10b981', label: 'Verde' },
    { value: '#8b5cf6', label: 'Púrpura' },
    { value: '#f59e0b', label: 'Ámbar' },
    { value: '#ef4444', label: 'Rojo' },
    { value: '#ec4899', label: 'Rosa' },
    { value: '#6b7280', label: 'Gris' },
]

export function EventModal() {
    // UI state from calendar store
    const {
        isEventModalOpen,
        eventModalMode,
        eventToEdit,
        currentDate,
        closeEventModal,
    } = useCalendarStore()

    // TanStack Query mutations for CRUD operations
    const createEventMutation = useCreateEvent()
    const updateEventMutation = useUpdateEvent()
    const deleteEventMutation = useDeleteEvent()

    const isSubmitting = createEventMutation.isPending || updateEventMutation.isPending
    const isDeleting = deleteEventMutation.isPending

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            titulo: "",
            descripcion: "",
            tipo: "Reunion",
            estado: "Pendiente",
            fechaInicio: currentDate,
            horaInicio: "09:00",
            fechaFin: currentDate,
            horaFin: "10:00",
            todoElDia: false,
            ubicacion: "",
            color: "#3b82f6",
        },
    })

    // Load event data when editing
    useEffect(() => {
        if (eventModalMode === 'edit' && eventToEdit) {
            const fechaInicio = new Date(eventToEdit.fechaInicio)
            const fechaFin = new Date(eventToEdit.fechaFin)

            form.reset({
                titulo: eventToEdit.titulo,
                descripcion: eventToEdit.descripcion || "",
                tipo: eventToEdit.tipo,
                estado: eventToEdit.estado,
                fechaInicio,
                horaInicio: format(fechaInicio, 'HH:mm'),
                fechaFin,
                horaFin: format(fechaFin, 'HH:mm'),
                todoElDia: eventToEdit.todoElDia,
                ubicacion: eventToEdit.ubicacion || "",
                color: eventToEdit.color || "#3b82f6",
                proyectoId: eventToEdit.proyectoId,
                tareaId: eventToEdit.tareaId,
            })
        } else {
            form.reset({
                titulo: "",
                descripcion: "",
                tipo: "Reunion",
                estado: "Pendiente",
                fechaInicio: currentDate,
                horaInicio: "09:00",
                fechaFin: currentDate,
                horaFin: "10:00",
                todoElDia: false,
                ubicacion: "",
                color: "#3b82f6",
            })
        }
    }, [eventModalMode, eventToEdit, currentDate, form])

    const onSubmit = async (values: EventFormValues) => {
        try {
            // Combine date and time
            const [horaInicioH, horaInicioM] = values.horaInicio.split(':')
            const [horaFinH, horaFinM] = values.horaFin.split(':')

            const fechaInicio = new Date(values.fechaInicio)
            fechaInicio.setHours(parseInt(horaInicioH), parseInt(horaInicioM), 0, 0)

            const fechaFin = new Date(values.fechaFin)
            fechaFin.setHours(parseInt(horaFinH), parseInt(horaFinM), 0, 0)

            const eventData: CreateEventoDto = {
                titulo: values.titulo,
                descripcion: values.descripcion,
                tipo: values.tipo as TipoEvento,
                estado: values.estado as EstadoEvento,
                fechaInicio: fechaInicio.toISOString(),
                fechaFin: fechaFin.toISOString(),
                todoElDia: values.todoElDia,
                ubicacion: values.ubicacion,
                color: values.color,
                proyectoId: values.proyectoId,
                tareaId: values.tareaId,
            }

            if (eventModalMode === 'create') {
                await createEventMutation.mutateAsync(eventData)
            } else if (eventToEdit) {
                await updateEventMutation.mutateAsync({ id: eventToEdit.id, data: eventData })
            }
            closeEventModal()
        } catch (error) {
            // Mutations handle errors
        }
    }

    const handleDelete = async () => {
        if (!eventToEdit) return

        try {
            await deleteEventMutation.mutateAsync(eventToEdit.id)
            closeEventModal()
        } catch (error) {
            // Mutation handles errors
        }
    }

    const todoElDia = form.watch('todoElDia')

    return (
        <Dialog open={isEventModalOpen} onOpenChange={closeEventModal}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {eventModalMode === 'create' ? 'Crear Evento' : 'Editar Evento'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Título */}
                    <div className="space-y-2">
                        <Label htmlFor="titulo">Título *</Label>
                        <Input
                            id="titulo"
                            placeholder="Título del evento"
                            {...form.register('titulo')}
                        />
                        {form.formState.errors.titulo && (
                            <p className="text-sm text-destructive">{form.formState.errors.titulo.message}</p>
                        )}
                    </div>

                    {/* Descripción */}
                    <div className="space-y-2">
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Textarea
                            id="descripcion"
                            placeholder="Descripción del evento"
                            rows={3}
                            {...form.register('descripcion')}
                        />
                    </div>

                    {/* Tipo y Estado */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="tipo">Tipo *</Label>
                            <Select
                                value={form.watch('tipo')}
                                onValueChange={(value) => form.setValue('tipo', value as any)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Reunion">Reunión</SelectItem>
                                    <SelectItem value="Tarea">Tarea</SelectItem>
                                    <SelectItem value="Proyecto">Proyecto</SelectItem>
                                    <SelectItem value="Personal">Personal</SelectItem>
                                    <SelectItem value="Recordatorio">Recordatorio</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="estado">Estado</Label>
                            <Select
                                value={form.watch('estado')}
                                onValueChange={(value) => form.setValue('estado', value as any)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                                    <SelectItem value="En_Curso">En Curso</SelectItem>
                                    <SelectItem value="Completado">Completado</SelectItem>
                                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Todo el día */}
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="todoElDia"
                            checked={todoElDia}
                            onCheckedChange={(checked) => form.setValue('todoElDia', checked)}
                        />
                        <Label htmlFor="todoElDia">Todo el día</Label>
                    </div>

                    {/* Fecha y hora de inicio */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Fecha de inicio *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !form.watch('fechaInicio') && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {form.watch('fechaInicio') ? (
                                            format(form.watch('fechaInicio'), "PPP", { locale: es })
                                        ) : (
                                            <span>Seleccionar fecha</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={form.watch('fechaInicio')}
                                        onSelect={(date) => date && form.setValue('fechaInicio', date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {!todoElDia && (
                            <div className="space-y-2">
                                <Label htmlFor="horaInicio">Hora de inicio</Label>
                                <div className="relative">
                                    <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="horaInicio"
                                        type="time"
                                        className="pl-8"
                                        {...form.register('horaInicio')}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Fecha y hora de fin */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Fecha de fin *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !form.watch('fechaFin') && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {form.watch('fechaFin') ? (
                                            format(form.watch('fechaFin'), "PPP", { locale: es })
                                        ) : (
                                            <span>Seleccionar fecha</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={form.watch('fechaFin')}
                                        onSelect={(date) => date && form.setValue('fechaFin', date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {!todoElDia && (
                            <div className="space-y-2">
                                <Label htmlFor="horaFin">Hora de fin</Label>
                                <div className="relative">
                                    <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="horaFin"
                                        type="time"
                                        className="pl-8"
                                        {...form.register('horaFin')}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Ubicación */}
                    <div className="space-y-2">
                        <Label htmlFor="ubicacion">Ubicación</Label>
                        <div className="relative">
                            <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="ubicacion"
                                placeholder="Ubicación del evento"
                                className="pl-8"
                                {...form.register('ubicacion')}
                            />
                        </div>
                    </div>

                    {/* Color */}
                    <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="flex gap-2">
                            {eventColors.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    className={cn(
                                        "h-8 w-8 rounded-full border-2 transition-all",
                                        form.watch('color') === color.value
                                            ? "border-foreground scale-110"
                                            : "border-transparent hover:scale-105"
                                    )}
                                    style={{ backgroundColor: color.value }}
                                    onClick={() => form.setValue('color', color.value)}
                                    title={color.label}
                                />
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        {eventModalMode === 'edit' && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isDeleting || isSubmitting}
                                className="mr-auto"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Eliminando...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Eliminar
                                    </>
                                )}
                            </Button>
                        )}
                        <Button type="button" variant="outline" onClick={closeEventModal} disabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                eventModalMode === 'create' ? 'Crear' : 'Guardar'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
