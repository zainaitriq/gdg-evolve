import { neon } from "@neondatabase/serverless"
import type { NextRequest } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get("type")

    if (type) {
      const events = await sql`
        SELECT 
          e.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', s.id,
                'name', s.name,
                'title', s.title,
                'company', s.company,
                'image_url', s.image_url
              )
            ) FILTER (WHERE s.id IS NOT NULL), 
            '[]'
          ) as speakers
        FROM conference.events e
        LEFT JOIN conference.event_speakers es ON e.id = es.event_id
        LEFT JOIN conference.speakers s ON es.speaker_id = s.id
        WHERE e.is_active = true AND e.event_type = ${type}
        GROUP BY e.id ORDER BY e.start_time
      `
      return Response.json(events)
    } else {
      const events = await sql`
        SELECT 
          e.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', s.id,
                'name', s.name,
                'title', s.title,
                'company', s.company,
                'image_url', s.image_url
              )
            ) FILTER (WHERE s.id IS NOT NULL), 
            '[]'
          ) as speakers
        FROM conference.events e
        LEFT JOIN conference.event_speakers es ON e.id = es.event_id
        LEFT JOIN conference.speakers s ON es.speaker_id = s.id
        WHERE e.is_active = true
        GROUP BY e.id ORDER BY e.start_time
      `
      return Response.json(events)
    }
  } catch (error) {
    console.error("Error fetching events:", error)
    return Response.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}
