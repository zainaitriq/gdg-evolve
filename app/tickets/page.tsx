import type { Metadata } from "next"
import RSVPForm from "@/components/rsvp-form"
import RegistrationStatusCheck from "@/components/registration-status-check"
import { getEvents } from "@/lib/database"
import AdminSyncButton from "@/components/admin-sync-button"
export const metadata: Metadata = {
  title: "Reserve Your Ticket | Evolve Conference 2025",
  description: "Reserve your ticket for Evolve Conference 2025. Choose from sessions, workshops, or competitions.",
}

export default async function TicketsPage() {
  const events = await getEvents()

const excludedEvents = [
  "opening ceremony",
  "registration & check-in",
  "panel discussion: technology, innovation & youth in jordan",
  "[tba]",
  "from passkeys to unified identity and cloud security",
  "cloud migration & reliability culture",
  "closing ceremony",
 "invisible avatars: hacker in virtual realms",
  "cloud computing",
  "ctf (capture the flag): cybersecurity challenges and puzzles",
  "lunch break",
  "think inside the box: the container revolution",
  "vibe coding: build a product in under 60 mins",
 "intro to site reliability engineering",
  "active pieces workshop  ai",
  "leveling up computer science skills: building real-time chat apps with node.js & socket.io",
  "appreciation ceremony"
 , "cpc (collegiate programming contest): small app/feature build under time limit."
];

const selectableEvents = events.filter((event) =>
  !excludedEvents.includes(event.name?.toLowerCase())
);
  return (
    <div className="container mx-auto px-4 py-16 space-y-16">
      <RegistrationStatusCheck />

       {/* Temporary admin button - remove after fixing  <AdminSyncButton />
       
        "leveling up computer science skills: building real-time chat apps with node.js & socket.io",
       */}


      <div className="border-t border-gray-200" />

      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-google-red">Register for Evolve Conference 2025</h2>
          <p className="text-gray-600 text-lg">Join us for an amazing tech conference experience</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> The Opening Ceremony and all sessions is automatically included with every ticket registration.
            </p>
          </div>
        </div>
        <RSVPForm events={selectableEvents} />
      </div>
    </div>
  )
}
