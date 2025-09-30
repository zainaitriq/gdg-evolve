"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAdminAuth } from "@/lib/admin-auth"
import { Users, Trophy, User, Mail, Phone, GraduationCap } from "lucide-react"

interface TeamMember {
  id: number
  name: string
  email: string
  phone: string
  university: string
  major: string
  year_of_study: string
  role: string
  is_leader: boolean
}

interface Team {
  id: number
  name: string
  description: string
  event_name: string
  event_id: number
  event_type: string
  team_leader_name: string
  team_leader_email: string
  max_members: number
  created_at: string
  members: TeamMember[]
  total_members: number
}

export default function AdminTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCompetition, setSelectedCompetition] = useState("all")
  const [competitions, setCompetitions] = useState<{id: number, name: string}[]>([])
  const router = useRouter()
  const admin = useAdminAuth()

  useEffect(() => {
    if (!admin) {
      router.push("/admin/login")
      return
    }
    fetchTeams()
  }, [admin, router])

  useEffect(() => {
    let filtered = teams.filter(team =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.team_leader_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.members.some(member => 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )

    if (selectedCompetition !== "all") {
      filtered = filtered.filter(team => team.event_id === parseInt(selectedCompetition))
    }

    setFilteredTeams(filtered)
  }, [searchTerm, selectedCompetition, teams])

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/admin/teams")
      if (response.ok) {
        const data = await response.json()
        setTeams(data.teams)
        setFilteredTeams(data.teams)
        
        // Extract unique competitions
        const uniqueCompetitions = data.teams.reduce((acc: {id: number, name: string}[], team: Team) => {
          if (!acc.find(comp => comp.id === team.event_id)) {
            acc.push({ id: team.event_id, name: team.event_name })
          }
          return acc
        }, [])
        setCompetitions(uniqueCompetitions)
      }
    } catch (error) {
      console.error("Error fetching teams:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!admin) return null

  const totalTeams = teams.length
  const totalMembers = teams.reduce((sum, team) => sum + team.total_members, 0)
  const averageTeamSize = totalTeams > 0 ? (totalMembers / totalTeams).toFixed(1) : 0

  return (
    <AdminHeader>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Competition Teams</h1>
          <p className="text-gray-600">Manage competition teams and members</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTeams}</div>
              <p className="text-xs text-muted-foreground">Registered teams</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMembers}</div>
              <p className="text-xs text-muted-foreground">All team members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Competitions</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{competitions.length}</div>
              <p className="text-xs text-muted-foreground">Active competitions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Team Size</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageTeamSize}</div>
              <p className="text-xs text-muted-foreground">Members per team</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center flex-wrap">
          <Input
            placeholder="Search teams, leaders, or members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />

          <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by competition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Competitions</SelectItem>
              {competitions.map((competition) => (
                <SelectItem key={competition.id} value={competition.id.toString()}>
                  {competition.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Badge variant="outline">{filteredTeams.length} teams</Badge>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading teams...</div>
        ) : (
          <div className="grid gap-6">
            {filteredTeams.map((team) => (
              <Card key={team.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-600" />
                        {team.name}
                        <Badge variant="outline">{team.event_name}</Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {team.description || "No description provided"}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">
                        {team.total_members}/{team.max_members} members
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created {new Date(team.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Team Leader */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Team Leader
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-blue-600" />
                        <span className="font-medium">{team.team_leader_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-blue-600" />
                        <span>{team.team_leader_email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Team Members */}
                  {team.members.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Team Members ({team.members.filter(m => !m.is_leader).length})
                      </h4>
                      <div className="grid gap-3">
                        {team.members
                          .filter(member => !member.is_leader)
                          .map((member) => (
                          <div key={member.id} className="border rounded-lg p-3 bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-gray-900">{member.name}</h5>
                              <Badge variant="outline" className="text-xs">
                                {member.role}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{member.email}</span>
                              </div>
                              {member.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{member.phone}</span>
                                </div>
                              )}
                              {member.university && (
                                <div className="flex items-center gap-1">
                                  <GraduationCap className="h-3 w-3" />
                                  <span className="truncate">{member.university}</span>
                                </div>
                              )}
                              {member.major && (
                                <div className="flex items-center gap-1">
                                  <span className="truncate">{member.major}</span>
                                  {member.year_of_study && (
                                    <span className="text-gray-400">({member.year_of_study})</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const emailList = [team.team_leader_email, ...team.members.map(m => m.email)].join(';')
                        window.open(`mailto:${emailList}`)
                      }}
                    >
                      Contact Team
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredTeams.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No teams found matching your criteria</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminHeader>
  )
}
