export interface TicketData {
  attendeeName: string
  attendeeEmail: string
  teamName?: string
  teamRole?: string
  teamMembers?: Array<{
    name: string
    email: string
    role: string
  }>
  events: Array<{
    name: string
    date: string
    start_time: string
    end_time: string
    location: string
    event_type: string
    status: "confirmed" | "waitlisted"
  }>
}

function formatTime(timeString: string): string {
  if (!timeString || timeString === "TBD") return "TBD"

  try {
    // Handle both HH:MM:SS and HH:MM formats
    const timeParts = timeString.split(":")
    const hours = Number.parseInt(timeParts[0], 10)
    const minutes = Number.parseInt(timeParts[1], 10)

    if (isNaN(hours) || isNaN(minutes)) return timeString

    const period = hours >= 12 ? "PM" : "AM"
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    const displayMinutes = minutes.toString().padStart(2, "0")

    return `${displayHours}:${displayMinutes} ${period}`
  } catch (error) {
    return timeString // Return original if parsing fails
  }
}

export function generateTicketHTML(data: TicketData): string {
  const confirmedEvents = data.events.filter((e) => e.status === "confirmed")
  const waitlistedEvents = data.events.filter((e) => e.status === "waitlisted")
  const hasTeamDetails = data.teamName && data.teamMembers && data.teamMembers.length > 0
  const isCompetition = data.events.some((e) => e.event_type === "competition")

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Evolve Conference 2025 - Event Ticket</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          max-width: 800px; 
          margin: 0 auto; 
          padding: 20px;
        }
        .ticket-header { 
          text-align: center; 
          margin-bottom: 30px; 
          border-bottom: 3px solid #e8343f; 
          padding-bottom: 20px;
        }
        .logo { max-width: 200px; height: auto; }
        .attendee-info { 
          background: #f8fafc; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0;
          border-left: 4px solid #4285f4;
        }
        .team-info { 
          background: #f0f9ff; 
          border: 2px solid #0ea5e9; 
          border-radius: 8px; 
          padding: 20px; 
          margin: 20px 0;
        }
        .team-member { 
          background: white; 
          border-radius: 6px; 
          padding: 12px; 
          margin: 8px 0; 
          border-left: 3px solid #0ea5e9;
        }
        .team-leader { border-left-color: #dc2626; background: #fef2f2; }
        .event-card { 
          border: 2px solid #e5e7eb; 
          border-radius: 12px; 
          padding: 20px; 
          margin: 20px 0; 
          page-break-inside: avoid;
        }
        .confirmed { border-color: #10b981; background: #f0fdf4; }
        .waitlisted { border-color: #f59e0b; background: #fffbeb; }
        .event-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 15px;
        }
        .event-type { 
          background: #4285f4; 
          color: white; 
          padding: 4px 12px; 
          border-radius: 20px; 
          font-size: 12px; 
          text-transform: uppercase;
        }
        .status-badge { 
          padding: 6px 12px; 
          border-radius: 20px; 
          font-size: 12px; 
          font-weight: bold;
        }
        .confirmed-badge { background: #dcfce7; color: #166534; }
        .waitlisted-badge { background: #fef3c7; color: #92400e; }
        .event-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .detail-item { margin-bottom: 10px; }
        .detail-label { font-weight: bold; color: #6b7280; font-size: 14px; }
        .detail-value { color: #111827; font-size: 16px; }
        .footer { 
          margin-top: 40px; 
          padding-top: 20px; 
          border-top: 2px solid #e5e7eb; 
          text-align: center;
          color: #6b7280;
        }
        .download-btn { 
          background: #4285f4; 
          color: white; 
          padding: 12px 24px; 
          border: none; 
          border-radius: 6px; 
          cursor: pointer; 
          font-size: 16px;
          margin: 20px 0;
        }
        .important-info { 
          background: #fef2f2; 
          border: 1px solid #fecaca; 
          border-radius: 8px; 
          padding: 20px; 
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="ticket-header">
        <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Evolve%20Logo-oH8PIGxNOZoACc7lgjqJ4lFAp0HDuB.png" alt="Evolve Conference" class="logo">
        <h1 style="color: #e8343f; margin: 20px 0 10px 0;">Event Ticket</h1>
        <p style="color: #6b7280; margin: 0;">September 13, 2025 • Al Hussein Technical University</p>
      </div>

      <div class="attendee-info">
        <h2 style="margin: 0 0 10px 0; color: #111827;">Attendee Information</h2>
        <p style="margin: 5px 0; font-size: 18px;"><strong>Name:</strong> ${data.attendeeName}</p>
        <p style="margin: 5px 0; color: #6b7280;"><strong>Email:</strong> ${data.attendeeEmail}</p>
        ${data.teamRole ? `<p style="margin: 5px 0; color: #0ea5e9;"><strong>Team Role:</strong> ${data.teamRole}</p>` : ""}
      </div>

      ${
        hasTeamDetails && isCompetition
          ? `
      <div class="team-info">
        <h2 style="margin: 0 0 15px 0; color: #0ea5e9;">🏆 Team Information</h2>
        <p style="margin: 5px 0; font-size: 18px;"><strong>Team Name:</strong> ${data.teamName}</p>
        <h3 style="margin: 15px 0 10px 0; color: #111827;">Team Members:</h3>
        ${data.teamMembers
          .map(
            (member) => `
          <div class="team-member ${member.role === "leader" ? "team-leader" : ""}">
            <p style="margin: 2px 0; font-weight: bold;">${member.name} ${member.role === "leader" ? "(Team Leader)" : ""}</p>
            <p style="margin: 2px 0; color: #6b7280; font-size: 14px;">${member.email}</p>
            <p style="margin: 2px 0; color: #6b7280; font-size: 14px;">Role: ${member.role}</p>
          </div>
        `,
          )
          .join("")}
      </div>
      `
          : ""
      }

      ${
        confirmedEvents.length > 0
          ? `
        <h2 style="color: #10b981; margin: 30px 0 20px 0;">✅ Confirmed Events</h2>
        ${confirmedEvents
          .map(
            (event) => `
          <div class="event-card confirmed">
            <div class="event-header">
              <h3 style="margin: 0; color: #111827;">${event.name}</h3>
              <div>
                <span class="event-type">${event.event_type}</span>
                <span class="status-badge confirmed-badge">CONFIRMED</span>
              </div>
            </div>
            <div class="event-details">
              <div class="detail-item">
                <div class="detail-label">Date</div>
                <div class="detail-value">${new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Time</div>
                <div class="detail-value">${formatTime(event.start_time)} - ${formatTime(event.end_time)}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Location</div>
                <div class="detail-value">${event.location}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Type</div>
                <div class="detail-value">${event.event_type}</div>
              </div>
            </div>
          </div>
        `,
          )
          .join("")}
      `
          : ""
      }

      ${
        waitlistedEvents.length > 0
          ? `
        <h2 style="color: #f59e0b; margin: 30px 0 20px 0;">⏳ Waitlisted Events</h2>
        <p style="color: #6b7280; margin-bottom: 20px;">You've been added to the waitlist for these events. We'll notify you if spots become available.</p>
        ${waitlistedEvents
          .map(
            (event) => `
          <div class="event-card waitlisted">
            <div class="event-header">
              <h3 style="margin: 0; color: #111827;">${event.name}</h3>
              <div>
                <span class="event-type">${event.event_type}</span>
                <span class="status-badge waitlisted-badge">WAITLISTED</span>
              </div>
            </div>
            <div class="event-details">
              <div class="detail-item">
                <div class="detail-label">Date</div>
                <div class="detail-value">${new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Time</div>
                <div class="detail-value">${formatTime(event.start_time)} - ${formatTime(event.end_time)}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Location</div>
                <div class="detail-value">${event.location}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Type</div>
                <div class="detail-value">${event.event_type}</div>
              </div>
            </div>
          </div>
        `,
          )
          .join("")}
      `
          : ""
      }

      <div class="important-info">
        <h3 style="color: #dc2626; margin: 0 0 15px 0;">Important Information</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Please arrive 15 minutes before your session starts</li>
          <li>Bring a valid ID for verification</li>
          <li>This ticket is required for entry to confirmed events</li>
          <li>Food and refreshments will be provided</li>
          <li>Event location: Al Hussein Technical University</li>
        </ul>
      </div>

      <div class="no-print" style="text-align: center; margin: 30px 0;">
        <button class="download-btn" onclick="window.print()">Print Ticket</button>
      </div>

      <div class="footer">
        <p><strong>Google Developer Group - Al Hussein Technical University</strong></p>
        <p>For questions, contact us at gdg_club@htu.edu.jo</p>
        <p>Follow us on social media: @GDG_HTU</p>
      </div>
    </body>
    </html>
  `
}

export function generateTicketDownloadData(data: TicketData): {
  html: string
  filename: string
} {
  const html = generateTicketHTML(data)
  const filename = `evolve-2025-ticket-${data.attendeeName.replace(/\s+/g, "-").toLowerCase()}.html`

  return { html, filename }
}
