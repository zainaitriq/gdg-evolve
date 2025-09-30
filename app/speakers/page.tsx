import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getDatabase } from "@/lib/database"

export const metadata: Metadata = {
  title: "Speakers | Evolve Conference 2025",
  description: "Meet the amazing speakers at Evolve Conference 2025. Industry experts and thought leaders.",
}

async function getSpeakers() {
  try {
    const sql = await getDatabase()
    const speakers = await sql`
      SELECT 
        s.*,
        json_agg(
          json_build_object(
            'event_name', e.name,
            'event_type', e.event_type,
            'date', e.date,
            'start_time', e.start_time
          ) ORDER BY e.date, e.start_time
        ) FILTER (WHERE e.id IS NOT NULL) as events
      FROM conference.speakers s
      LEFT JOIN conference.event_speakers es ON s.id = es.speaker_id
      LEFT JOIN conference.events e ON es.event_id = e.id AND e.is_active = true
      GROUP BY s.id
      ORDER BY s.name
    `
    return Array.isArray(speakers) ? speakers : []
  } catch (error) {
    console.error("Error fetching speakers:", error)
    return []
  }
}

export default async function SpeakersPage() {
  const speakers = await getSpeakers()

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "session":
        return "bg-blue-100 text-blue-800"
      case "workshop":
        return "bg-green-100 text-green-800"
      case "competition":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Speakers & Instructors</h1>
          <p className="text-lg text-muted-foreground">
            Meet the amazing speakers & instructors who will share their expertise and insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {speakers.map((speaker) => (
            <Card key={speaker.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    {speaker.image_url ? (
                      <img
                        src={speaker.image_url || "/placeholder.svg"}
                        alt={speaker.name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">👤</span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{speaker.name}</h3>
                  <p className="text-gray-600 mb-2">{speaker.title}</p>
                  <p className="text-sm text-gray-500 mb-4">{speaker.company}</p>
                </div>

                {speaker.bio && <p className="text-sm text-gray-600 mb-4 line-clamp-3">{speaker.bio}</p>}

                {speaker.events && speaker.events.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Speaking at:</p>
                    <div className="space-y-2">
                      {speaker.events.map((event: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 truncate flex-1">{event.event_name}</span>
                          <Badge className={getEventTypeColor(event.event_type)} variant="outline">
                            {event.event_type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-center space-x-3">
                  {speaker.linkedin_url && (
                    <a
                      href={speaker.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      aria-label="LinkedIn Profile"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  )}
                  {speaker.twitter_url && (
                    <a
                      href={speaker.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-600 transition-colors"
                      aria-label="Twitter/X Profile"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {speakers.length === 0 && (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">👤</span>
            <p className="text-muted-foreground">Speaker lineup coming soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}
