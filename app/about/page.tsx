import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Target, Heart, Globe, Mail, Linkedin, Github } from "lucide-react"
import { getTeamMembers } from "@/lib/database"

export const metadata: Metadata = {
  title: "About GDG On Campus HTU | Evolve Conference 2025",
  description: "Learn about Google Developer Group On Campus at Al-Hussein Technical University and our mission.",
}

export default async function AboutPage() {
  const teamMembers = await getTeamMembers()

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About GDG On Campus HTU</h1>
          <p className="text-lg text-muted-foreground">
            Learn about our chapter, mission, and the amazing community we've built.
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center mb-4">
                <img src="/images/gdg-logo.png" alt="GDG Logo" className="h-12 w-12 mr-4" />
                <h2 className="text-2xl font-bold">Who We Are</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Google Developer Group (GDG) On Campus at Al-Hussein Technical University is a vibrant community of
                students, developers, and tech enthusiasts passionate about Google technologies and innovation. We are
                part of the global GDG network, bringing world-class developer education and networking opportunities
                directly to our campus.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Target className="h-8 w-8 text-blue-600 mr-3" />
                  <h3 className="text-xl font-semibold">Our Mission</h3>
                </div>
                <p className="text-gray-600">
                  To foster a community of learning, innovation, and collaboration among students and developers,
                  providing access to cutting-edge technologies and industry expertise.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Heart className="h-8 w-8 text-red-600 mr-3" />
                  <h3 className="text-xl font-semibold">Our Values</h3>
                </div>
                <p className="text-gray-600">
                  We believe in inclusive learning, open collaboration, and empowering the next generation of developers
                  to create solutions that make a positive impact on society.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Users className="h-8 w-8 text-green-600 mr-3" />
                <h2 className="text-2xl font-bold">Our Team</h2>
              </div>
              <p className="text-gray-600 mb-8">
                Meet the passionate individuals who make GDG On Campus HTU a thriving community of innovation and
                learning.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.length > 0 ? (
                  teamMembers.map((member, index) => {
                    // Generate initials from name
                    const initials = member.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)

                    // Generate color based on index
                    const colors = [
                      "from-blue-500 to-blue-600",
                      "from-red-500 to-red-600",
                      "from-green-500 to-green-600",
                      "from-yellow-500 to-yellow-600",
                      "from-purple-500 to-purple-600",
                      "from-pink-500 to-pink-600",
                    ]
                    const colorClass = colors[index % colors.length]

                    const textColors = [
                      "text-blue-600 hover:text-blue-600",
                      "text-red-600 hover:text-red-600",
                      "text-green-600 hover:text-green-600",
                      "text-yellow-600 hover:text-yellow-600",
                      "text-purple-600 hover:text-purple-600",
                      "text-pink-600 hover:text-pink-600",
                    ]
                    const textColorClass = textColors[index % textColors.length]

                    return (
                      <div key={member.name} className="text-center">
                        {member.image_url ? (
                          <img
                            src={member.image_url || "/placeholder.svg"}
                            alt={member.name}
                            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                          />
                        ) : (
                          <div
                            className={`w-24 h-24 bg-gradient-to-br ${colorClass} rounded-full mx-auto mb-4 flex items-center justify-center`}
                          >
                            <span className="text-white text-xl font-bold">{initials}</span>
                          </div>
                        )}
                        <h4 className="font-semibold text-lg mb-1">{member.name}</h4>
                        <p className={`${textColorClass.split(" ")[0]} text-sm mb-2`}>{member.role}</p>
                        <p className="text-gray-600 text-sm mb-3">
                          {member.bio || ""}
                        </p>
                        <div className="flex justify-center space-x-2">
                         
                          {member.linkedin_url && (
                            <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer">
                              <Linkedin className={`h-4 w-4 text-gray-400 ${textColorClass} cursor-pointer`} />
                            </a>
                          )}
                          {member.github_url && (
                            <a href={member.github_url} target="_blank" rel="noopener noreferrer">
                              <Github className={`h-4 w-4 text-gray-400 ${textColorClass} cursor-pointer`} />
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="col-span-full text-center text-gray-500">
                    <p>No team members found. Please add team members to the database.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Users className="h-8 w-8 text-green-600 mr-3" />
                <h2 className="text-2xl font-bold">What We Do</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Technical Workshops</h4>
                  <p className="text-gray-600 text-sm">
                    Hands-on learning sessions covering the latest Google technologies, frameworks, and development
                    practices.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Developer Events</h4>
                  <p className="text-gray-600 text-sm">
                    Regular meetups, hackathons, and conferences featuring industry experts and thought leaders.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Community Building</h4>
                  <p className="text-gray-600 text-sm">
                    Creating connections between students, professionals, and industry leaders in the tech ecosystem.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Career Development</h4>
                  <p className="text-gray-600 text-sm">
                    Providing mentorship, career guidance, and networking opportunities for aspiring developers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Globe className="h-8 w-8 text-purple-600 mr-3" />
                <h2 className="text-2xl font-bold">About Evolve Conference</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Evolve Conference 2025 is our flagship annual event, bringing together the brightest minds in technology{" "}
                {/* Updated year to 2025 */}
                for a day of learning, networking, and innovation. This year's theme focuses on the evolution of
                technology and its impact on society, featuring sessions on AI, web development, mobile technologies,
                and more.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Join us for an unforgettable experience with industry leaders, hands-on workshops, exciting
                competitions, and the opportunity to connect with like-minded individuals who share your passion for
                technology and innovation.
              </p>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  )
}
