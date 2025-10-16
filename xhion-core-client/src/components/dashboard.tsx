import { PomodoroCard } from "@/components/dashboard/pomodoro-card"
import { TodayTasksCard } from "@/components/dashboard/today-tasks-card"
import { MeetingsCard } from "@/components/dashboard/meetings-card"
import { WeeklyActivityCard } from "@/components/dashboard/weekly-activity-card"
import { ActiveProjectsCard } from "@/components/dashboard/active-projects-card"
import { RemindersCard } from "@/components/dashboard/reminders-card"
import { CalendarCard } from "@/components/dashboard/calendar-card"
import { AIInsightsCard } from "@/components/dashboard/ai-insights-card"

export function Dashboard() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-4 md:mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
        <p className="text-sm md:text-base text-muted-foreground">Bienvenido de nuevo. Aquí está tu resumen de hoy.</p>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Row 1 - Stack on mobile, 2 cols on tablet, 3 on desktop */}
        <PomodoroCard />
        <TodayTasksCard />
        <MeetingsCard />

        {/* Row 2 */}
        <WeeklyActivityCard />
        <ActiveProjectsCard />
        <RemindersCard />

        {/* Row 3 - Full width sections, responsive columns */}
        <div className="md:col-span-2 lg:col-span-2">
          <CalendarCard />
        </div>
        <AIInsightsCard />
      </div>
    </div>
  )
}
