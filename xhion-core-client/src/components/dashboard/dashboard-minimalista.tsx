import { GanttChartProfessional } from "./gantt-chart-professional"
import { MyDayWidget } from "./my-day-widget"
import { AIAssistantWidget } from "./ai-assistant-widget"

/**
 * Dashboard Minimalista - Responsive v3.0
 * 
 * Layout principal del dashboard con 3 widgets estratégicos
 * Optimizado para todas las pantallas (móvil, tablet, desktop)
 * 
 * ACTUALIZADO v3.0: 
 * - Gantt Chart Profesional con Frappe Gantt (librería open source)
 * - Drag & drop interactivo
 * - Múltiples vistas (día, semana, mes)
 * - Filtros avanzados por departamento y estado
 * - Exportación a imagen
 * - Estadísticas en tiempo real
 * - Tooltips personalizados
 * - Navegación directa a proyectos
 */
export function DashboardMinimalista() {
  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Contenedor con scroll */}
      <div className="flex-1 overflow-auto">
        <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
          {/* Fila 1: Diagrama de Gantt Profesional - Altura optimizada */}
          <div className="h-[550px] sm:h-[600px] md:h-[650px]">
            <GanttChartProfessional />
          </div>

          {/* Fila 2: Mi Día + Asistente IA - Grid responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {/* Mi Día - Widget de tareas personales */}
            <div className="h-[320px] sm:h-[340px] md:h-[360px]">
              <MyDayWidget />
            </div>

            {/* Asistente IA - Sugerencias inteligentes */}
            <div className="h-[320px] sm:h-[340px] md:h-[360px]">
              <AIAssistantWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
