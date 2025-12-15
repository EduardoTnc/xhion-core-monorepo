"use client"

import { useEffect, useRef, useCallback, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import { useCalendarStore } from '@/store/calendarStore'
import { useMoveEvent } from '@/hooks/queries'
import { EventModal } from './event-modal'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import '@/styles/fullcalendar-custom.css'
import type { EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
    Plus,
    RefreshCw,
    Filter,
    Download,
    Calendar,
    CheckSquare,
    FolderKanban,
    AlertCircle,
    Clock,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    LayoutGrid,
    List,
    Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function CalendarFullCalendar() {
    const calendarRef = useRef<FullCalendar>(null)
    const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'>('dayGridMonth')
    const [currentDate, setCurrentDate] = useState(new Date())

    const {
        calendarItems,
        isLoading,
        fetchAllData,
        openCreateEventModal,
        openEditEventModal,
    } = useCalendarStore()

    // TanStack Query mutation for drag/drop
    const moveEventMutation = useMoveEvent()

    // Load data on mount
    useEffect(() => {
        fetchAllData()
    }, [fetchAllData])

    // Count items by type
    const itemCounts = {
        events: calendarItems.filter(i => i.type === 'event').length,
        tasks: calendarItems.filter(i => i.type === 'task').length,
        projects: calendarItems.filter(i => i.type === 'project').length,
        urgent: calendarItems.filter(i => i.type === 'task' && i.tarea?.prioridad?.toLowerCase() === 'urgente').length,
    }

    // Convert calendar items to FullCalendar events
    const events = calendarItems.map(item => {
        let className = `event-type-${item.type}`

        // Add priority class for tasks
        if (item.type === 'task' && item.tarea) {
            className += ` priority-${item.tarea.prioridad?.toLowerCase() || 'baja'}`
        }

        return {
            id: item.id,
            title: item.title,
            start: item.startDate,
            end: item.endDate,
            allDay: item.allDay,
            backgroundColor: item.color,
            borderColor: item.color,
            className,
            extendedProps: {
                type: item.type,
                description: item.description,
                originalItem: item,
            },
        }
    })

    // Handle event click
    const handleEventClick = useCallback((info: EventClickArg) => {
        const { originalItem } = info.event.extendedProps

        // Only open edit modal for events, not tasks/projects
        if (originalItem.type === 'event' && originalItem.evento) {
            openEditEventModal(originalItem.evento)
        }
    }, [openEditEventModal])

    // Handle date select (click on empty space)
    const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
        const calendarApi = selectInfo.view.calendar
        calendarApi.unselect() // Clear selection

        openCreateEventModal(selectInfo.start)
    }, [openCreateEventModal])

    // Handle event drop (drag & drop)
    const handleEventDrop = useCallback(async (info: EventDropArg) => {
        const { originalItem } = info.event.extendedProps

        // Only allow dragging events, not tasks/projects
        if (originalItem.type !== 'event' || !originalItem.evento) {
            info.revert()
            return
        }

        try {
            const newStart = info.event.start
            const newEnd = info.event.end || info.event.start

            // Ensure dates are not null before formatting
            if (!newStart || !newEnd) {
                info.revert()
                return
            }

            await moveEventMutation.mutateAsync({
                eventId: originalItem.evento.id,
                fechaInicio: format(newStart, 'yyyy-MM-dd\'T\'HH:mm:ss'),
                fechaFin: format(newEnd, 'yyyy-MM-dd\'T\'HH:mm:ss'),
            })
        } catch (error) {
            info.revert()
        }
    }, [moveEventMutation])

    // Navigation handlers
    const handlePrev = () => {
        calendarRef.current?.getApi().prev()
        setCurrentDate(calendarRef.current?.getApi().getDate() || new Date())
    }

    const handleNext = () => {
        calendarRef.current?.getApi().next()
        setCurrentDate(calendarRef.current?.getApi().getDate() || new Date())
    }

    const handleToday = () => {
        calendarRef.current?.getApi().today()
        setCurrentDate(new Date())
    }

    const handleViewChange = (view: typeof currentView) => {
        setCurrentView(view)
        calendarRef.current?.getApi().changeView(view)
    }

    const handleRefresh = () => {
        fetchAllData()
    }

    // Format current title
    const getTitle = () => {
        const api = calendarRef.current?.getApi()
        if (api) {
            return api.view.title
        }
        return format(currentDate, 'MMMM yyyy', { locale: es })
    }

    return (
        <div className="h-full flex flex-col p-4 lg:p-6 gap-4">
            {/* Header Card with Controls */}
            <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left: Navigation */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-secondary/50 rounded-lg p-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={handlePrev}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 font-medium"
                                onClick={handleToday}
                            >
                                Hoy
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={handleNext}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <h2 className="text-xl font-semibold text-foreground capitalize ml-2">
                            {getTitle()}
                        </h2>
                    </div>

                    {/* Center: View Toggles */}
                    <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={currentView === 'dayGridMonth' ? 'default' : 'ghost'}
                                        size="sm"
                                        className={cn(
                                            "h-8 gap-1.5",
                                            currentView === 'dayGridMonth' && "bg-[#FFBF00] text-black hover:bg-[#FFBF00]/90"
                                        )}
                                        onClick={() => handleViewChange('dayGridMonth')}
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                        <span className="hidden sm:inline">Mes</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Vista mensual</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={currentView === 'timeGridWeek' ? 'default' : 'ghost'}
                                        size="sm"
                                        className={cn(
                                            "h-8 gap-1.5",
                                            currentView === 'timeGridWeek' && "bg-[#FFBF00] text-black hover:bg-[#FFBF00]/90"
                                        )}
                                        onClick={() => handleViewChange('timeGridWeek')}
                                    >
                                        <CalendarDays className="h-4 w-4" />
                                        <span className="hidden sm:inline">Semana</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Vista semanal</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={currentView === 'timeGridDay' ? 'default' : 'ghost'}
                                        size="sm"
                                        className={cn(
                                            "h-8 gap-1.5",
                                            currentView === 'timeGridDay' && "bg-[#FFBF00] text-black hover:bg-[#FFBF00]/90"
                                        )}
                                        onClick={() => handleViewChange('timeGridDay')}
                                    >
                                        <Calendar className="h-4 w-4" />
                                        <span className="hidden sm:inline">Día</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Vista diaria</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={currentView === 'listWeek' ? 'default' : 'ghost'}
                                        size="sm"
                                        className={cn(
                                            "h-8 gap-1.5",
                                            currentView === 'listWeek' && "bg-[#FFBF00] text-black hover:bg-[#FFBF00]/90"
                                        )}
                                        onClick={() => handleViewChange('listWeek')}
                                    >
                                        <List className="h-4 w-4" />
                                        <span className="hidden sm:inline">Lista</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Vista de lista</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-9 w-9"
                                        onClick={handleRefresh}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <RefreshCw className="h-4 w-4" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Actualizar calendario</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <Button
                            className="h-9 gap-2 bg-[#FFBF00] text-black hover:bg-[#FFBF00]/90"
                            onClick={() => openCreateEventModal(new Date())}
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Nuevo Evento</span>
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Stats and Legend Row */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Stats Cards */}
                <div className="flex flex-wrap gap-2">
                    <Card className="flex items-center gap-2 px-3 py-2 border-border/50 bg-card/50">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#FFBF00]" />
                        <span className="text-sm text-muted-foreground">Eventos</span>
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs font-semibold">
                            {itemCounts.events}
                        </Badge>
                    </Card>

                    <Card className="flex items-center gap-2 px-3 py-2 border-border/50 bg-card/50">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <span className="text-sm text-muted-foreground">Tareas</span>
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs font-semibold">
                            {itemCounts.tasks}
                        </Badge>
                    </Card>

                    <Card className="flex items-center gap-2 px-3 py-2 border-border/50 bg-card/50">
                        <div className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                        <span className="text-sm text-muted-foreground">Proyectos</span>
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs font-semibold">
                            {itemCounts.projects}
                        </Badge>
                    </Card>

                    {itemCounts.urgent > 0 && (
                        <Card className="flex items-center gap-2 px-3 py-2 border-red-500/30 bg-red-500/10">
                            <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                            <span className="text-sm text-red-500 font-medium">Urgentes</span>
                            <Badge variant="destructive" className="h-5 px-1.5 text-xs font-semibold">
                                {itemCounts.urgent}
                            </Badge>
                        </Card>
                    )}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 ml-auto text-xs text-muted-foreground">
                    <span className="hidden lg:inline font-medium">Leyenda:</span>
                    <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded bg-gradient-to-br from-[#FFBF00] to-[#F9A825]" />
                        <span>Eventos</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded bg-gradient-to-br from-emerald-500 to-emerald-600" />
                        <span>Tareas</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded bg-gradient-to-br from-violet-500 to-violet-600" />
                        <span>Proyectos</span>
                    </div>
                    <div className="hidden md:flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded bg-gradient-to-br from-red-500 to-red-600" />
                        <span>Urgente</span>
                    </div>
                    <div className="hidden md:flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded bg-gradient-to-br from-orange-500 to-orange-600" />
                        <span>Alta</span>
                    </div>
                </div>
            </div>

            {/* Calendar Card */}
            <Card className="flex-1 overflow-hidden border-border/50 bg-card/30 backdrop-blur-sm">
                <div className="h-full overflow-auto calendar-container">
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                        initialView={currentView}
                        headerToolbar={false} // We use custom header
                        events={events}
                        editable={true}
                        selectable={true}
                        selectMirror={true}
                        dayMaxEvents={3}
                        weekends={true}
                        height="100%"
                        locale="es"
                        slotMinTime="06:00:00"
                        slotMaxTime="22:00:00"
                        allDaySlot={true}
                        nowIndicator={true}
                        eventClick={handleEventClick}
                        select={handleDateSelect}
                        eventDrop={handleEventDrop}
                        datesSet={(dateInfo) => {
                            setCurrentDate(dateInfo.view.currentStart)
                        }}
                        eventContent={(arg) => {
                            const { type } = arg.event.extendedProps
                            let icon = ''

                            if (type === 'task') icon = '📋 '
                            else if (type === 'project') icon = '🎯 '
                            else icon = '📅 '

                            return (
                                <div className="fc-event-main-frame overflow-hidden">
                                    {arg.timeText && (
                                        <div className="fc-event-time">{arg.timeText}</div>
                                    )}
                                    <div className="fc-event-title-container">
                                        <div className="fc-event-title fc-sticky truncate">
                                            {icon}{arg.event.title}
                                        </div>
                                    </div>
                                </div>
                            )
                        }}
                    />
                </div>
            </Card>

            {/* Footer Info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Última actualización: {format(new Date(), 'HH:mm', { locale: es })}</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>{calendarItems.length} elementos en total</span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="hidden sm:inline">Haz clic en una fecha vacía para crear un evento</span>
                    <span className="sm:hidden">Clic para crear evento</span>
                </div>
            </div>

            {/* Event Modal */}
            <EventModal />
        </div>
    )
}
