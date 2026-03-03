import { motion } from "framer-motion"
import { Search, Shield, Zap } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

const highlights = [
  {
    icon: Search,
    text: "Review your tools, subscriptions, and processes",
  },
  {
    icon: Shield,
    text: "NDA available so you can speak freely",
  },
  {
    icon: Zap,
    text: "Walk away with actionable recommendations",
  },
]

export function TechAudit() {
  return (
    <section className="py-20">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            Free for Everyone
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Free Technology Audit
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Book a free 20-40 minute session where we go through your business technology together.
            No cost, no obligation, no sales pitch.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10">
            {highlights.map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                <item.icon className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <Button
            asChild
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
          >
            <Link to="/tech-audit">Book Your Free Audit</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
