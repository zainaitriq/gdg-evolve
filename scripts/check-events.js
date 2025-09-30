import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

async function checkEvents() {
  try {
    console.log("Checking all events in database...")

    const allEvents = await sql`
      SELECT id, name, event_type, is_active, date, start_time, end_time 
      FROM conference.events 
      ORDER BY event_type, name
    `

    console.log("All events:")
    console.table(allEvents)

    console.log("\nWorkshop events specifically:")
    const workshops = await sql`
      SELECT id, name, event_type, is_active, date, start_time, end_time 
      FROM conference.events 
      WHERE event_type = 'workshop'
      ORDER BY name
    `
    console.table(workshops)

    console.log("\nActive workshop events:")
    const activeWorkshops = await sql`
      SELECT id, name, event_type, is_active, date, start_time, end_time 
      FROM conference.events 
      WHERE event_type = 'workshop' AND is_active = true
      ORDER BY name
    `
    console.table(activeWorkshops)
  } catch (error) {
    console.error("Error checking events:", error)
  }
}

checkEvents()
