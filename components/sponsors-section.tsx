import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { getDatabase } from "@/lib/database"

async function getSponsors() {
  try {
    const sql = getDatabase()
    const sponsors = await sql`
      SELECT * FROM conference.sponsors 
      WHERE is_active = true 
      ORDER BY 
        CASE tier 
          WHEN 'platinum' THEN 1 
          WHEN 'gold' THEN 2 
          WHEN 'silver' THEN 3 
          ELSE 4 
        END,
        name
    `
    return Array.isArray(sponsors) ? sponsors : []
  } catch (error) {
    console.error("Error fetching sponsors:", error)
    return []
  }
}

export async function SponsorsSection() {
  const sponsorsData = await getSponsors()

  const sponsorsArray = Array.isArray(sponsorsData) ? sponsorsData : []

  const sponsors = {
    exclusiveSponsor: sponsorsArray.filter((s) => s.tier === "Exclusive Sponsor"),
    snackSponsors: sponsorsArray.filter((s) => s.tier === "Snack Sponsors"),
    partners: sponsorsArray.filter((s) => s.tier === "Partners"),
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Sponsors</h2>
          <p className="text-lg text-muted-foreground">
            Thank you to our amazing sponsors who make this event possible
          </p>
        </div>

        <div className="space-y-12">
          {/* Platinum Sponsors */}
          {sponsors.exclusiveSponsor.length > 0 && (
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-6 text-grey-600">Exclusive Sponsor</h3>
              <div className="flex justify-center flex-wrap gap-8">
                {sponsors.exclusiveSponsor.map((sponsor) => (
                  <Card key={sponsor.id} className="p-8 hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <Link href={sponsor.website_url || "#"} target="_blank" rel="noopener noreferrer">
                        <Image
                          src={sponsor.logo_url || "/placeholder.svg?height=100&width=200"}
                          alt={sponsor.name}
                          width={200}
                          height={100}
                          className="h-20 w-auto opacity-80 hover:opacity-100 transition-opacity"
                        />
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Gold Sponsors */}
          {sponsors.snackSponsors.length > 0 && (
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-6 text-grey-500">Snack Sponsors</h3>
              <div className="flex justify-center flex-wrap gap-6">
                {sponsors.snackSponsors.map((sponsor) => (
                  <Card key={sponsor.id} className="p-6 hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <Link href={sponsor.website_url || "#"} target="_blank" rel="noopener noreferrer">
                        <Image
                          src={sponsor.logo_url || "/placeholder.svg?height=80&width=160"}
                          alt={sponsor.name}
                          width={160}
                          height={80}
                          className="h-16 w-auto opacity-80 hover:opacity-100 transition-opacity"
                        />
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Silver Sponsors */}
          {sponsors.partners.length > 0 && (
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-6 text-gray-500">Partners</h3>
              <div className="flex justify-center flex-wrap gap-4">
                {sponsors.partners.map((sponsor) => (
                  <Card key={sponsor.id} className="p-4 hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <Link href={sponsor.website_url || "#"} target="_blank" rel="noopener noreferrer">
                        <Image
                          src={sponsor.logo_url || "/placeholder.svg?height=60&width=120"}
                          alt={sponsor.name}
                          width={120}
                          height={60}
                          className="h-12 w-auto opacity-80 hover:opacity-100 transition-opacity"
                        />
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
