import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSponsors } from "@/lib/database"

export const metadata: Metadata = {
  title: "Sponsors & Partners | Evolve Conference 2025",
  description: "Meet our amazing sponsors and partners who make Evolve Conference 2025 possible.",
}

interface Sponsor {
  id: string | number
  name: string
  tier: string
  logo_url?: string
  description?: string
  website_url?: string
}

export default async function SponsorsPage() {
  const sponsors = await getSponsors()

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Exclusive Sponsor":
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300"
      case "Snack Sponsors":
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300"
      case "Partners":
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200"
      default:
        return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300"
    }
  }

  const getTierSize = (tier: string) => {
    switch (tier) {
      case "Exclusive Sponsor":
        return "h-32 w-32"
      case "Snack Sponsors":
        return "h-28 w-28"
      case "Partners":
        return "h-24 w-24"
      default:
        return "h-16 w-16"
    }
  }

  // Group sponsors by tier
  const sponsorsByTier = Array.isArray(sponsors)
    ? sponsors.reduce((acc: Record<string, Sponsor[]>, sponsor: Sponsor) => {
        if (!acc[sponsor.tier]) {
          acc[sponsor.tier] = []
        }
        acc[sponsor.tier].push(sponsor)
        return acc
      }, {} as Record<string, Sponsor[]>)
    : {}

  const tierOrder = ["Exclusive Sponsor", "Snack Sponsors", "Partners"]
  const sponsorsArray = Array.isArray(sponsors) ? sponsors : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Sponsors & Partners
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Thank you to our amazing sponsors and partners who make this event possible.
            </p>
          </div>

          <div className="space-y-16">
            {tierOrder.map((tier) => {
              const tierSponsors = sponsorsByTier[tier]
              if (!tierSponsors || tierSponsors.length === 0) return null

              return (
                <div key={tier} className="text-center">
                  <div className="mb-12">
                    <Badge className={`${getTierColor(tier)} text-xl px-8 py-3 capitalize font-semibold shadow-lg text-slate-300 text-slate-400`}>
                      {tier}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {tierSponsors.map((sponsor: Sponsor) => (
                      <Card
                        key={sponsor.id}
                        className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 hover:border-blue-200 bg-white/80 backdrop-blur-sm"
                      >
                        <CardContent className="p-8 text-center h-full flex flex-col">
                          <div className={`flex items-center justify-center mb-6 mx-auto ${getTierSize(sponsor.tier)}`}>
                            {sponsor.logo_url ? (
                              <img
                                src={sponsor.logo_url || "/placeholder.svg"}
                                alt={sponsor.name}
                                className={`${getTierSize(sponsor.tier)} object-contain rounded-lg shadow-sm`}
                              />
                            ) : (
                              <div
                                className={`${getTierSize(sponsor.tier)} bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-inner`}
                              >
                                <span className="text-gray-600 font-semibold text-sm text-center px-2">
                                  {sponsor.name}
                                </span>
                              </div>
                            )}
                          </div>

                          <h3 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-blue-600 transition-colors">
                            {sponsor.name}
                          </h3>

                          {sponsor.description && (
                            <p className="text-gray-600 text-base mb-6 line-clamp-3 flex-grow leading-relaxed">
                              {sponsor.description}
                            </p>
                          )}

                          {sponsor.website_url && (
                            <a
                              href={sponsor.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                              Visit Website
                              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {sponsorsArray.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-gray-200">
                <div className="text-6xl mb-6">🎯</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Sponsors Coming Soon!</h3>
                <p className="text-gray-600 text-lg">We're working on bringing you amazing sponsors for this event.</p>
              </div>
            </div>
          )}

          <Card className="mt-20 bg-gradient-to-r from-blue-600 to-green-600 border-0 shadow-2xl">
            <CardContent className="p-12 text-center text-white">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl font-bold mb-6">Interested in Sponsoring?</h2>
                <p className="text-xl mb-8 opacity-90 leading-relaxed">
                  Join our amazing sponsors and help us create an unforgettable experience for the developer community.
                  Various sponsorship packages are available to suit your needs and budget.
                </p>
                <a
                  href="mailto:gdg_club@htu.edu"
                  className="inline-flex items-center justify-center px-10 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Become a Sponsor
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
