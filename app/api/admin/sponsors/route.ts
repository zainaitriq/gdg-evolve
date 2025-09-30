import { NextResponse } from "next/server"
import { safeQuery, getDatabase } from "@/lib/database"

export async function GET() {
  try {
    const sponsors = await safeQuery(async () => {
      const sql = getDatabase()
      return await sql`
        SELECT 
          id, name, tier, logo_url, website_url, description, 
          is_active, created_at, updated_at
        FROM conference.sponsors
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
    })

    return NextResponse.json(sponsors)
  } catch (error: any) {
    console.error("[v0] Error fetching sponsors:", error?.message || error)

    let errorMessage = "Failed to fetch sponsors"
    let statusCode = 500

    const errorString = error?.message || String(error)

    if (
      errorString.includes("Too Many Requests") ||
      errorString.includes("rate limit") ||
      errorString.includes("429")
    ) {
      errorMessage = "Database is currently busy. Please try again in a moment."
      statusCode = 429
    } else if (errorString.includes("connection") || errorString.includes("timeout")) {
      errorMessage = "Database connection issue. Please try again."
      statusCode = 503
    } else if (errorString.includes("Database query failed")) {
      errorMessage = "Database temporarily unavailable. Please try again."
      statusCode = 503
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? errorString : undefined,
        sponsors: [], // Provide empty array as fallback
        timestamp: new Date().toISOString(),
      },
      { status: statusCode },
    )
  }
}
