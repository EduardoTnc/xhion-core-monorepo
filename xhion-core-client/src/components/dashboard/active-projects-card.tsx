"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { name: "Xhion Core", value: 75, color: "hsl(var(--chart-1))" },
  { name: "Website Redesign", value: 45, color: "hsl(var(--chart-2))" },
  { name: "Mobile App", value: 60, color: "hsl(var(--chart-3))" },
  { name: "API Integration", value: 30, color: "hsl(var(--chart-4))" },
]

export function ActiveProjectsCard() {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg">Proyectos Activos</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {data.map((project, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
                <span className="text-muted-foreground">{project.name}</span>
              </div>
              <span className="font-medium">{project.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
