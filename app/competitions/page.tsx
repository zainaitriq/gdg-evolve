import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getDatabase } from "@/lib/database"
import { WorkshopRegistrationModal } from "@/components/workshop-registration-modal"

export const metadata: Metadata = {
  title: "Competitions | Evolve Conference 2025",
  description: "Join exciting tech competitions at Evolve Conference 2025. Compete for prizes and recognition.",
}

async function getCompetitions() {
  try {
    const sql = getDatabase()
    const competitions = await sql`
      SELECT 
        e.*,
        COALESCE(speaker_names.names, '[]'::json) as speakers
      FROM conference.events e
      LEFT JOIN (
        SELECT es.event_id, 
               json_agg(json_build_object('name', s.name, 'title', s.title, 'company', s.company, 'bio', s.bio)) as names
        FROM conference.event_speakers es
        JOIN conference.speakers s ON es.speaker_id = s.id
        GROUP BY es.event_id
      ) speaker_names ON e.id = speaker_names.event_id
      WHERE e.event_type = 'competition' AND e.is_active = true
      ORDER BY e.start_time
    `
    return Array.isArray(competitions) ? competitions : []
  } catch (error) {
    console.error("Error fetching competitions:", error)
    return []
  }
}

export default async function CompetitionsPage() {
  const competitions = await getCompetitions()
  const competitionsArray = Array.isArray(competitions) ? competitions : []

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Competitions</h1>
          <p className="text-lg text-muted-foreground">
            Test your skills in exciting tech challenges and compete for amazing prizes.
          </p>
        </div>

        <div className="grid gap-8">
          {competitionsArray.map((competition) => (
            <Card key={competition.id} className="overflow-hidden border-red-200">
              <CardHeader className="bg-transparent">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xl">🏆</span>
                      <CardTitle className="text-xl sm:text-2xl break-words">{competition.name}</CardTitle>
                      <Badge className="bg-red-100 text-red-800 text-xs">Competition</Badge>
                      {competition.speakers.length > 0 && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                          Speakers
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-sm sm:text-base">{competition.description}</CardDescription>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 justify-between sm:justify-start shrink-0">
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <span className="mr-1">🎯</span>
                      <span className="whitespace-nowrap">
                        {competition.current_registrations}/{competition.capacity} teams
                      </span>
                    </div>
                    <Badge
                      variant={competition.current_registrations >= competition.capacity ? "destructive" : "default"}
                      className="text-xs whitespace-nowrap"
                    >
                      {competition.current_registrations >= competition.capacity ? "Full" : "Open"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
                  <div className="flex items-center text-gray-600 text-sm">
                    <span className="mr-2">🕒</span>
                    <span className="break-words">
                      {new Date(competition.date).toLocaleDateString()} • {competition.start_time} -{" "}
                      {competition.end_time}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <span className="mr-2">📍</span>
                    <span className="break-words">{competition.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <span className="mr-2">👥</span>
                    <span className="whitespace-nowrap">Max {competition.capacity} teams</span>
                  </div>
                </div>

                {competition.speakers.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">👥</span>
                      <h3 className="font-semibold text-blue-800">Speakers</h3>
                    </div>
                    <ul className="space-y-1">
                      {competition.speakers.map((speaker: any, index: number) => (
                        <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                          <span className="text-google-blue mt-1">•</span>
                          <span>{speaker.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {competition.prerequisites && competition.prerequisites.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">⚠️</span>
                      <h3 className="font-semibold text-blue-800">Prerequisites</h3>
                    </div>
                    <ul className="space-y-1">
                      {competition.prerequisites.map((prerequisite: string, index: number) => (
                        <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                          <span className="text-google-blue mt-1">•</span>
                          <span>{prerequisite}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {competition.rules && competition.rules.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">✅</span>
                      <h3 className="font-semibold text-green-800">Competition Rules</h3>
                    </div>
                    <ul className="space-y-1">
                      {competition.rules.map((rule: string, index: number) => (
                        <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                          <span className="text-google-green mt-1">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-yellow-800 mb-2">Competition Format</h3>
                  <div className="space-y-2 text-sm text-yellow-700">
                    {competition.requires_team ? (
                      <p>
                        <strong>Team Competition:</strong> Teams of {competition.min_team_size}
                        {competition.min_team_size !== competition.max_team_size && `-${competition.max_team_size}`}{" "}
                        participants will compete in this challenge.
                      </p>
                    ) : (
                      <p>
                        <strong>Individual Competition:</strong> Participants will compete individually.
                      </p>
                    )}
                    <p>
                      <strong>Capacity:</strong> Maximum {competition.capacity}{" "}
                      {competition.requires_team ? "teams" : "participants"}
                    </p>
                    {competition.rules && competition.rules.length > 0 && (
                      <p>
                        <strong>Additional Info:</strong> Please review the competition rules below for complete
                        details.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <WorkshopRegistrationModal
                    workshop={{
                      id: competition.id,
                      name: competition.name,
                      description: competition.description,
                      date: competition.date,
                      start_time: competition.start_time,
                      end_time: competition.end_time,
                      location: competition.location,
                      capacity: competition.capacity,
                      current_registrations: competition.current_registrations,
                      event_type: competition.event_type,
                      requires_team: competition.requires_team,
                      min_team_size: competition.min_team_size,
                      max_team_size: competition.max_team_size,
                    }}
                    trigger={
                      <Button
                        className="bg-red-600 hover:bg-red-700"
                        disabled={competition.current_registrations >= competition.capacity}
                      >
                        {competition.current_registrations >= competition.capacity
                          ? "Competition Full"
                          : competition.requires_team
                            ? "Register Team"
                            : "Join Competition"}
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {competitionsArray.length === 0 && (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">🏆</span>
            <p className="text-muted-foreground">No competitions available at this time.</p>
          </div>
        )}
      </div>
    </div>
  )
}
