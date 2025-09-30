import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const sql = getDatabase()

    // Get comprehensive dashboard statistics
    const stats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM conference.events WHERE is_active = true) as total_events,
        (SELECT COUNT(*) FROM conference.attendees) as total_attendees,
        (SELECT COUNT(*) FROM conference.speakers) as total_speakers,
        (SELECT COUNT(*) FROM conference.events WHERE event_type = 'competition' AND is_active = true) as total_competitions,
        (SELECT COUNT(*) FROM conference.sponsors WHERE is_active = true) as total_sponsors,
        (SELECT COUNT(*) FROM conference.attendees WHERE created_at >= NOW() - INTERVAL '24 hours') as recent_registrations
    `

    return NextResponse.json(stats[0])
  } catch (error) {
    console.error("[v0] Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
