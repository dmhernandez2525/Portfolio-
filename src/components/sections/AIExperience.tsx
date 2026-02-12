import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Brain, Shield, Mic, ArrowRight, Sparkles, Terminal, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { aiStats } from "@/data/ai-development"

function AnimatedCounter({ target, suffix = "" }: { target: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  const numericValue = parseInt(target.replace(/[^0-9.]/g, ""), 10)
  const isDecimal = target.includes(".")
  const decimalValue = isDecimal ? parseFloat(target.replace(/[^0-9.]/g, "")) : numericValue

  useEffect(() => {
    if (hasAnimated || !ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const duration = 1500
          const startTime = performance.now()

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)

            if (isDecimal) {
              setCount(Math.round(eased * decimalValue * 10) / 10)
            } else {
              setCount(Math.round(eased * numericValue))
            }

            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }

          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [hasAnimated, numericValue, decimalValue, isDecimal])

  const displaySuffix = target.includes("+") ? "+" : ""

  return (
    <div ref={ref} className="text-3xl md:text-4xl font-bold text-primary">
      {isDecimal ? count.toFixed(1) : count}
      {displaySuffix}{suffix}
    </div>
  )
}

const highlightCards = [
  {
    icon: Layers,
    title: "Apps That Build Apps",
    description: "A 5-layer recursive ecosystem where prompts generate other prompts, specifications become code, and quality gates ensure production readiness across 77+ projects.",
    gradient: "from-amber-500/20 to-orange-500/20",
    border: "border-amber-500/30",
    iconColor: "text-amber-400",
  },
  {
    icon: Terminal,
    title: "10 Battle-Tested Prompt Patterns",
    description: "Reusable patterns forged in production: two-phase initialization, continuation-first research, mass feature builds, 3-pass code reviews, and branch chaining.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/30",
    iconColor: "text-blue-400",
  },
  {
    icon: Mic,
    title: "Voice-First AI (<500ms)",
    description: "Full duplex conversation via PersonaPlex. Not turn-based chat, but natural conversation with interruption support, back-channeling, and smart model routing.",
    gradient: "from-purple-500/20 to-pink-500/20",
    border: "border-purple-500/30",
    iconColor: "text-purple-400",
  },
  {
    icon: Shield,
    title: "Privacy-First Architecture",
    description: "7 projects where data never leaves the device. Local LLMs up to 72B parameters, BYOK patterns, AES-256-GCM encryption, zero data retention.",
    gradient: "from-green-500/20 to-emerald-500/20",
    border: "border-green-500/30",
    iconColor: "text-green-400",
  },
]

const displayStats = [
  { ...aiStats[0], suffix: "" },
  { ...aiStats[1], suffix: "" },
  { ...aiStats[2], suffix: "" },
  { ...aiStats[3], suffix: "" },
]

export function AIExperience() {
  return (
    <section id="ai-experience" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

      <div className="container max-w-6xl relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4 gap-1.5 px-3 py-1">
            <Brain className="h-3.5 w-3.5" />
            20+ Months of Production AI Work
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            AI & LLM Development
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete, production-grade system for building software with AI agents.
            Not experiments. Not demos. Real applications, real users, real engineering standards.
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {displayStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="text-center p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm"
            >
              <AnimatedCounter target={stat.value} />
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Highlight Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {highlightCards.map((card, i) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className={`p-6 rounded-xl border ${card.border} bg-gradient-to-br ${card.gradient} backdrop-blur-sm hover:scale-[1.02] transition-transform`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-lg bg-background/50 ${card.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{card.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Button asChild size="lg" className="gap-2 px-8">
            <Link to="/ai-development">
              <Sparkles className="h-4 w-4" />
              Explore the Full Story
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            11 production AI products, 10 prompt patterns, the complete journey
          </p>
        </motion.div>
      </div>
    </section>
  )
}
