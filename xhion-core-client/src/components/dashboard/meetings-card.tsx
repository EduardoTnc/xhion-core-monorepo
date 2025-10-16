import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Video, Users, Calendar } from "lucide-react"

const meetings = [
  {
    id: 1,
    title: "Daily Standup",
    time: "09:00 AM",
    type: "team",
    attendees: 8,
  },
  {
    id: 2,
    title: "Client Presentation",
    time: "02:00 PM",
    type: "client",
    attendees: 4,
  },
  {
    id: 3,
    title: "Sprint Planning",
    time: "04:30 PM",
    type: "planning",
    attendees: 12,
  },
]

export function MeetingsCard() {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg">Reuniones de Hoy</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Video className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{meeting.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {meeting.time}
                  <Users className="ml-2 h-3 w-3" />
                  {meeting.attendees}
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {meeting.type}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
