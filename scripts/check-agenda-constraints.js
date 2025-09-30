import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

async function checkConstraints() {
  try {
    console.log("[v0] Checking agenda_items table constraints...")

    // Query to get check constraints for agenda_items table
    const constraints = await sql`
      SELECT 
        conname as constraint_name,
        pg_get_constraintdef(oid) as constraint_definition
      FROM pg_constraint 
      WHERE conrelid = 'conference.agenda_items'::regclass 
      AND contype = 'c'
    `

    console.log("[v0] Found constraints:", JSON.stringify(constraints, null, 2))

    // Also check if there are any existing agenda_items to see valid types
    const existingItems = await sql`
      SELECT DISTINCT type FROM conference.agenda_items
    `

    console.log("[v0] Existing agenda item types:", JSON.stringify(existingItems, null, 2))
  } catch (error) {
    console.error("[v0] Error checking constraints:", error)
  }
}

checkConstraints()
