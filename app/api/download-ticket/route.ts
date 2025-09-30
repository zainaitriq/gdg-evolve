import { type NextRequest, NextResponse } from "next/server"
import { generateTicketDownloadData } from "@/lib/ticket-generator"

export async function POST(request: NextRequest) {
  try {
    const ticketData = await request.json()

    // Validate required fields
    if (!ticketData.attendeeName || !ticketData.attendeeEmail || !ticketData.events) {
      return NextResponse.json({ error: "Missing required ticket data" }, { status: 400 })
    }

    const { html, filename } = generateTicketDownloadData(ticketData)

    // Return the HTML content with appropriate headers for download
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Ticket download API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
