import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, User } from "lucide-react"
import { getEvents } from "@/lib/database"

const levelColors = {
  Beginner: "bg-green-100 text-green-800",
  Intermediate: "bg-yellow-100 text-yellow-800",
  Advanced: "bg-red-100 text-red-800",
}

export async function AgendaPreview() {
  const events = await getEvents()

  const previewSessions = events.slice(0, 3).map((event) => ({
    id: event.id,
    title: event.name,
    speaker: event.speakers && event.speakers.length > 0 ? event.speakers[0].name : "TBA",
    time: `${event.start_time ? event.start_time.slice(0, 5) : "TBA"} - ${event.end_time ? event.end_time.slice(0, 5) : "TBA"}`,
    room: event.location || "TBA",
    track: event.event_type || "General",
    level: "Intermediate", // Default level since not in database
  }))

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Conference Agenda</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover cutting-edge sessions, hands-on workshops, and exciting competitions designed to elevate your tech
            skills.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {previewSessions.map((session) => (
            <Card key={session.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge variant="outline" className="mb-2">
                    {session.track}
                  </Badge>
                 
                </div>
                <CardTitle className="text-lg leading-tight">{session.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4 text-google-yellow" />
                  <span>{session.speaker}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-google-blue" />
                  <span>{session.time}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-google-red" />
                  <span>{session.room}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center bg-white bg-white">
          <Button asChild size="lg" variant="outline">
            <Link href="/agenda">View Complete Agenda</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
