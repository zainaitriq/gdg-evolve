import { NextRequest, NextResponse } from "next/server"
import { safeQuery, getDatabase } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "all"

    // Calculate date filter based on time range
    let dateFilter = ""
    if (timeRange !== "all") {
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 0
      if (days > 0) {
        dateFilter = `AND a.created_at >= NOW() - INTERVAL '${days} days'`
      }
    }

    const analytics = await safeQuery(async () => {
      const sql = getDatabase()

      // Overview statistics
      const [overview] = await sql`
        SELECT 
          COUNT(DISTINCT a.id) as total_attendees,
          COUNT(DISTINCT e.id) as total_events,
          COUNT(CASE WHEN LOWER(e.name) NOT LIKE '%opening ceremony%' THEN r.id END) as total_registrations,
          ROUND(
            COUNT(CASE WHEN r.checked_in = true AND LOWER(e.name) NOT LIKE '%opening ceremony%' THEN r.id END) * 100.0 / 
            NULLIF(COUNT(CASE WHEN LOWER(e.name) NOT LIKE '%opening ceremony%' THEN r.id END), 0), 
            2
          ) as check_in_rate,
          COUNT(DISTINCT CASE WHEN e.requires_team = true THEN e.id END) as team_events,
          COUNT(DISTINCT ct.id) as total_teams
        FROM conference.attendees a
        LEFT JOIN conference.rsvps r ON a.id = r.attendee_id
        LEFT JOIN conference.events e ON r.event_id = e.id
        LEFT JOIN conference.competition_teams ct ON e.id = ct.event_id
        WHERE 1=1 ${timeRange !== "all" ? sql`AND a.created_at >= NOW() - INTERVAL '${timeRange === "7d" ? "7" : timeRange === "30d" ? "30" : "90"} days'` : sql``}
      `

      // Registration by day
      const registrationByDay = await sql`
        SELECT 
          DATE(a.created_at) as date,
          COUNT(*) as count
        FROM conference.attendees a
        WHERE 1=1 ${timeRange !== "all" ? sql`AND a.created_at >= NOW() - INTERVAL '${timeRange === "7d" ? "7" : timeRange === "30d" ? "30" : "90"} days'` : sql``}
        GROUP BY DATE(a.created_at)
        ORDER BY date ASC
      `

      // Events by type
      const eventsByType = await sql`
        SELECT 
          e.event_type,
          COUNT(DISTINCT e.id) as count,
          COUNT(CASE WHEN LOWER(e.name) NOT LIKE '%opening ceremony%' THEN r.id END) as registrations
        FROM conference.events e
        LEFT JOIN conference.rsvps r ON e.id = r.event_id
        GROUP BY e.event_type
        ORDER BY count DESC
      `

      // University distribution with comprehensive normalization
      const universityDistribution = await sql`
        SELECT 
          CASE 
            -- Al-Balqa Applied University variations
            WHEN UPPER(TRIM(a.university)) LIKE '%BALQA%' OR UPPER(TRIM(a.university)) = 'BAU' OR UPPER(TRIM(a.university)) = 'BA' THEN 'Al-Balqa Applied University'
            
            -- HTU variations
            WHEN UPPER(TRIM(a.university)) LIKE '%HUSSEIN%TECHNICAL%' OR UPPER(TRIM(a.university)) = 'HTU' THEN 'Al-Hussein Technical University'
            
            -- AAU variations
            WHEN UPPER(TRIM(a.university)) LIKE '%AHLIYYA%' OR UPPER(TRIM(a.university)) LIKE '%AMMAN%AHLYYAH%' OR UPPER(TRIM(a.university)) = 'AAU' THEN 'Amman Al-Ahliyya University'
            
            -- Hashemite University
            WHEN UPPER(TRIM(a.university)) = 'HU' OR UPPER(TRIM(a.university)) LIKE '%HASHEMITE%' THEN 'The Hashemite University'
            
            -- Al-Zaytoonah University variations
            WHEN UPPER(TRIM(a.university)) LIKE '%ZAYTOON%' OR UPPER(TRIM(a.university)) = 'ZUJ' OR a.university LIKE '%زيتونة%' THEN 'Al-Zaytoonah University of Jordan'
            
            -- JUST variations
            WHEN UPPER(TRIM(a.university)) = 'JUST' OR UPPER(TRIM(a.university)) LIKE '%JORDAN%SCIENCE%TECHNOLOGY%' THEN 'Jordan University of Science and Technology'
            
            -- University of Jordan
            WHEN UPPER(TRIM(a.university)) LIKE '%UNIVERSITY%JORDAN%' AND UPPER(TRIM(a.university)) NOT LIKE '%SCIENCE%' THEN 'University of Jordan'
            
            -- Zarqa University variations
            WHEN UPPER(TRIM(a.university)) LIKE '%ZARQA%' OR UPPER(TRIM(a.university)) = 'ZU' OR a.university LIKE '%زرقاء%' THEN 'Zarqa University'
            
            -- German Jordanian University
            WHEN UPPER(TRIM(a.university)) = 'GJU' OR UPPER(TRIM(a.university)) LIKE '%GERMAN%JORDANIAN%' THEN 'German Jordanian University'
            
            ELSE TRIM(a.university)
          END as university,
          COUNT(*) as count
        FROM conference.attendees a
        WHERE a.university IS NOT NULL AND a.university != ''
        ${timeRange !== "all" ? sql`AND a.created_at >= NOW() - INTERVAL '${timeRange === "7d" ? "7" : timeRange === "30d" ? "30" : "90"} days'` : sql``}
        GROUP BY 
          CASE 
            -- Al-Balqa Applied University variations
            WHEN UPPER(TRIM(a.university)) LIKE '%BALQA%' OR UPPER(TRIM(a.university)) = 'BAU' OR UPPER(TRIM(a.university)) = 'BA' THEN 'Al-Balqa Applied University'
            
            -- HTU variations
            WHEN UPPER(TRIM(a.university)) LIKE '%HUSSEIN%TECHNICAL%' OR UPPER(TRIM(a.university)) = 'HTU' THEN 'Al-Hussein Technical University'
            
            -- AAU variations
            WHEN UPPER(TRIM(a.university)) LIKE '%AHLIYYA%' OR UPPER(TRIM(a.university)) LIKE '%AMMAN%AHLYYAH%' OR UPPER(TRIM(a.university)) = 'AAU' THEN 'Amman Al-Ahliyya University'
            
            -- Hashemite University
            WHEN UPPER(TRIM(a.university)) = 'HU' OR UPPER(TRIM(a.university)) LIKE '%HASHEMITE%' THEN 'The Hashemite University'
            
            -- Al-Zaytoonah University variations
            WHEN UPPER(TRIM(a.university)) LIKE '%ZAYTOON%' OR UPPER(TRIM(a.university)) = 'ZUJ' OR a.university LIKE '%زيتونة%' THEN 'Al-Zaytoonah University of Jordan'
            
            -- JUST variations
            WHEN UPPER(TRIM(a.university)) = 'JUST' OR UPPER(TRIM(a.university)) LIKE '%JORDAN%SCIENCE%TECHNOLOGY%' THEN 'Jordan University of Science and Technology'
            
            -- University of Jordan
            WHEN UPPER(TRIM(a.university)) LIKE '%UNIVERSITY%JORDAN%' AND UPPER(TRIM(a.university)) NOT LIKE '%SCIENCE%' THEN 'University of Jordan'
            
            -- Zarqa University variations
            WHEN UPPER(TRIM(a.university)) LIKE '%ZARQA%' OR UPPER(TRIM(a.university)) = 'ZU' OR a.university LIKE '%زرقاء%' THEN 'Zarqa University'
            
            -- German Jordanian University
            WHEN UPPER(TRIM(a.university)) = 'GJU' OR UPPER(TRIM(a.university)) LIKE '%GERMAN%JORDANIAN%' THEN 'German Jordanian University'
            
            ELSE TRIM(a.university)
          END
        ORDER BY count DESC
        LIMIT 10
      `

      // Year distribution
      const yearDistribution = await sql`
        SELECT 
          a.year_of_study,
          COUNT(*) as count
        FROM conference.attendees a
        WHERE a.year_of_study IS NOT NULL AND a.year_of_study != ''
        ${timeRange !== "all" ? sql`AND a.created_at >= NOW() - INTERVAL '${timeRange === "7d" ? "7" : timeRange === "30d" ? "30" : "90"} days'` : sql``}
        GROUP BY a.year_of_study
        ORDER BY a.year_of_study ASC
      `

      // Field distribution
      const fieldDistribution = await sql`
        SELECT 
          a.field_of_study,
          COUNT(*) as count
        FROM conference.attendees a
        WHERE a.field_of_study IS NOT NULL AND a.field_of_study != ''
        ${timeRange !== "all" ? sql`AND a.created_at >= NOW() - INTERVAL '${timeRange === "7d" ? "7" : timeRange === "30d" ? "30" : "90"} days'` : sql``}
        GROUP BY a.field_of_study
        ORDER BY count DESC
        LIMIT 10
      `

      // Check-in by event
      const checkInByEvent = await sql`
        SELECT 
          e.name as event_name,
          COUNT(r.id) as total_registered,
          COUNT(CASE WHEN r.checked_in = true THEN r.id END) as checked_in,
          ROUND(
            COUNT(CASE WHEN r.checked_in = true THEN r.id END) * 100.0 / 
            NULLIF(COUNT(r.id), 0), 
            1
          ) as check_in_rate
        FROM conference.events e
        LEFT JOIN conference.rsvps r ON e.id = r.event_id
        WHERE LOWER(e.name) NOT LIKE '%opening ceremony%'
        GROUP BY e.id, e.name
        HAVING COUNT(r.id) > 0
        ORDER BY check_in_rate DESC
      `

      // Team sizes
      const teamSizes = await sql`
        SELECT 
          ct.name as team_name,
          COUNT(ctm.id) + 1 as team_size,
          e.name as event_name
        FROM conference.competition_teams ct
        JOIN conference.events e ON ct.event_id = e.id
        LEFT JOIN conference.competition_team_members ctm ON ct.id = ctm.team_id
        GROUP BY ct.id, ct.name, e.name
        ORDER BY team_size DESC
      `

      return {
        overview: {
          total_attendees: parseInt(overview.total_attendees) || 0,
          total_events: parseInt(overview.total_events) || 0,
          total_registrations: parseInt(overview.total_registrations) || 0,
          check_in_rate: parseFloat(overview.check_in_rate) || 0,
          team_events: parseInt(overview.team_events) || 0,
          total_teams: parseInt(overview.total_teams) || 0
        },
        registration_by_day: registrationByDay.map(row => ({
          date: row.date,
          count: parseInt(row.count)
        })),
        events_by_type: eventsByType.map(row => ({
          event_type: row.event_type,
          count: parseInt(row.count),
          registrations: parseInt(row.registrations) || 0
        })),
        university_distribution: universityDistribution.map(row => ({
          university: row.university,
          count: parseInt(row.count)
        })),
        year_distribution: yearDistribution.map(row => ({
          year_of_study: row.year_of_study,
          count: parseInt(row.count)
        })),
        field_distribution: fieldDistribution.map(row => ({
          field_of_study: row.field_of_study,
          count: parseInt(row.count)
        })),
        check_in_by_event: checkInByEvent.map(row => ({
          event_name: row.event_name,
          total_registered: parseInt(row.total_registered),
          checked_in: parseInt(row.checked_in),
          check_in_rate: parseFloat(row.check_in_rate) || 0
        })),
        team_sizes: teamSizes.map(row => ({
          team_name: row.team_name,
          team_size: parseInt(row.team_size),
          event_name: row.event_name
        }))
      }
    })

    return NextResponse.json(analytics)

  } catch (error: any) {
    console.error("[Admin] Error fetching analytics:", error?.message || error)

    let errorMessage = "Failed to fetch analytics"
    let statusCode = 500

    const errorString = error?.message || String(error)

    if (
      errorString.includes("Too Many Requests") ||
      errorString.includes("rate limit") ||
      errorString.includes("429") ||
      (errorString.includes('Unexpected token') && errorString.includes('"Too Many R'))
    ) {
      errorMessage = "Database is currently busy. Please try again in a moment."
      statusCode = 429
    } else if (errorString.includes("connection") || errorString.includes("timeout")) {
      errorMessage = "Database connection issue. Please try again."
      statusCode = 503
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? errorString : undefined,
      },
      { status: statusCode }
    )
  }
}
