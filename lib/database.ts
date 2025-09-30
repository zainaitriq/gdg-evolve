import { neon } from "@neondatabase/serverless"

let sql: ReturnType<typeof neon> | null = null

async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      let errorMessage = ""
      let isRateLimit = false

      // Handle different types of errors
      if (error instanceof Response) {
        // HTTP Response object from fetch
        errorMessage = `HTTP ${error.status}: ${error.statusText}`
        isRateLimit = error.status === 429 || error.statusText.includes("Too Many")
      } else if (error?.message) {
        // JavaScript Error object
        errorMessage = error.message
        isRateLimit =
          errorMessage.includes("Too Many") ||
          errorMessage.includes("rate limit") ||
          errorMessage.includes("429") ||
          errorMessage.includes("Too many requests")
      } else if (typeof error === "string") {
        // Plain string error
        errorMessage = error
        isRateLimit =
          errorMessage.includes("Too Many") || errorMessage.includes("rate limit") || errorMessage.includes("429")
      } else {
        // Unknown error type
        errorMessage = String(error)
        isRateLimit = errorMessage.includes("Too Many") || errorMessage.includes("429")
      }

      if (isRateLimit && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
        console.log(`[v0] Rate limit hit, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }

      // Create a proper Error object for non-rate-limit errors or final attempt
      const finalError = new Error(errorMessage)
      finalError.cause = error
      throw finalError
    }
  }
  throw new Error("Max retries exceeded")
}

function getDatabase() {
  if (!sql) {
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL
    if (!databaseUrl) {
      console.error(
        "[v0] Available environment variables:",
        Object.keys(process.env).filter(
          (key) => key.includes("DATABASE") || key.includes("POSTGRES") || key.includes("NEON"),
        ),
      )
      throw new Error("DATABASE_URL is not set. Please check your environment variables.")
    }
    console.log("[v0] Initializing database connection with URL:", databaseUrl.substring(0, 20) + "...")
    sql = neon(databaseUrl)
  }
  return sql
}

async function safeQuery<T>(queryFn: () => Promise<T>): Promise<T> {
  try {
    return await retryWithBackoff(queryFn)
  } catch (error: any) {
    const errorMessage = error?.message || String(error)
    console.error("[v0] Database query failed:", errorMessage)

    // Don't re-wrap Error objects, just throw them
    if (error instanceof Error) {
      throw error
    }

    throw new Error(`Database query failed: ${errorMessage}`)
  }
}

// Database query functions
export async function getEvents() {
  return safeQuery(async () => {
    const db = getDatabase()
    const events = await db`
      SELECT e.*, 
             COALESCE(speaker_names.names, '[]'::json) as speakers
      FROM conference.events e
      LEFT JOIN (
        SELECT es.event_id, 
               json_agg(json_build_object('name', s.name, 'title', s.title, 'company', s.company)) as names
        FROM conference.event_speakers es
        JOIN conference.speakers s ON es.speaker_id = s.id
        GROUP BY es.event_id
      ) speaker_names ON e.id = speaker_names.event_id
      WHERE e.is_active = true
      ORDER BY e.date, e.start_time
    `
    return events
  })
}

export async function getEventById(id: number) {
  try {
    const db = getDatabase()
    const [event] = await db`
      SELECT e.*, 
             COALESCE(speaker_names.names, '[]'::json) as speakers
      FROM conference.events e
      LEFT JOIN (
        SELECT es.event_id, 
               json_agg(json_build_object('name', s.name, 'title', s.title, 'company', s.company, 'bio', s.bio)) as names
        FROM conference.event_speakers es
        JOIN conference.speakers s ON es.speaker_id = s.id
        GROUP BY es.event_id
      ) speaker_names ON e.id = speaker_names.event_id
      WHERE e.id = ${id} AND e.is_active = true
    `
    return event
  } catch (error) {
    console.error("Error fetching event:", error)
    return null
  }
}

export async function createAttendee(attendeeData: {
  email: string
  first_name: string
  last_name: string
  phone?: string
  university?: string
  year_of_study?: string
  field_of_study?: string
  dietary_restrictions?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
}) {
  try {
    const db = getDatabase()
    const [attendee] = await db`
      INSERT INTO conference.attendees (
        email, first_name, last_name, phone, university, year_of_study, 
        field_of_study, dietary_restrictions, emergency_contact_name, emergency_contact_phone
      )
      VALUES (
        ${attendeeData.email}, ${attendeeData.first_name}, ${attendeeData.last_name},
        ${attendeeData.phone || null}, ${attendeeData.university || null}, ${attendeeData.year_of_study || null},
        ${attendeeData.field_of_study || null}, ${attendeeData.dietary_restrictions || null},
        ${attendeeData.emergency_contact_name || null}, ${attendeeData.emergency_contact_phone || null}
      )
      ON CONFLICT (email) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        university = EXCLUDED.university,
        year_of_study = EXCLUDED.year_of_study,
        field_of_study = EXCLUDED.field_of_study,
        dietary_restrictions = EXCLUDED.dietary_restrictions,
        emergency_contact_name = EXCLUDED.emergency_contact_name,
        emergency_contact_phone = EXCLUDED.emergency_contact_phone,
        updated_at = NOW()
      RETURNING *
    `
    return attendee
  } catch (error) {
    console.error("Error creating attendee:", error)
    throw error
  }
}

export async function createTeam(teamData: {
  name: string
  event_id: number
  team_leader_id: number
  max_members?: number
  description?: string
}) {
  try {
    const db = getDatabase()
    const [team] = await db`
      INSERT INTO conference.competition_teams (name, event_id, team_leader_id, max_members, description, current_members)
      VALUES (${teamData.name}, ${teamData.event_id}, ${teamData.team_leader_id}, 
              ${teamData.max_members || 4}, ${teamData.description || ""}, 1)
      RETURNING *
    `

    await db`
      INSERT INTO conference.competition_team_members (team_id, attendee_id, role)
      VALUES (${team.id}, ${teamData.team_leader_id}, 'leader')
    `

    return team
  } catch (error) {
    console.error("Error creating team:", error)
    throw error
  }
}

export async function createTeamMember(
  teamId: number,
  memberData: {
    name: string
    email: string
    phone?: string
    university?: string
    major?: string
    yearOfStudy?: string
    role?: string
  },
) {
  try {
    // Currently ALWAYS creates attendee record
    const attendee = await createAttendee({
      email: memberData.email,
      first_name: memberData.name.split(" ")[0] || memberData.name,
      last_name: memberData.name.split(" ").slice(1).join(" ") || "",
      phone: memberData.phone,
      university: memberData.university,
      field_of_study: memberData.major,
      year_of_study: memberData.yearOfStudy,
    })

    const db = getDatabase()
    // Add to team
    const [teamMember] = await db`
      INSERT INTO conference.competition_team_members (team_id, attendee_id, role)
      VALUES (${teamId}, ${attendee.id}, ${memberData.role || "member"})
      RETURNING *
    `
    // ... rest of function
  }catch (error) {
    console.error("Error creating team member:", error)
    throw error
  }
}
export async function getEventRequiresTeam(eventId: number) {
  try {
    const db = getDatabase()
    const [event] = await db`
      SELECT requires_team, min_team_size, max_team_size
      FROM conference.events
      WHERE id = ${eventId}
    `
    return event
  } catch (error) {
    console.error("Error checking team requirements:", error)
    return null
  }
}

export async function syncEventRegistrationCounts() {
  return safeQuery(async () => {
    const db = getDatabase()
    
    // Update all event registration counts to match actual RSVP data
    await db`
      UPDATE conference.events 
      SET current_registrations = COALESCE((
        SELECT COUNT(*) 
        FROM conference.rsvps 
        WHERE event_id = conference.events.id 
        AND status IN ('confirmed', 'waitlisted')
      ), 0)
      WHERE is_active = true
    `
    
    console.log("[v0] Event registration counts synchronized")
    return { success: true }
  })
}

export async function getOpeningCeremonyId() {
  try {
    const db = getDatabase()
    const [event] = await db`
      SELECT id FROM conference.events 
      WHERE name ILIKE '%opening ceremony%' 
      AND is_active = true
      LIMIT 1
    `
    return event?.id || null
  } catch (error) {
    console.error("Error finding opening ceremony:", error)
    return null
  }
}

export async function createRSVP(attendeeId: number, eventId: number, teamId?: number) {
  try {
    const db = getDatabase()
    // Check current capacity
    const [event] = await db`
      SELECT capacity, current_registrations 
      FROM conference.events 
      WHERE id = ${eventId}
    `

    if (!event) {
      throw new Error("Event not found")
    }

    const status = event.current_registrations >= event.capacity ? "waitlisted" : "confirmed"

    const timestamp = Date.now()
    const qrCode = `EVOLVE2025-${attendeeId}-${eventId}-${timestamp}-${Math.abs(
      (attendeeId * eventId * timestamp) % 10000,
    )
      .toString()
      .padStart(4, "0")}`

    const [rsvp] = await db`
      INSERT INTO conference.rsvps (attendee_id, event_id, status, qr_code, competition_team_id)
      VALUES (${attendeeId}, ${eventId}, ${status}, ${qrCode}, ${teamId || null})
      ON CONFLICT (attendee_id, event_id) DO UPDATE SET
        status = EXCLUDED.status,
        qr_code = EXCLUDED.qr_code,
        competition_team_id = EXCLUDED.competition_team_id,
        updated_at = NOW()
      RETURNING *
    `

    // Update event registration count
    await db`
      UPDATE conference.events 
      SET current_registrations = (
        SELECT COUNT(*) FROM conference.rsvps 
        WHERE event_id = ${eventId} AND status IN ('confirmed', 'waitlisted')
      )
      WHERE id = ${eventId}
    `

    return rsvp
  } catch (error) {
    console.error("Error creating RSVP:", error)
    throw error
  }
}

export async function getAttendeeRSVPs(email: string) {
  try {
    const db = getDatabase()
    const rsvps = await db`
      SELECT r.*, e.name as event_name, e.date, e.start_time, e.end_time, e.location, e.event_type
      FROM conference.rsvps r
      JOIN conference.attendees a ON r.attendee_id = a.id
      JOIN conference.events e ON r.event_id = e.id
      WHERE a.email = ${email}
      ORDER BY e.date, e.start_time
    `
    return rsvps
  } catch (error) {
    console.error("Error fetching attendee RSVPs:", error)
    return []
  }
}

export async function checkEventConflicts(attendeeId: number, eventId: number) {
  try {
    const db = getDatabase()
    const conflicts = await db`
      SELECT e.name, e.start_time, e.end_time
      FROM conference.rsvps r
      JOIN conference.events e ON r.event_id = e.id
      JOIN conference.events new_event ON new_event.id = ${eventId}
      WHERE r.attendee_id = ${attendeeId} 
        AND r.status = 'confirmed'
        AND e.date = new_event.date
        AND (
          (e.start_time <= new_event.start_time AND e.end_time > new_event.start_time) OR
          (e.start_time < new_event.end_time AND e.end_time >= new_event.end_time) OR
          (e.start_time >= new_event.start_time AND e.end_time <= new_event.end_time)
        )
    `
    return conflicts
  } catch (error) {
    console.error("Error checking conflicts:", error)
    return []
  }
}

export async function getStats() {
  return safeQuery(async () => {
    const db = getDatabase()
    const [stats] = await db`
      SELECT 
        (SELECT COUNT(*) FROM conference.attendees) as total_attendees,
        (SELECT COUNT(*) FROM conference.events WHERE is_active = true AND (event_type = 'session' OR event_type = 'workshop')) as total_events,
        (SELECT COUNT(*) FROM conference.events WHERE event_type = 'competition' AND is_active = true) as total_competitions,
        (SELECT COUNT(*) FROM conference.speakers) as total_speakers
    `
    console.log("[v0] Database stats fetched successfully:", stats)
    return {
      totalAttendees: stats.total_attendees || 0,
      totalEvents: stats.total_events || 0,
      totalCompetitions: stats.total_competitions || 0,
      totalSpeakers: stats.total_speakers || 0,
    }
  })
}

export async function getSponsors() {
  try {
    const db = getDatabase()
    const sponsors = await db`
      SELECT * FROM conference.sponsors 
      WHERE is_active = true 
      ORDER BY 
        CASE tier 
          WHEN 'Exclusive Sponsor' THEN 1 
          WHEN 'Snack Sponsors' THEN 2 
          WHEN 'Partners' THEN 3 
          ELSE 5 
        END,
        name
    `
    return sponsors
  } catch (error) {
    console.error("Error fetching sponsors:", error)
    return []
  }
}

export async function getSpeakers() {
  try {
    const db = getDatabase()
    const speakers = await db`
      SELECT * FROM conference.speakers 
      ORDER BY name
    `
    return speakers
  } catch (error) {
    console.error("Error fetching speakers:", error)
    return []
  }
}

export async function getTeamMembers() {
  try {
    const db = getDatabase()
    const teamMembers = await db`
      SELECT * FROM conference.team_members 
      WHERE is_active = true 
      ORDER BY order_index, name
    `
    return teamMembers
  } catch (error) {
    console.error("Error fetching team members:", error)
    return []
  }
}

export async function getAboutContent() {
  try {
    const db = getDatabase()
    const content = await db`
      SELECT * FROM conference.about_content 
      WHERE is_active = true 
      ORDER BY order_index
    `
    return content
  } catch (error) {
    console.error("Error fetching about content:", error)
    return []
  }
}

export async function getAttendeeByEmail(email: string) {
  try {
    const db = getDatabase()
    const [attendee] = await db`
      SELECT * FROM conference.attendees 
      WHERE email = ${email}
    `
    return attendee || null
  } catch (error) {
    console.error("Error fetching attendee by email:", error)
    return null
  }
}

export async function validateEventTimeConflicts(eventIds: number[]) {
  try {
    const db = getDatabase()
    const conflicts = []

    for (let i = 0; i < eventIds.length; i++) {
      for (let j = i + 1; j < eventIds.length; j++) {
        const conflictCheck = await db`
          SELECT 
            e1.name as event1_name,
            e2.name as event2_name,
            e1.start_time as event1_start,
            e1.end_time as event1_end,
            e2.start_time as event2_start,
            e2.end_time as event2_end
          FROM conference.events e1, conference.events e2
          WHERE e1.id = ${eventIds[i]} 
            AND e2.id = ${eventIds[j]}
            AND e1.date = e2.date
            AND (
              (e1.start_time < e2.end_time AND e1.end_time > e2.start_time)
            )
            AND NOT (e1.event_type = 'session' AND e2.event_type = 'session')
        `

        if (conflictCheck.length > 0) {
          conflicts.push({
            event1: conflictCheck[0].event1_name,
            event2: conflictCheck[0].event2_name,
            message: `"${conflictCheck[0].event1_name}" and "${conflictCheck[0].event2_name}" have overlapping times`,
          })
        }
      }
    }

    return conflicts
  } catch (error) {
    console.error("Error validating event time conflicts:", error)
    return []
  }
}

export async function checkExistingRSVPs(email: string) {
  try {
    const db = getDatabase()
    const rsvps = await db`
      SELECT r.*, e.name as event_name
      FROM conference.rsvps r
      JOIN conference.attendees a ON r.attendee_id = a.id
      JOIN conference.events e ON r.event_id = e.id
      WHERE a.email = ${email}
        AND r.status IN ('confirmed', 'waitlisted')
    `
    return rsvps
  } catch (error) {
    console.error("Error checking existing RSVPs:", error)
    return []
  }
}


// Add these new database functions to your database.ts file

// Comprehensive Arabic-English transliteration mapping
const arabicToEnglishMap: { [key: string]: string } = {
  // Basic Arabic letters
  'ا': 'a', 'أ': 'a', 'إ': 'a', 'آ': 'aa',
  'ب': 'b',
  'ت': 't',
  'ث': 'th',
  'ج': 'j',
  'ح': 'h',
  'خ': 'kh',
  'د': 'd',
  'ذ': 'dh',
  'ر': 'r',
  'ز': 'z',
  'س': 's',
  'ش': 'sh',
  'ص': 's',
  'ض': 'd',
  'ط': 't',
  'ظ': 'dh',
  'ع': '',
  'غ': 'gh',
  'ف': 'f',
  'ق': 'q',
  'ك': 'k',
  'ل': 'l',
  'م': 'm',
  'ن': 'n',
  'ه': 'h',
  'و': 'w',
  'ي': 'y',
  'ى': 'a',
  'ة': 'h',
  'ء': '',
  // Common combinations
  'ال': 'al',
  'لل': 'll',
  // Numbers
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
}

// Helper function to transliterate Arabic text to English phonetics
function transliterateArabicToEnglish(text: string): string {
  let result = text.toLowerCase()
  
  // Apply character-by-character transliteration
  for (const [arabic, english] of Object.entries(arabicToEnglishMap)) {
    result = result.replace(new RegExp(arabic, 'g'), english)
  }
  
  // Clean up the result
  result = result
    .replace(/[^\w\s]/g, '') // Remove non-word characters except spaces
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
  
  return result
}

// Enhanced normalization with comprehensive Arabic support
function normalizeName(name: string): string {
  // First, normalize Unicode and remove diacritics
  let normalized = name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
  
  // Check if text contains Arabic characters
  const hasArabic = /[\u0600-\u06FF]/.test(normalized)
  
  if (hasArabic) {
    // Transliterate Arabic to English
    normalized = transliterateArabicToEnglish(normalized)
  }
  
  // Final cleanup
  normalized = normalized
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
  
  // Sort words to handle different word orders
  const words = normalized.split(' ').filter(word => word.length > 0).sort()
  return words.join(' ')
}

// Enhanced phonetic variations generator
function generatePhoneticVariations(name: string): string[] {
  const baseNormalized = normalizeName(name)
  const variations = new Set([baseNormalized])
  
  // Add the original name normalized without transliteration
  const simpleNormalized = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  variations.add(simpleNormalized)
  
  // Generate common transliteration variations
  const transliterationVariations = [
    ['kh', 'x'], ['gh', 'g'], ['th', 't'], ['dh', 'd'],
    ['ph', 'f'], ['ah', 'a'], ['eh', 'e'], ['oh', 'o'],
    ['mohammed', 'muhammad'], ['ahmed', 'ahmad'],
    ['fatima', 'fatema'], ['aisha', 'aysha'],
    ['youssef', 'yousef'], ['hassan', 'hasan'],
    ['aljamal', 'al jamal'], ['dana', 'danna'],
    ['jamal', 'gamal'], ['jamal', 'jamel'],['odai','oday'],['tariq','tareq'],['raghed','raghad']
  ]
  
  for (const variation of Array.from(variations)) {
    for (const [from, to] of transliterationVariations) {
      if (variation.includes(from)) {
        variations.add(variation.replace(new RegExp(from, 'g'), to))
      }
      if (variation.includes(to)) {
        variations.add(variation.replace(new RegExp(to, 'g'), from))
      }
    }
  }
  
  return Array.from(variations)
}

// Enhanced function to detect transliterated/multilingual duplicate names
export async function detectDuplicateNames() {
  return safeQuery(async () => {
    const db = getDatabase()
    
    // Get all attendees
    const allAttendees = await db`
      SELECT 
        id,
        email,
        first_name,
        last_name,
        created_at,
        LOWER(TRIM(first_name || ' ' || last_name)) as original_name
      FROM conference.attendees
      ORDER BY created_at
    `
    
    // Group by normalized names using enhanced JavaScript logic
    const nameGroups: { [key: string]: typeof allAttendees } = {}
    
    for (const attendee of allAttendees) {
      const variations = generatePhoneticVariations(attendee.original_name)
      
      // Find if this attendee matches any existing group
      let foundGroup = false
      for (const [existingKey, existingGroup] of Object.entries(nameGroups)) {
        const existingVariations = generatePhoneticVariations(existingGroup[0].original_name)
        
        // Check if any variation matches
        const hasMatch = variations.some(newVar => 
          existingVariations.some(existingVar => {
            if (newVar === existingVar) return true
            if (calculateStringSimilarity(newVar, existingVar) > 0.90) return true
            return false
          })
        )
        
        if (hasMatch) {
          nameGroups[existingKey].push(attendee)
          foundGroup = true
          break
        }
      }
      
      // If no match found, create new group
      if (!foundGroup) {
        const normalizedKey = normalizeName(attendee.original_name)
        nameGroups[normalizedKey] = [attendee]
      }
    }
    
    // Filter groups with multiple registrations
    const duplicates = Object.entries(nameGroups)
      .filter(([_, attendees]) => attendees.length > 1)
      .map(([normalizedName, attendees]) => ({
        normalized_name: normalizedName,
        original_names: attendees.map(a => a.original_name),
        registration_count: attendees.length,
        emails: attendees.map(a => a.email),
        attendee_ids: attendees.map(a => a.id),
        registration_dates: attendees.map(a => a.created_at)
      }))
      .sort((a, b) => b.registration_count - a.registration_count)
    
    return duplicates
  })
}

// 2. Function to detect multiple workshop registrations by same person
export async function detectMultipleWorkshopRegistrations() {
  return safeQuery(async () => {
    const db = getDatabase()
    const violations = await db`
      SELECT 
        LOWER(TRIM(a.first_name || ' ' || a.last_name)) as full_name,
        e.name as workshop_name,
        COUNT(r.id) as registration_count,
        ARRAY_AGG(a.email) as emails,
        ARRAY_AGG(r.created_at) as registration_dates,
        ARRAY_AGG(r.qr_code) as qr_codes
      FROM conference.rsvps r
      JOIN conference.attendees a ON r.attendee_id = a.id
      JOIN conference.events e ON r.event_id = e.id
      WHERE e.event_type IN ('workshop', 'competition')
      GROUP BY LOWER(TRIM(a.first_name || ' ' || a.last_name)), e.id, e.name
      HAVING COUNT(r.id) > 1
      ORDER BY registration_count DESC
    `
    return violations
  })
}

// 3. Function to find suspicious patterns (similar names, similar emails)
export async function detectSuspiciousPatterns() {
  return safeQuery(async () => {
    const db = getDatabase()
    
    // Find similar email patterns (same domain, similar usernames)
    const emailPatterns = await db`
      WITH email_analysis AS (
        SELECT 
          email,
          first_name,
          last_name,
          SPLIT_PART(email, '@', 1) as username,
          SPLIT_PART(email, '@', 2) as domain,
          LENGTH(email) as email_length
        FROM conference.attendees
      )
      SELECT 
        domain,
        COUNT(*) as registrations,
        ARRAY_AGG(DISTINCT email) as emails,
        ARRAY_AGG(DISTINCT first_name || ' ' || last_name) as names
      FROM email_analysis
      GROUP BY domain
      HAVING COUNT(*) > 5
      ORDER BY registrations DESC
    `
    
    // Find registrations with sequential timestamps (bulk registrations)
    const timePatterns = await db`
      SELECT 
        DATE_TRUNC('hour', created_at) as hour_bucket,
        COUNT(*) as registrations_per_hour,
        ARRAY_AGG(email) as emails,
        ARRAY_AGG(first_name || ' ' || last_name) as names
      FROM conference.attendees
      GROUP BY DATE_TRUNC('hour', created_at)
      HAVING COUNT(*) > 10
      ORDER BY registrations_per_hour DESC
    `
    
    return {
      emailPatterns,
      timePatterns
    }
  })
}

// 4. Function to flag and suspend suspicious accounts
export async function flagSuspiciousAccounts(attendeeIds: number[], reason: string) {
  return safeQuery(async () => {
    const db = getDatabase()
    
    // Add a flags table if it doesn't exist
    await db`
      CREATE TABLE IF NOT EXISTS conference.attendee_flags (
        id SERIAL PRIMARY KEY,
        attendee_id INTEGER REFERENCES conference.attendees(id),
        flag_type VARCHAR(50) NOT NULL,
        reason TEXT,
        flagged_by VARCHAR(100),
        flagged_at TIMESTAMP DEFAULT NOW(),
        is_active BOOLEAN DEFAULT true
      )
    `
    
    // Flag the suspicious attendees
    for (const attendeeId of attendeeIds) {
      await db`
        INSERT INTO conference.attendee_flags (attendee_id, flag_type, reason, flagged_by)
        VALUES (${attendeeId}, 'suspicious_registration', ${reason}, 'system_auto')
      `
    }
    
    // Cancel their RSVPs for workshops and competitions
    await db`
      UPDATE conference.rsvps 
      SET status = 'cancelled'
      WHERE attendee_id = ANY(${attendeeIds})
      AND event_id IN (
        SELECT id FROM conference.events 
        WHERE event_type IN ('workshop', 'competition')
      )
    `
    
    return { flaggedCount: attendeeIds.length }
  })
}

// 5. Enhanced validation function with multilingual support
export async function validateRegistrationIntegrity(
  email: string, 
  firstName: string, 
  lastName: string, 
  eventIds: number[]
) {
  return safeQuery(async () => {
    const db = getDatabase()
    const fullName = `${firstName.trim()} ${lastName.trim()}`
    const normalizedName = normalizeName(fullName)
    
    // Get all existing attendees for comparison
    const existingAttendees = await db`
      SELECT 
        a.id,
        a.email,
        a.first_name,
        a.last_name,
        LOWER(TRIM(a.first_name || ' ' || a.last_name)) as original_name,
        ARRAY_AGG(DISTINCT e.name) FILTER (WHERE e.name IS NOT NULL) as registered_events,
        ARRAY_AGG(DISTINCT e.id) FILTER (WHERE e.id IS NOT NULL) as registered_event_ids
      FROM conference.attendees a
      LEFT JOIN conference.rsvps r ON a.id = r.attendee_id AND r.status IN ('confirmed', 'waitlisted')
      LEFT JOIN conference.events e ON r.event_id = e.id AND e.event_type IN ('workshop', 'competition')
      WHERE a.email != ${email}
      GROUP BY a.id, a.email, a.first_name, a.last_name
    `
    
    // Check for name similarities using JavaScript with phonetic matching
    const nameConflicts = []
    const workshopConflicts = []
    const targetVariations = generatePhoneticVariations(fullName)
    
    for (const attendee of existingAttendees) {
      const existingVariations = generatePhoneticVariations(attendee.original_name)
      
      // Check if any variation of the new name matches any variation of existing names
      const hasMatch = targetVariations.some(targetVar => 
        existingVariations.some(existingVar => {
          // Exact match after normalization
          if (targetVar === existingVar) return true
          
          // High similarity match (>90% for strict matching)
          if (calculateStringSimilarity(targetVar, existingVar) > 0.90) return true
          
          return false
        })
      )
      
      if (hasMatch) {
        nameConflicts.push({
          email: attendee.email,
          first_name: attendee.first_name,
          last_name: attendee.last_name,
          registered_events: attendee.registered_events || [],
          similarity_reason: 'multilingual_transliteration_match',
          target_variations: targetVariations,
          existing_variations: existingVariations
        })
        
        // Check for workshop conflicts with this similar name
        if (attendee.registered_event_ids) {
          const conflictingEvents = eventIds.filter(id => 
            attendee.registered_event_ids.includes(id)
          )
          if (conflictingEvents.length > 0) {
            workshopConflicts.push({
              name: `${attendee.first_name} ${attendee.last_name}`,
              email: attendee.email,
              conflicting_events: conflictingEvents,
              detected_via: 'transliteration_match'
            })
          }
        }
      }
    }
    
    // Also check direct email conflicts for workshops/competitions
    const directEmailConflicts = await db`
      SELECT DISTINCT e.name, e.event_type
      FROM conference.attendees a
      JOIN conference.rsvps r ON a.id = r.attendee_id
      JOIN conference.events e ON r.event_id = e.id
      WHERE a.email = ${email}
      AND r.event_id = ANY(${eventIds})
      AND r.status IN ('confirmed', 'waitlisted')
      AND e.event_type IN ('workshop', 'competition')
    `
    
    workshopConflicts.push(...directEmailConflicts.map(conflict => ({
      name: fullName,
      email: email,
      event_name: conflict.name,
      conflict_type: 'same_email'
    })))
    
    return {
      isValid: nameConflicts.length === 0 && workshopConflicts.length === 0,
      nameConflicts,
      workshopConflicts,
      warnings: [
        ...nameConflicts.map(nc => 
          `Name "${fullName}" appears similar to existing registration "${nc.first_name} ${nc.last_name}" (${nc.email}) - ${nc.similarity_reason}`
        ),
        ...workshopConflicts.map(wc => 
          `Already registered for workshop/competition: ${wc.event_name || 'selected event'}`
        )
      ]
    }
  })
}

// String similarity calculation (Levenshtein distance based)
function calculateStringSimilarity(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  
  if (len1 === 0) return len2 === 0 ? 1 : 0
  if (len2 === 0) return 0
  
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null))
  
  for (let i = 0; i <= len1; i++) matrix[i][0] = i
  for (let j = 0; j <= len2; j++) matrix[0][j] = j
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }
  
  const maxLength = Math.max(len1, len2)
  return (maxLength - matrix[len1][len2]) / maxLength
}

// 6. Enhanced createAttendee function with fraud checks
export async function createAttendeeWithValidation(attendeeData: {
  email: string
  first_name: string
  last_name: string
  phone?: string
  university?: string
  year_of_study?: string
  field_of_study?: string
  dietary_restrictions?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
}, eventIds: number[] = []) {
  // First validate the registration
  const validation = await validateRegistrationIntegrity(
    attendeeData.email,
    attendeeData.first_name,
    attendeeData.last_name,
    eventIds
  )
  
  if (!validation.isValid) {
    throw new Error(`Registration validation failed: ${validation.warnings.join(', ')}`)
  }
  
  // Proceed with normal attendee creation if validation passes
  return createAttendee(attendeeData)
}

// 7. Admin function to generate fraud report
export async function generateFraudReport() {
  return safeQuery(async () => {
    const duplicateNames = await detectDuplicateNames()
    const multipleWorkshops = await detectMultipleWorkshopRegistrations()
    const suspiciousPatterns = await detectSuspiciousPatterns()
    
    const db = getDatabase()
    const flaggedAccounts = await db`
      SELECT 
        af.*,
        a.email,
        a.first_name,
        a.last_name
      FROM conference.attendee_flags af
      JOIN conference.attendees a ON af.attendee_id = a.id
      WHERE af.is_active = true
      ORDER BY af.flagged_at DESC
    `
    
    return {
      summary: {
        duplicateNamesCount: duplicateNames.length,
        multipleWorkshopViolations: multipleWorkshops.length,
        flaggedAccountsCount: flaggedAccounts.length
      },
      details: {
        duplicateNames,
        multipleWorkshops,
        suspiciousPatterns,
        flaggedAccounts
      }
    }
  })
}





export { getDatabase as sql }
export { getDatabase }
export { safeQuery }
