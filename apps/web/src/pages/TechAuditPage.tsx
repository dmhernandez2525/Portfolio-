import { motion } from "framer-motion"
import {
  Clock,
  Video,
  Shield,
  Lightbulb,
  Download,
  ArrowDown,
  Wrench,
  Lock,
  Zap,
  AlertTriangle,
  Bot,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TechAuditBookingForm } from "@/components/tech-audit/TechAuditBookingForm"

const expectCards = [
  {
    icon: Clock,
    title: "20-40 Minutes",
    description: "Your choice of session length. Enough time to cover what matters without wasting your day.",
  },
  {
    icon: Video,
    title: "Recorded Session",
    description: "With your permission, the session is recorded so I can run it through AI analysis for deeper insights.",
  },
  {
    icon: Shield,
    title: "Fully Confidential",
    description: "A mutual NDA is available for download. Your intellectual property stays yours, period.",
  },
  {
    icon: Lightbulb,
    title: "Actionable Insights",
    description: "You walk away with real recommendations. No sales pitch, no upsell, just honest feedback.",
  },
]

const coverageItems = [
  {
    icon: Wrench,
    title: "Current Tools and Software",
    description: "Are you paying for overlapping subscriptions? Are you using 10% of a tool that costs you hundreds per month?",
  },
  {
    icon: Lock,
    title: "Security Posture",
    description: "Passwords, two-factor authentication, backups, access control. The basics that most businesses skip.",
  },
  {
    icon: Zap,
    title: "Automation Opportunities",
    description: "Manual processes that could be automated to save hours every week. Data entry, email sequences, reporting.",
  },
  {
    icon: AlertTriangle,
    title: "Vendor Lock-in and Risks",
    description: "Are you stuck with a provider? What happens if they raise prices or shut down? Migration paths and alternatives.",
  },
  {
    icon: Bot,
    title: "AI Readiness",
    description: "Where AI could realistically help your business today. Not hype, just practical applications that save time.",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function TechAuditPage() {
  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-24 md:py-32">
        <div className="container max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
              <Shield className="h-4 w-4" />
              100% Free. No Strings Attached.
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Let's Talk About{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">
                Your Technology
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              Technology should not be a black box. Book a free, confidential session where we go
              through your business tools, systems, and processes together.
            </p>

            <p className="text-base text-muted-foreground/70 max-w-xl mx-auto mb-10">
              I believe understanding your own technology stack is a right, not a privilege. That is
              why this audit is completely free.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
                onClick={scrollToBooking}
              >
                Book Your Free Audit
                <ArrowDown className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => window.open("/nda.pdf", "_blank")}
              >
                <Download className="h-4 w-4" />
                Download NDA
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What to Expect</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A straightforward conversation about your technology. No jargon, no pressure.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {expectCards.map((card) => (
              <motion.div key={card.title} variants={itemVariants}>
                <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-emerald-500/30 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 mb-4">
                      <card.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold mb-2">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* What We Cover */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Cover</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every business is different. We will focus on what matters most to yours.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-4"
          >
            {coverageItems.map((item) => (
              <motion.div key={item.title} variants={itemVariants}>
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-emerald-500/20 transition-colors">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* NDA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-emerald-500/20">
              <CardContent className="p-8 md:p-10 text-center">
                <Shield className="h-10 w-10 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-3">Your Information Stays Protected</h3>
                <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                  A mutual Non-Disclosure Agreement is available for both of us to sign before the
                  session. You retain all rights to your ideas, business information, and
                  intellectual property. I will not share anything discussed outside of the tools and
                  systems I use to generate your insights.
                </p>
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 border-emerald-500/30 hover:border-emerald-500/50"
                  onClick={() => window.open("/nda.pdf", "_blank")}
                >
                  <Download className="h-4 w-4" />
                  Download Mutual NDA
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Booking Form */}
      <TechAuditBookingForm />

      {/* Trust / Philosophy */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Is This Free?</h2>
            <div className="space-y-4 text-muted-foreground text-left max-w-2xl mx-auto">
              <p>
                I have spent years building systems, automating processes, and helping businesses
                make sense of their technology. Along the way, I noticed something: most small and
                mid-size businesses are paying too much for tools they barely understand.
              </p>
              <p>
                Technology should be democratized. Understanding what you have, what you need, and
                what you can cut should not require an expensive consultant or a multi-week
                engagement. Sometimes, a 30-minute conversation is all it takes.
              </p>
              <p>
                This audit is my way of giving back. If we discover that you need deeper help, great.
                If all you needed was clarity, that is a win too. Either way, you leave with
                something useful.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
