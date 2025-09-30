import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const speakers = await sql`
      SELECT 
        s.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', e.id,
              'name', e.name,
              'event_type', e.event_type,
              'start_time', e.start_time,
              'end_time', e.end_time,
              'location', e.location
            )
          ) FILTER (WHERE e.id IS NOT NULL), 
          '[]'
        ) as events
      FROM conference.speakers s
      LEFT JOIN conference.event_speakers es ON s.id = es.speaker_id
      LEFT JOIN conference.events e ON es.event_id = e.id AND e.is_active = true
      GROUP BY s.id
      ORDER BY s.name
    `

    return Response.json(speakers)
  } catch (error) {
    console.error("Error fetching speakers:", error)
    return Response.json({ error: "Failed to fetch speakers" }, { status: 500 })
  }
}
