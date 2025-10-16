"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  { day: "Lun", completed: 12, total: 15 },
  { day: "Mar", completed: 15, total: 15 },
  { day: "Mié", completed: 10, total: 14 },
  { day: "Jue", completed: 14, total: 16 },
  { day: "Vie", completed: 8, total: 12 },
  { day: "Sáb", completed: 5, total: 8 },
  { day: "Dom", completed: 3, total: 5 },
]

export function WeeklyActivityCard() {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg">Actividad Semanal</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <XAxis
              dataKey="day"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Cumplimiento promedio</span>
          <span className="font-bold text-primary">87%</span>
        </div>
      </CardContent>
    </Card>
  )
}
