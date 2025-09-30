import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

async function syncEventsToAgenda() {
  try {
    console.log("[v0] Starting event-agenda sync...")

    // First, check current state
    const currentAgendaItems = await sql`SELECT COUNT(*) as count FROM conference.agenda_items`
    console.log("[v0] Current agenda items:", currentAgendaItems[0].count)

    const currentEvents = await sql`SELECT COUNT(*) as count FROM conference.events WHERE is_active = true`
    console.log("[v0] Current active events:", currentEvents[0].count)

    // Clear existing agenda items
    await sql`DELETE FROM conference.agenda_items`
    console.log("[v0] Cleared existing agenda items")

    // Get all active events
    const events = await sql`
      SELECT 
        e.id,
        e.name as title,
        e.description,
        e.event_date,
        e.start_time,
        e.end_time,
        e.location,
        e.event_type,
        COALESCE(s.first_name || ' ' || s.last_name, 'TBA') as speaker_name
      FROM conference.events e
      LEFT JOIN conference.event_speakers es ON e.id = es.event_id
      LEFT JOIN conference.speakers s ON es.speaker_id = s.id
      WHERE e.is_active = true
      ORDER BY e.event_date, e.start_time
    `

    console.log("[v0] Found events to sync:", events.length)

    // Insert each event as an agenda item
    for (const event of events) {
      await sql`
        INSERT INTO conference.agenda_items (
          title,
          description,
          event_date,
          start_time,
          end_time,
          location,
          type,
          speaker,
          is_active
        ) VALUES (
          ${event.title},
          ${event.description || ""},
          ${event.event_date},
          ${event.start_time},
          ${event.end_time},
          ${event.location || ""},
          ${event.event_type || "session"},
          ${event.speaker_name},
          true
        )
      `
    }

    // Verify the sync
    const finalCount = await sql`SELECT COUNT(*) as count FROM conference.agenda_items`
    console.log("[v0] Sync complete! Created agenda items:", finalCount[0].count)

    // Show sample of created items
    const sample = await sql`
      SELECT title, event_date, start_time, type 
      FROM conference.agenda_items 
      ORDER BY event_date, start_time 
      LIMIT 5
    `
    console.log("[v0] Sample agenda items:", sample)
  } catch (error) {
    console.error("[v0] Error syncing events to agenda:", error)
    throw error
  }
}

syncEventsToAgenda()
