"use client"

import { useState } from "react"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface FAQItem {
  id: number
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    id: 1,
    question: "When and where is the Evolve Conference 2025?",
    answer: "The conference will be held on September 13, 2025, at Al-Hussein Technical University in Amman, Jordan. We'll have state-of-the-art facilities including modern auditoriums, computer labs, and networking spaces."
  },
  {
    id: 2,
    question: "How do I register for a workshop?",
    answer: "Go to the Workshops tab, browse the available workshops, and click Register next to the one you want to attend. Fill in your name and any required details. Your spot will be reserved immediately."
  },
  {
    id: 3,
    question: "How do I register for a competition?",
    answer: "Go to the Competitions tab, select the competition you want, and click Register. If its a team competition, the team leader will register the team members together"
  },
  {
    id: 4,
    question: "How do I register for both a workshop and a competition?",
    answer: "Team members (non-leaders) must first register individually in the Workshops tab if they want to attend a workshop. Team leader can then register for both the workshop and the competition under the Tickets tab. Make sure each member is included properly to avoid duplicates."
  },
  {
    id: 5,
    question: "Are tickets free or paid?",
    answer: "Tickets for all workshops and competitions at Evolve 2025 are completely free."
  },
   {
    id: 6,
    question: "Who can attend this conference?",
    answer: "The conference is open to everyone! Whether you're a student, professional developer, tech enthusiast, entrepreneur, or industry leader, you'll find valuable content and networking opportunities."
  },
  {
    id: 7,
    question: "Are there workshops or just presentations?",
    answer: "The conference features both keynote presentations and hands-on workshops. Our computer labs will be available for interactive coding sessions and practical learning experiences."
  }
]

export function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-black">Frequently Asked </span>
            <span className="text-google-red">Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Got questions about <span className="font-medium text-google-blue">Evolve Conference 2025</span>? 
            Find answers to the most common questions below.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openItems.includes(faq.id)
            const borderColor = index % 4 === 0 ? 'border-l-google-red' : 
                               index % 4 === 1 ? 'border-l-google-blue' :
                               index % 4 === 2 ? 'border-l-google-green' : 'border-l-yellow-500'
            
            return (
              <Card 
                key={faq.id} 
                className={`overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 ${borderColor}`}
              >
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-google-blue focus:ring-inset hover:bg-muted/20 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg pr-4 text-black">{faq.question}</h3>
                      <div className={`p-1 rounded-full transition-colors ${
                        isOpen ? 'bg-google-red text-white' : 'bg-muted text-muted-foreground'
                      }`}>
                        {isOpen ? (
                          <ChevronUpIcon className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 -mt-2 border-t border-border/50">
                      <div className="pt-4">
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        
        <div className="max-w-3xl mx-auto mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
          <p className="text-sm text-gray-700">
            <strong className="text-yellow-800">Note:</strong> Please do not register multiple times for the same session using different email addresses for the same team leader. Duplicate registrations can cause conflicts in team participation and scheduling.
          </p>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            <span className="text-black font-medium">Still have questions?</span>
          </p>
          <div className="space-y-2">
            <p className="text-sm">
              Contact us at{" "}
              <a 
                href="mailto:gdg_club@htu.edu.jo" 
                className="text-google-blue hover:text-google-red hover:underline font-medium transition-colors"
              >
                gdg_club.edu.jo
              </a>
            </p>
            <p className="text-sm">
              Follow us on social media{" "}
              <a 
                href="https://gdg.community.dev/gdg-amman/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-google-green hover:text-google-blue hover:underline font-medium transition-colors"
              >
                @GDGOnCampusHTU
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
