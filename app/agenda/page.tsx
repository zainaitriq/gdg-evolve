import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getDatabase } from "@/lib/database"

export const metadata: Metadata = {
  title: "Agenda | Evolve Conference 2025",
  description: "View the complete agenda for Evolve Conference 2025. Sessions, workshops, and competitions schedule.",
}

async function getAgenda() {
  try {
    const sql = getDatabase()
    const events = await sql`
      SELECT 
        e.*,
        COALESCE(speaker_names.names, '[]'::json) as speakers
      FROM conference.events e
      LEFT JOIN (
        SELECT es.event_id, 
               json_agg(json_build_object('name', s.name, 'title', s.title, 'company', s.company)) as names
        FROM conference.event_speakers es
        JOIN conference.speakers s ON es.speaker_id = s.id
        GROUP BY es.event_id
      ) speaker_names ON e.id = speaker_names.event_id
      WHERE e.is_active = true
      ORDER BY e.date, e.start_time
    `
    return events
  } catch (error) {
    console.error("Error fetching agenda:", error)
    return []
  }
}

export default async function AgendaPage() {
  const events = await getAgenda()
  const eventsArray = Array.isArray(events) ? events : []

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "session":
        return "bg-primary/10 text-primary border-primary/20"
      case "workshop":
        return "bg-accent/10 text-accent border-accent/20"
      case "competition":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "session":
        return "🎤"
      case "workshop":
        return "🛠️"
      case "competition":
        return "🏆"
      default:
        return "📅"
    }
  }

  // Group events by date
  const eventsByDate = eventsArray.reduce((acc: any, event) => {
    const date = event.date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(event)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-primary">Conference Agenda</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Complete schedule of sessions, workshops, and competitions for September 13, 2025.
            </p>
          </div>

          <div className="space-y-12">
            {Object.entries(eventsByDate).map(([date, dateEvents]: [string, any]) => (
              <div key={date} className="relative">
                <div className="hidden md:block absolute left-8 top-16 bottom-0 w-0.5 bg-border"></div>

                {/* Date header */}
                <div className="flex items-center mb-8">
                  <div className="bg-primary text-primary-foreground px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold text-base md:text-lg shadow-lg">
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>

                <div className="space-y-6 md:ml-20">
                  {dateEvents.map((event: any, index: number) => (
                    <div key={event.id} className="relative">
                      <div className="hidden md:block absolute -left-[4.25rem] top-6 w-4 h-4 bg-primary rounded-full border-4 border-background shadow-lg"></div>

                      {/* Event card */}
                      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/30 bg-card">
                        <CardHeader className="pb-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <span className="text-xl sm:text-2xl">{getEventIcon(event.event_type)}</span>
                                  <CardTitle className="text-lg sm:text-xl font-bold text-card-foreground break-words">
                                    {event.name}
                                  </CardTitle>
                                </div>
                                <Badge
                                  className={`${getEventTypeColor(event.event_type)} font-medium self-start sm:self-auto`}
                                >
                                  {event.event_type}
                                </Badge>
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <span className="text-base sm:text-lg">🕐</span>
                                  <span className="font-medium text-sm sm:text-base">
                                    {event.start_time} - {event.end_time}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-base sm:text-lg">📍</span>
                                  <span className="font-medium text-sm sm:text-base">{event.location}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                          <p className="text-card-foreground mb-4 leading-relaxed text-sm sm:text-base">
                            {event.description}
                          </p>

                          {/* Speakers */}
                          {event.speakers && event.speakers.length > 0 && (
                            <div className="bg-muted rounded-lg p-3 sm:p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-base sm:text-lg">👤</span>
                                <span className="font-semibold text-muted-foreground text-sm sm:text-base">
                                  Speakers
                                </span>
                              </div>
                              <div className="space-y-1">
                                {event.speakers.map((speaker: any, speakerIndex: number) => (
                                  <div key={speakerIndex} className="text-xs sm:text-sm">
                                    <span className="font-medium text-card-foreground">{speaker.name}</span>
                                    {speaker.company && (
                                      <span className="text-muted-foreground ml-2">• {speaker.company}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {eventsArray.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-muted rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl sm:text-4xl">🕐</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-card-foreground mb-2">Agenda Coming Soon</h3>
              <p className="text-muted-foreground text-base sm:text-lg">Full agenda will be available soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
