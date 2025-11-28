import { type Tarea } from "@/services/taskService"

interface TasksCalendarProps {
  tasks: Tarea[]
}

export function TasksCalendar({ tasks }: TasksCalendarProps) {
  return (
    <div className="flex h-full items-center justify-center text-muted-foreground">
      <div className="text-center">
        <p>Vista de calendario en desarrollo</p>
        <p className="text-sm mt-2">{tasks.length} tareas cargadas</p>
      </div>
    </div>
  )
}
