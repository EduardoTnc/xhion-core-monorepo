import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Clock } from "lucide-react"

const reminders = [
  { id: 1, text: "Enviar reporte mensual", time: "5:00 PM" },
  { id: 2, text: "Revisar feedback del cliente", time: "Mañana" },
  { id: 3, text: "Actualizar roadmap Q2", time: "Viernes" },
]

export function RemindersCard() {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg">Recordatorios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
                <Bell className="h-4 w-4 text-accent" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{reminder.text}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {reminder.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
