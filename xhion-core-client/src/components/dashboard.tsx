import { GanttChartProfessional } from "@/components/dashboard/gantt-chart-professional"

/**
 * Dashboard Principal
 * 
 * Componente principal que renderiza el dashboard minimalista
 * con visión de pájaro completa de todos los proyectos.
 */
export function Dashboard() {
  return (
    <div className="h-full flex flex-col p-2 md:p-4">
      <GanttChartProfessional />
    </div>
  )
}
