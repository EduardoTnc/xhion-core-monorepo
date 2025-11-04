"use client"

import { LiveTimelineWidget } from "./live-timeline-widget"
import { MyDayWidget } from "./my-day-widget"
import { TeamLoadWidget } from "./team-load-widget"
import { AIAssistantWidget } from "./ai-assistant-widget"

/**
 * Dashboard Minimalista
 * 
 * Dashboard principal con 4 widgets estratégicos que proporcionan
 * visión de pájaro completa de todos los proyectos y el equipo.
 * 
 * Filosofía: "Menos es Más - Visión de Pájaro Total"
 * 
 * Widgets:
 * 1. Cronograma Vivo (70% espacio) - Timeline maestro con toda la información
 * 2. Mi Día (15% espacio) - Centro de comando personal
 * 3. Equipo (15% espacio) - Mapa de carga en tiempo real
 * 4. Asistente IA (full width) - Sugerencias inteligentes y búsqueda
 */
export function DashboardMinimalista() {
  return (
    <div className="p-4 md:p-6 lg:p-8 h-full">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Dashboard Principal
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Visión de pájaro completa - Pasado, Presente y Futuro
        </p>
      </div>

      {/* Grid Principal */}
      <div className="grid gap-4 md:gap-6 h-[calc(100%-5rem)]">
        {/* Fila 1: Cronograma Vivo (Principal) */}
        <div className="row-span-2">
          <LiveTimelineWidget />
        </div>

        {/* Fila 2: Mi Día + Equipo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <MyDayWidget />
          <TeamLoadWidget />
        </div>

        {/* Fila 3: Asistente IA (Full Width) */}
        <div className="min-h-[300px]">
          <AIAssistantWidget />
        </div>
      </div>
    </div>
  )
}
