import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const sponsors = await sql`
      SELECT * FROM conference.sponsors 
      WHERE is_active = true 
      ORDER BY 
        CASE tier 
          WHEN 'platinum' THEN 1 
          WHEN 'gold' THEN 2 
          WHEN 'silver' THEN 3 
          WHEN 'bronze' THEN 4 
          ELSE 5 
        END,
        name
    `

    return Response.json(sponsors)
  } catch (error) {
    console.error("Error fetching sponsors:", error)
    return Response.json({ error: "Failed to fetch sponsors" }, { status: 500 })
  }
}
