/**
 * Utilidades para manejo de fechas en el contexto de IA
 * Zona horaria: America/Lima (Perú)
 */
export class DateUtils {
    private static readonly TIMEZONE = 'America/Lima'
    private static readonly LOCALE = 'es-PE'

    /**
     * Obtiene la fecha actual en la zona horaria de Perú
     */
    static getCurrentDate(): Date {
        return new Date()
    }

    /**
     * Formatea fecha para mostrar a la IA en español peruano
     */
    static formatForAI(date: Date = new Date()): string {
        const formatter = new Intl.DateTimeFormat(this.LOCALE, {
            timeZone: this.TIMEZONE,
            dateStyle: 'full',
            timeStyle: 'short',
        })
        return formatter.format(date)
    }

    /**
     * Formatea solo la fecha (sin hora)
     */
    static formatDateOnly(date: Date): string {
        const formatter = new Intl.DateTimeFormat(this.LOCALE, {
            timeZone: this.TIMEZONE,
            dateStyle: 'long',
        })
        return formatter.format(date)
    }

    /**
     * Obtiene el nombre del día de la semana
     */
    static getWeekdayName(date: Date = new Date()): string {
        const formatter = new Intl.DateTimeFormat(this.LOCALE, {
            timeZone: this.TIMEZONE,
            weekday: 'long',
        })
        return formatter.format(date)
    }

    /**
     * Calcula inicio y fin del día en la zona horaria de Perú
     */
    static getDayRange(date: Date = new Date()): { start: Date; end: Date } {
        const start = new Date(date)
        start.setHours(0, 0, 0, 0)
        const end = new Date(date)
        end.setHours(23, 59, 59, 999)
        return { start, end }
    }

    /**
     * Calcula inicio y fin de la semana (domingo a sábado)
     */
    static getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
        const start = new Date(date)
        const dayOfWeek = start.getDay()
        start.setDate(date.getDate() - dayOfWeek)
        start.setHours(0, 0, 0, 0)

        const end = new Date(start)
        end.setDate(start.getDate() + 6)
        end.setHours(23, 59, 59, 999)

        return { start, end }
    }

    /**
     * Calcula inicio y fin del mes
     */
    static getMonthRange(date: Date = new Date()): { start: Date; end: Date } {
        const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
        return { start, end }
    }

    /**
     * Verifica si una fecha es hoy
     */
    static isToday(date: Date): boolean {
        const today = new Date()
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        )
    }

    /**
     * Verifica si una fecha está en esta semana
     */
    static isThisWeek(date: Date): boolean {
        const { start, end } = this.getWeekRange()
        return date >= start && date <= end
    }

    /**
     * Verifica si una fecha está en este mes
     */
    static isThisMonth(date: Date): boolean {
        const today = new Date()
        return (
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        )
    }

    /**
     * Verifica si una fecha ya pasó (está vencida)
     */
    static isPast(date: Date): boolean {
        return date < new Date()
    }

    /**
     * Obtiene información temporal completa para el prompt de IA
     */
    static getTemporalContext(): {
        currentDateTime: string
        currentDateISO: string
        weekday: string
        timezone: string
        todayRange: { start: Date; end: Date }
        weekRange: { start: Date; end: Date }
        monthRange: { start: Date; end: Date }
    } {
        const now = new Date()
        return {
            currentDateTime: this.formatForAI(now),
            currentDateISO: now.toISOString(),
            weekday: this.getWeekdayName(now),
            timezone: this.TIMEZONE,
            todayRange: this.getDayRange(now),
            weekRange: this.getWeekRange(now),
            monthRange: this.getMonthRange(now),
        }
    }

    /**
     * Formatea un rango de fechas para mostrar
     */
    static formatRange(start: Date, end: Date): string {
        return `${this.formatDateOnly(start)} - ${this.formatDateOnly(end)}`
    }
}
