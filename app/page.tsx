import { HeroSection } from "@/components/hero-section"
import { AgendaPreview } from "@/components/agenda-preview"
import { SponsorsSection } from "@/components/sponsors-section"
import { VenueSection } from "@/components/venue-section"
import { StatsSection } from "@/components/stats-section"
import { FAQSection } from "@/components/faq-section"
export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <StatsSection />
      <AgendaPreview />
      <VenueSection />
        {/*  <FAQSection /> */}
       <FAQSection />
      <SponsorsSection />
    </div>
  )
}
