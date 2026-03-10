import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CreditCard, FileText, Sparkles, Terminal, Monitor, BarChart3, CalendarDays, Search, Sun, Moon, HelpCircle, ArrowRight, X } from "lucide-react"
import { useMode, type PortfolioMode } from "@/context/mode-context"
import { useTheme } from "@/components/providers/ThemeProvider"

const modes: { key: PortfolioMode; title: string; description: string; icon: typeof CreditCard; accent: string; bg: string; preview: string; comingSoon?: boolean }[] = [
  {
    key: "business-card",
    title: "Business Card",
    description: "Just the essentials. Name, links, and a quick intro.",
    icon: CreditCard,
    accent: "from-slate-400 to-zinc-500",
    bg: "hover:border-slate-400/50",
    preview: "Minimal & clean",
  },
  {
    key: "resume",
    title: "Resume",
    description: "Professional overview with skills, experience, and projects.",
    icon: FileText,
    accent: "from-blue-400 to-indigo-500",
    bg: "hover:border-blue-400/50",
    preview: "Professional & detailed",
  },
  {
    key: "creative",
    title: "Creative",
    description: "The full experience with animations, 3D globe, games, and easter eggs.",
    icon: Sparkles,
    accent: "from-pink-400 to-purple-500",
    bg: "hover:border-pink-400/50",
    preview: "Interactive & immersive",
  },
  {
    key: "techie",
    title: "Techie",
    description: "VS Code-style interface. Browse my portfolio like a codebase.",
    icon: Terminal,
    accent: "from-green-400 to-emerald-500",
    bg: "hover:border-green-400/50",
    preview: "Terminal & hacker vibes",
  },
  {
    key: "retro",
    title: "Retro Terminal",
    description: "Vintage computing. Green phosphor CRT with command-line navigation.",
    icon: Monitor,
    accent: "from-lime-400 to-green-600",
    bg: "hover:border-lime-400/50",
    preview: "1980s hacker vibes",
  },
  {
    key: "dashboard",
    title: "Dashboard",
    description: "Career analytics with skills radar, project metrics, and data visualizations.",
    icon: BarChart3,
    accent: "from-orange-400 to-red-500",
    bg: "hover:border-orange-400/50",
    preview: "Data-driven & analytical",
  },
  {
    key: "consulting",
    title: "Consulting",
    description: "Technology consulting services. Book a free tech audit for your business.",
    icon: Search,
    accent: "from-emerald-400 to-teal-500",
    bg: "hover:border-emerald-400/50",
    preview: "Services & tech audits",
  },
  {
    key: "calendar",
    title: "Book a Meeting",
    description: "Schedule time with me. This feature is currently under development.",
    icon: CalendarDays,
    accent: "from-teal-400 to-cyan-500",
    bg: "hover:border-teal-400/50",
    preview: "Coming Soon",
    comingSoon: true,
  },
]

type WizardAnswer = "hire" | "services" | "explore" | "data" | null

const wizardQuestions: { question: string; options: { label: string; value: WizardAnswer }[] }[] = [
  {
    question: "What brings you here today?",
    options: [
      { label: "I'm looking to hire a developer", value: "hire" },
      { label: "I need technology consulting or a free tech audit", value: "services" },
      { label: "I just want to explore and see cool stuff", value: "explore" },
      { label: "I want to see skills and project data", value: "data" },
    ],
  },
]

const wizardResults: Record<NonNullable<WizardAnswer>, { mode: PortfolioMode; reason: string }> = {
  hire: { mode: "resume", reason: "Resume mode gives you a clean overview of my skills, experience, and projects." },
  services: { mode: "consulting", reason: "Consulting mode has my service offerings and a free tech audit booking form." },
  explore: { mode: "creative", reason: "Creative mode is the full interactive experience with animations, games, and easter eggs." },
  data: { mode: "dashboard", reason: "Dashboard mode shows career analytics, skills radar, and project metrics." },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
}

