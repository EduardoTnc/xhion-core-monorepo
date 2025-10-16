"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
const currentMonth = [
  [null, null, null, 1, 2, 3, 4],
  [5, 6, 7, 8, 9, 10, 11],
  [12, 13, 14, 15, 16, 17, 18],
  [19, 20, 21, 22, 23, 24, 25],
  [26, 27, 28, 29, 30, 31, null],
]

const eventsOnDay = [7, 15, 22, 28]

export function CalendarCard() {
  return (
    <Card className="bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Calendario de Proyectos</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">Enero 2025</span>
            <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          {currentMonth.flat().map((day, index) => (
            <div
              key={index}
              className={`flex h-10 items-center justify-center rounded-lg text-sm transition-colors ${
                day === null
                  ? "text-muted-foreground/30"
                  : day === 7
                    ? "bg-primary text-primary-foreground font-medium"
                    : eventsOnDay.includes(day)
                      ? "bg-accent/20 text-accent-foreground font-medium hover:bg-accent/30 cursor-pointer"
                      : "hover:bg-accent/10 cursor-pointer"
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
