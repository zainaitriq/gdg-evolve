import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { is_active } = body

    console.log("[v0] Updating sponsor status:", { id, is_active })

    const sql = getDatabase()

    const result = await sql`
      UPDATE conference.sponsors 
      SET is_active = ${is_active}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Sponsor not found" }, { status: 404 })
    }

    console.log("[v0] Sponsor updated successfully:", result[0])
    return NextResponse.json(result[0])
  } catch (error) {
    console.error("[v0] Error updating sponsor:", error)
    return NextResponse.json({ error: "Failed to update sponsor" }, { status: 500 })
  }
}
