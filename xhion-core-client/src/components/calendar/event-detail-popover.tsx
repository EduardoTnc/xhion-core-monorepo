"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, Clock, MapPin, User, Edit, Trash2, Check, X } from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCalendarStore } from "@/store/calendarStore"
import { useDeleteEvent } from "@/hooks/queries"
import { type Evento } from "@/services/eventosService"
import { getEventColor, formatEventTimeRange } from "@/lib/calendar-utils"
import { cn } from "@/lib/utils"

interface EventDetailPopoverProps {
    evento: Evento
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function EventDetailPopover({ evento, children, open, onOpenChange }: EventDetailPopoverProps) {
    const { openEditEventModal, selectEvento } = useCalendarStore()
    const deleteEventMutation = useDeleteEvent()

    const handleEdit = () => {
        openEditEventModal(evento)
        onOpenChange?.(false)
    }

    const handleDelete = async () => {
        if (confirm('¿Estás seguro de que deseas eliminar este evento?')) {
            try {
                await deleteEventMutation.mutateAsync(evento.id)
                onOpenChange?.(false)
            } catch (error) {
                // Mutation handles errors
            }
        }
    }

    const eventColor = getEventColor(evento)

    const getEstadoBadge = (estado: string) => {
        switch (estado) {
            case 'Completado':
                return <Badge variant="default" className="bg-green-500">Completado</Badge>
            case 'En_Curso':
                return <Badge variant="default" className="bg-blue-500">En Curso</Badge>
            case 'Cancelado':
                return <Badge variant="destructive">Cancelado</Badge>
            default:
                return <Badge variant="secondary">Pendiente</Badge>
        }
    }

    const getTipoBadge = (tipo: string) => {
        const colors: Record<string, string> = {
            'Reunion': 'bg-blue-500',
            'Tarea': 'bg-green-500',
            'Proyecto': 'bg-purple-500',
            'Personal': 'bg-amber-500',
            'Recordatorio': 'bg-red-500',
        }

        return (
            <Badge variant="default" className={colors[tipo] || 'bg-gray-500'}>
                {tipo}
            </Badge>
        )
    }

    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
                <div className="space-y-3">
                    {/* Header with color indicator */}
                    <div className="flex items-start gap-3">
                        <div
                            className="h-12 w-1 rounded-full flex-shrink-0"
                            style={{ backgroundColor: eventColor }}
                        />
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm leading-tight">{evento.titulo}</h4>
                            <div className="flex gap-2 mt-1">
                                {getTipoBadge(evento.tipo)}
                                {getEstadoBadge(evento.estado)}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {evento.descripcion && (
                        <p className="text-sm text-muted-foreground">{evento.descripcion}</p>
                    )}

                    <Separator />

                    {/* Details */}
                    <div className="space-y-2">
                        {/* Time */}
                        <div className="flex items-start gap-2 text-sm">
                            <Clock className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <div>
                                <p className="font-medium">{formatEventTimeRange(evento)}</p>
                                <p className="text-xs text-muted-foreground">
                                    {format(new Date(evento.fechaInicio), "EEEE, d 'de' MMMM", { locale: es })}
                                </p>
                            </div>
                        </div>

                        {/* Location */}
                        {evento.ubicacion && (
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span>{evento.ubicacion}</span>
                            </div>
                        )}

                        {/* Creator */}
                        <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span>{evento.creador.nombreCompleto}</span>
                        </div>

                        {/* Project */}
                        {evento.proyecto && (
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-xs">
                                    Proyecto: <span className="font-medium">{evento.proyecto.nombre}</span>
                                </span>
                            </div>
                        )}

                        {/* Task */}
                        {evento.tarea && (
                            <div className="flex items-center gap-2 text-sm">
                                <Check className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-xs">
                                    Tarea: <span className="font-medium">{evento.tarea.titulo}</span>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Participants */}
                    {evento.participantes && evento.participantes.length > 0 && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Participantes ({evento.participantes.length})
                                </p>
                                <div className="space-y-1">
                                    {evento.participantes.slice(0, 3).map((participante) => (
                                        <div key={participante.id} className="flex items-center gap-2 text-sm">
                                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                                                {participante.usuario.nombreCompleto.charAt(0)}
                                            </div>
                                            <span className="text-xs">{participante.usuario.nombreCompleto}</span>
                                            {participante.confirmado && (
                                                <Check className="h-3 w-3 text-green-500 ml-auto" />
                                            )}
                                        </div>
                                    ))}
                                    {evento.participantes.length > 3 && (
                                        <p className="text-xs text-muted-foreground">
                                            +{evento.participantes.length - 3} más
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    <Separator />

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={handleEdit}
                        >
                            <Edit className="h-3.5 w-3.5 mr-1.5" />
                            Editar
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-destructive hover:text-destructive"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            Eliminar
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
