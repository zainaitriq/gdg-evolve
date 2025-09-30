"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import WorkshopRegistrationModal from "@/components/workshop-registration-modal"

interface Workshop {
  id: number
  name: string
  description: string
  date: string
  start_time: string
  end_time: string
  location: string
  capacity: number
  current_registrations: number
  speakers: any[]
  prerequisites: string[]
}

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkshops()
  }, [])

  const fetchWorkshops = async () => {
    try {
      const response = await fetch("/api/events?type=workshop")
      const data = await response.json()

      const workshopsWithPrerequisites = data.map((workshop: Workshop) => ({
        ...workshop,
        prerequisites: workshop.prerequisites || getMockPrerequisites(workshop.name),
      }))

      setWorkshops(workshopsWithPrerequisites)
    } catch (error) {
      console.error("Error fetching workshops:", error)
    } finally {
      setLoading(false)
    }
  }

  const getMockPrerequisites = (workshopName: string): string[] => {
    const prerequisitesMap: { [key: string]: string[] } = {
      "React Fundamentals": [
        "Basic knowledge of HTML, CSS, and JavaScript",
        "Understanding of ES6+ features (arrow functions, destructuring, modules)",
        "Familiarity with npm and package management",
      ],
      "Node.js Backend Development": [
        "Solid understanding of JavaScript fundamentals",
        "Basic knowledge of HTTP protocols and REST APIs",
        "Experience with command line interface",
        "Node.js installed on your machine",
      ],
      "Mobile App Development with Flutter": [
        "Basic programming experience in any language",
        "Understanding of object-oriented programming concepts",
        "Flutter SDK installed on your development machine",
        "Android Studio or VS Code with Flutter extensions",
      ],
      "Machine Learning with Python": [
        "Intermediate Python programming skills",
        "Basic understanding of statistics and linear algebra",
        "Familiarity with data structures and algorithms",
        "Jupyter Notebook or Python IDE installed",
      ],
      "Cloud Computing with AWS": [
        "Basic understanding of web technologies",
        "Familiarity with command line operations",
        "AWS account (free tier is sufficient)",
        "Basic knowledge of networking concepts",
      ],
      "UI/UX Design Principles": [
        "No prior design experience required",
        "Basic computer skills and internet access",
        "Design software (Figma account recommended)",
        "Creative mindset and willingness to learn",
      ],
    }

    // Return specific prerequisites if workshop name matches, otherwise return generic ones
    return (
      prerequisitesMap[workshopName] || [
        "Basic programming knowledge",
        "Laptop with development environment setup",
        "Enthusiasm to learn new technologies",
      ]
    )
  }

  const handleRegisterClick = (workshop: Workshop) => {
    setSelectedWorkshop(workshop)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedWorkshop(null)
    // Refresh workshops to update registration counts
    fetchWorkshops()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading workshops...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Workshops</h1>
          <p className="text-lg text-muted-foreground">
            Hands-on learning experiences with industry experts in small group settings.
          </p>
        </div>

        <div className="grid gap-8">
          {workshops.map((workshop) => (
            <Card key={workshop.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl sm:text-2xl mb-2">{workshop.name}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge className="bg-green-100 text-green-800 text-xs">Workshop</Badge>
                      <Badge
                        variant={workshop.current_registrations >= workshop.capacity ? "destructive" : "default"}
                        className="text-xs"
                      >
                        {workshop.current_registrations >= workshop.capacity ? "Full" : "Available"}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm sm:text-base">{workshop.description}</CardDescription>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end gap-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-1">👥</span>
                      {workshop.current_registrations}/{workshop.capacity}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 mb-6">
                  <div className="flex items-center text-gray-600 text-sm">
                    <span className="mr-2">🕒</span>
                    {new Date(workshop.date).toLocaleDateString()} • {workshop.start_time} - {workshop.end_time}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <span className="mr-2">📍</span>
                    {workshop.location}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <span className="mr-2">👥</span>
                    Max {workshop.capacity} participants
                  </div>
                </div>

                {workshop.speakers && workshop.speakers.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Workshop Leader</h3>
                    {workshop.speakers.map((speaker: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-lg">👤</span>
                        </div>
                        <div>
                          <p className="font-medium">{speaker.name}</p>
                          <p className="text-sm text-gray-600">
                            {speaker.title} at {speaker.company}
                          </p>
                          {speaker.bio && <p className="text-sm text-gray-600 mt-1">{speaker.bio}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {workshop.prerequisites && workshop.prerequisites.length > 0 && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                    <h3 className="font-semibold mb-3 text-google-red flex items-center">
                      <div className="w-2 h-2 bg-google-red rounded-full mr-2"></div>
                      Prerequisites
                    </h3>
                    <ul className="space-y-2">
                      {workshop.prerequisites.map((prerequisite, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-google-blue rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{prerequisite}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={() => handleRegisterClick(workshop)}
                    disabled={workshop.current_registrations >= workshop.capacity}
                    className="w-full sm:w-auto"
                  >
                    {workshop.current_registrations >= workshop.capacity ? "Workshop Full" : "Register Now"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {workshops.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No workshops available at this time.</p>
          </div>
        )}
      </div>

      <WorkshopRegistrationModal workshop={selectedWorkshop} isOpen={isModalOpen} onClose={handleModalClose} />
    </div>
  )
}
