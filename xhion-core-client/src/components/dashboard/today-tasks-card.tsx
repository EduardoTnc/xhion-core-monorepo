import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

const tasks = [
  { id: 1, title: "Revisar propuesta de diseño", priority: "high", completed: false },
  { id: 2, title: "Actualizar documentación", priority: "medium", completed: true },
  { id: 3, title: "Llamada con cliente", priority: "high", completed: false },
  { id: 4, title: "Code review PR #234", priority: "low", completed: false },
]

export function TodayTasksCard() {
  return (
    <Card className="bg-card border-background">
      <CardHeader>
        <CardTitle className="text-lg">Tareas de Hoy</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start gap-3">
              <Checkbox id={`task-${task.id}`} checked={task.completed} className="mt-1" />
              <div className="flex-1 space-y-1">
                <label
                  htmlFor={`task-${task.id}`}
                  className={`text-sm font-medium leading-none ${
                    task.completed ? "text-muted-foreground line-through" : ""
                  }`}
                >
                  {task.title}
                </label>
                <Badge
                  variant={
                    task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"
                  }
                  className="text-xs"
                >
                  {task.priority}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
