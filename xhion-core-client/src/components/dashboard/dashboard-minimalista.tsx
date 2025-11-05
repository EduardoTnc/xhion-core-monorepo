"use client"

import { GanttChartWidget } from "./gantt-chart-widget"
import { MyDayWidget } from "./my-day-widget"
import { TeamLoadWidget } from "./team-load-widget"
import { AIAssistantWidget } from "./ai-assistant-widget"

/**
 * Dashboard Minimalista - Responsive
 * 
 * Layout principal del dashboard con los 4 widgets estratégicos
 * Optimizado para todas las pantallas (móvil, tablet, desktop)
 * 
 * CORREGIDO: Sin superposiciones, alturas fijas y responsive completo
 */
export function DashboardMinimalista() {
  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Contenedor con scroll */}
      <div className="flex-1 overflow-auto">
        <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
          {/* Fila 1: Diagrama de Gantt - Altura fija */}
          <div className="h-[500px] sm:h-[550px] md:h-[600px]">
            <GanttChartWidget />
          </div>

          {/* Fila 2: Mi Día + Equipo - Stack en móvil, Grid en desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <div className="h-[280px] sm:h-[300px] md:h-[320px]">
              <MyDayWidget />
            </div>
            <div className="h-[280px] sm:h-[300px] md:h-[320px]">
              <TeamLoadWidget />
            </div>
          </div>

          {/* Fila 3: Asistente IA - Full Width */}
          <div className="h-[300px] sm:h-[320px] md:h-[350px]">
            <AIAssistantWidget />
          </div>
        </div>
      </div>
    </div>
  )
}
