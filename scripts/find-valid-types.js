import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

async function findValidTypes() {
  try {
    console.log("[v0] Checking agenda_items type constraint...")

    // Query to find the check constraint definition
    const constraintQuery = `
      SELECT 
        conname as constraint_name,
        pg_get_constraintdef(oid) as constraint_definition
      FROM pg_constraint 
      WHERE conname = 'agenda_items_type_check';
    `

    const constraints = await sql(constraintQuery)
    console.log("[v0] Found constraints:", JSON.stringify(constraints, null, 2))

    // Also check what types currently exist in agenda_items
    const existingTypes = await sql`
      SELECT DISTINCT type 
      FROM conference.agenda_items 
      WHERE type IS NOT NULL;
    `
    console.log("[v0] Existing types in agenda_items:", JSON.stringify(existingTypes, null, 2))

    // Check what event_types exist in events table
    const eventTypes = await sql`
      SELECT DISTINCT event_type 
      FROM conference.events 
      WHERE event_type IS NOT NULL;
    `
    console.log("[v0] Event types in events table:", JSON.stringify(eventTypes, null, 2))
  } catch (error) {
    console.error("[v0] Error finding valid types:", error)
  }
}

findValidTypes()