export function Gateway() {
  const { setMode } = useMode()
  const { theme, setTheme } = useTheme()
  const [showWizard, setShowWizard] = useState(false)
  const [wizardResult, setWizardResult] = useState<WizardAnswer>(null)

  const effectiveTheme = theme === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    : theme

  const toggleTheme = useCallback(() => {
    setTheme(effectiveTheme === "dark" ? "light" : "dark")
  }, [effectiveTheme, setTheme])

  const handleWizardAnswer = useCallback((answer: WizardAnswer) => {
    setWizardResult(answer)
  }, [])

  const handleWizardSelect = useCallback(() => {
    if (wizardResult) {
      setShowWizard(false)
      setMode(wizardResults[wizardResult].mode)
    }
  }, [wizardResult, setMode])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12 relative">
      {/* Theme toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2.5 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
        aria-label={`Switch to ${effectiveTheme === "dark" ? "light" : "dark"} mode`}
      >
        {effectiveTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
          Daniel Hernandez
        </h1>
        <p className="text-lg text-muted-foreground mb-2">
          Senior Software Engineer &amp; Technology Consultant
        </p>
        <p className="text-sm text-muted-foreground/70 max-w-lg mx-auto mb-4">
          This portfolio has multiple viewing modes. Pick the one that fits what you're looking for,
          from a quick business card to a full interactive experience.
        </p>

        {/* Help me choose button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={() => setShowWizard(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-blue-400/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:border-blue-400/50 transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
          Not sure? Let me help you choose
        </motion.button>
      </motion.div>

      {/* Mode cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full"
      >
        {modes.map((m) => (
          <motion.button
            key={m.key}
            variants={cardVariants}
            whileHover={m.comingSoon ? {} : { scale: 1.03, y: -4 }}
            whileTap={m.comingSoon ? {} : { scale: 0.98 }}
            onClick={() => !m.comingSoon && setMode(m.key)}
            disabled={m.comingSoon}
            className={`group relative flex flex-col items-center text-center p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm transition-colors duration-300 ${m.comingSoon ? 'cursor-not-allowed opacity-60' : `cursor-pointer ${m.bg}`}`}
          >
            {m.comingSoon && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">Coming Soon</span>
              </div>
            )}

            <div className={`mb-5 p-4 rounded-xl bg-gradient-to-br ${m.accent} ${m.comingSoon ? 'opacity-50' : ''} bg-opacity-10`}>
              <m.icon className="h-8 w-8 text-white" />
            </div>

            <h2 className="text-xl font-semibold mb-2 text-foreground">{m.title}</h2>

            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {m.description}
            </p>

            <span className={`text-xs font-medium bg-clip-text text-transparent bg-gradient-to-r ${m.accent} opacity-70 group-hover:opacity-100 transition-opacity`}>
              {m.preview}
            </span>
          </motion.button>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-10 text-xs text-muted-foreground/50"
      >
        You can switch modes anytime using the button in the corner
      </motion.p>

      {/* Wizard modal */}
      <AnimatePresence>
        {showWizard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowWizard(false); setWizardResult(null) } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
            >
              <button
                onClick={() => { setShowWizard(false); setWizardResult(null) }}
                className="absolute top-4 right-4 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              {!wizardResult ? (
                <>
                  <h3 className="text-lg font-semibold mb-1">{wizardQuestions[0].question}</h3>
                  <p className="text-sm text-muted-foreground mb-5">Pick the option that best describes you.</p>
                  <div className="space-y-3">
                    {wizardQuestions[0].options.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleWizardAnswer(opt.value)}
                        className="w-full text-left px-4 py-3 rounded-xl border border-border/50 hover:border-blue-400/50 hover:bg-blue-500/5 text-sm transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-2">
                    I'd recommend: {modes.find(m => m.key === wizardResults[wizardResult].mode)?.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {wizardResults[wizardResult].reason}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setWizardResult(null)}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                    >
                      Pick again
                    </button>
                    <button
                      onClick={handleWizardSelect}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                    >
                      Let's go <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
