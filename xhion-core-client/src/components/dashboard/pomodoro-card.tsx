"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, SkipForward } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function PomodoroCard() {
  const [isRunning, setIsRunning] = useState(false)
  const progress = 65

  return (
    <Card className="bg-card border-transparent">
      <CardHeader>
        <CardTitle className="text-lg">Pomodoro</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold tabular-nums text-foreground">15:30</div>
          <p className="mt-2 text-sm text-muted-foreground">Diseñar interfaz de usuario</p>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex items-center justify-center gap-2">
          <Button size="icon" variant="outline" onClick={() => setIsRunning(!isRunning)}>
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button size="icon" variant="outline">
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
