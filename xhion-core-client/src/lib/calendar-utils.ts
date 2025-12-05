import { type Evento } from '@/services/eventosService'
import {
    format,
    isSameDay,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    addDays,
    differenceInMinutes,
    parseISO,
    isWithinInterval,
    startOfDay,
    endOfDay
} from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Get events for a specific date
 */
export function getEventsForDate(eventos: Evento[], date: Date): Evento[] {
    return eventos.filter(evento => {
        const eventoStart = parseISO(evento.fechaInicio)
        const eventoEnd = parseISO(evento.fechaFin)

        // Check if the event occurs on this date
        return isWithinInterval(date, { start: startOfDay(eventoStart), end: endOfDay(eventoEnd) })
    })
}

/**
 * Group events by date
 */
export function groupEventsByDate(eventos: Evento[]): Map<string, Evento[]> {
    const grouped = new Map<string, Evento[]>()

    eventos.forEach(evento => {
        const dateKey = format(parseISO(evento.fechaInicio), 'yyyy-MM-dd')
        const existing = grouped.get(dateKey) || []
        grouped.set(dateKey, [...existing, evento])
    })

    return grouped
}

/**
 * Get week days for a given date
 */
export function getWeekDays(date: Date): Date[] {
    const start = startOfWeek(date, { weekStartsOn: 0 }) // Sunday
    const end = endOfWeek(date, { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
}

/**
 * Format date for calendar header
 */
export function formatCalendarHeader(date: Date, viewMode: 'day' | 'week' | 'month' | 'year'): string {
    switch (viewMode) {
        case 'day':
            return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
        case 'week':
            const weekStart = startOfWeek(date, { weekStartsOn: 0 })
            const weekEnd = endOfWeek(date, { weekStartsOn: 0 })
            return `${format(weekStart, 'd MMM', { locale: es })} - ${format(weekEnd, 'd MMM yyyy', { locale: es })}`
        case 'month':
            return format(date, "MMMM 'de' yyyy", { locale: es })
        case 'year':
            return format(date, 'yyyy')
    }
}

/**
 * Calculate event position and height for timeline views
 */
export function calculateEventPosition(evento: Evento, dayStart: Date): { top: number; height: number } {
    const eventoStart = parseISO(evento.fechaInicio)
    const eventoEnd = parseISO(evento.fechaFin)

    // Minutes from day start
    const minutesFromStart = differenceInMinutes(eventoStart, dayStart)
    const duration = differenceInMinutes(eventoEnd, eventoStart)

    // Each hour is 60px, so each minute is 1px
    const pixelsPerMinute = 1

    return {
        top: minutesFromStart * pixelsPerMinute,
        height: Math.max(duration * pixelsPerMinute, 30) // Minimum 30px height
    }
}

/**
 * Detect overlapping events for proper positioning
 */
export function detectOverlaps(eventos: Evento[]): Map<string, { column: number; totalColumns: number }> {
    const positions = new Map<string, { column: number; totalColumns: number }>()

    // Sort events by start time
    const sorted = [...eventos].sort((a, b) => {
        const aStart = parseISO(a.fechaInicio)
        const bStart = parseISO(b.fechaInicio)
        return aStart.getTime() - bStart.getTime()
    })

    // Group overlapping events
    const groups: Evento[][] = []
    let currentGroup: Evento[] = []

    sorted.forEach((evento, index) => {
        if (index === 0) {
            currentGroup = [evento]
            return
        }

        const eventoStart = parseISO(evento.fechaInicio)
        const prevEventoEnd = parseISO(sorted[index - 1].fechaFin)

        if (eventoStart < prevEventoEnd) {
            // Overlaps with previous
            currentGroup.push(evento)
        } else {
            // New group
            groups.push(currentGroup)
            currentGroup = [evento]
        }
    })

    if (currentGroup.length > 0) {
        groups.push(currentGroup)
    }

    // Assign columns to each event
    groups.forEach(group => {
        const totalColumns = group.length
        group.forEach((evento, index) => {
            positions.set(evento.id, {
                column: index,
                totalColumns
            })
        })
    })

    return positions
}

/**
 * Get color for event type
 */
export function getEventColor(evento: Evento): string {
    if (evento.color) return evento.color

    // Default colors based on type
    switch (evento.tipo) {
        case 'Reunion':
            return '#3b82f6' // blue
        case 'Tarea':
            return '#10b981' // green
        case 'Proyecto':
            return '#8b5cf6' // purple
        case 'Personal':
            return '#f59e0b' // amber
        case 'Recordatorio':
            return '#ef4444' // red
        default:
            return '#6b7280' // gray
    }
}

/**
 * Get text color (white or black) based on background color
 */
export function getContrastColor(hexColor: string): string {
    // Remove # if present
    const hex = hexColor.replace('#', '')

    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

/**
 * Format time range for event display
 */
export function formatEventTimeRange(evento: Evento): string {
    if (evento.todoElDia) {
        return 'Todo el día'
    }

    const start = parseISO(evento.fechaInicio)
    const end = parseISO(evento.fechaFin)

    if (isSameDay(start, end)) {
        return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`
    }

    return `${format(start, 'dd/MM HH:mm')} - ${format(end, 'dd/MM HH:mm')}`
}

/**
 * Check if event is multi-day
 */
export function isMultiDayEvent(evento: Evento): boolean {
    const start = parseISO(evento.fechaInicio)
    const end = parseISO(evento.fechaFin)
    return !isSameDay(start, end)
}

/**
 * Get days calendar should display for month view
 */
export function getMonthCalendarDays(date: Date): Date[] {
    const start = startOfWeek(new Date(date.getFullYear(), date.getMonth(), 1), { weekStartsOn: 0 })
    const end = endOfWeek(new Date(date.getFullYear(), date.getMonth() + 1, 0), { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
}

/**
 * Generate time slots for day/week view (30-minute intervals)
 */
export function generateTimeSlots(): string[] {
    const slots: string[] = []
    for (let hour = 0; hour < 24; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`)
        slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return slots
}

/**
 * Snap time to nearest 15-minute interval
 */
export function snapToInterval(date: Date, intervalMinutes: number = 15): Date {
    const minutes = date.getMinutes()
    const snappedMinutes = Math.round(minutes / intervalMinutes) * intervalMinutes
    const result = new Date(date)
    result.setMinutes(snappedMinutes)
    result.setSeconds(0)
    result.setMilliseconds(0)
    return result
}
