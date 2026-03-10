import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CreditCard, FileText, Sparkles, Terminal, Monitor, BarChart3,
  CalendarDays, Search, Sun, Moon, HelpCircle, ArrowRight, ArrowLeft,
  X, LayoutGrid, FolderKanban,
} from "lucide-react"
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
    description: "Schedule time with me directly. Pick a meeting type, choose a date, and book.",
    icon: CalendarDays,
    accent: "from-teal-400 to-cyan-500",
    bg: "hover:border-teal-400/50",
    preview: "Schedule & connect",
  },
  {
    key: "projects",
    title: "Projects",
    description: "Browse all projects with filtering by tier, category, and status. Live demos included.",
    icon: FolderKanban,
    accent: "from-violet-400 to-purple-500",
    bg: "hover:border-violet-400/50",
    preview: "Full portfolio gallery",
  },
]

// Multi-step wizard with branching paths to ALL modes
type WizardStep = {
  question: string
  options: { label: string; next: string | null; mode?: PortfolioMode; reason?: string }[]
}

const wizardSteps: Record<string, WizardStep> = {
  start: {
    question: "What brings you here today?",
    options: [
      { label: "I'm looking to hire or evaluate a developer", next: "hire" },
      { label: "I need help with my business technology", next: "business" },
      { label: "I want to explore and have fun", next: "explore" },
      { label: "Just give me the quick version", next: null, mode: "business-card", reason: "Business Card mode gives you the essentials: name, links, and a quick intro. Nothing more, nothing less." },
    ],
  },
  hire: {
    question: "What would be most useful for your evaluation?",
    options: [
      { label: "A clean summary of skills and experience", next: null, mode: "resume", reason: "Resume mode shows my professional background, skills, and project history in a clean, scannable format." },
      { label: "Hard data: project metrics, tech stack coverage, code stats", next: null, mode: "dashboard", reason: "Dashboard mode displays career analytics, skills radar charts, and real project metrics so you can evaluate with data." },
      { label: "Browse all my projects with live demos", next: null, mode: "projects", reason: "Projects mode lets you filter and explore every project by tier, category, and tech stack, with live demo links where available." },
      { label: "I want to see the actual work and how it's built", next: null, mode: "creative", reason: "Creative mode is the full portfolio with project deep-dives, live demos, and the complete story behind each build." },
      { label: "I'd rather browse it like source code", next: null, mode: "techie", reason: "Techie mode presents my portfolio as a VS Code-style IDE where you can browse files, run terminal commands, and explore like a codebase." },
    ],
  },
  business: {
    question: "What kind of help are you looking for?",
    options: [
      { label: "A free technology audit for my business", next: null, mode: "consulting", reason: "Consulting mode has my service offerings and a booking form for a free, no-obligation technology audit." },
      { label: "Custom development, automation, or AI integration", next: null, mode: "consulting", reason: "Consulting mode outlines all my services: custom development, process automation, and AI integration. You can book a free intro session there." },
      { label: "I just want to book a meeting directly", next: null, mode: "calendar", reason: "Calendar mode lets you pick a meeting type, choose an available time slot, and book directly on my calendar." },
      { label: "I want to see your credentials and background first", next: null, mode: "resume", reason: "Resume mode gives you a professional overview of my skills, experience, and past projects before you commit to anything." },
    ],
  },
  explore: {
    question: "What's your vibe?",
    options: [
      { label: "Give me the full experience with all the bells and whistles", next: null, mode: "creative", reason: "Creative mode has everything: animations, a 3D globe, 16+ playable games, easter eggs, and a voice assistant. It's the showcase." },
      { label: "I like terminals and hacker aesthetics", next: "terminal" },
      { label: "Show me charts and data visualizations", next: null, mode: "dashboard", reason: "Dashboard mode is built around data viz: skills radar, project timelines, technology breakdowns, and career analytics." },
    ],
  },
  terminal: {
    question: "Pick your flavor:",
    options: [
      { label: "Modern VS Code / IDE style", next: null, mode: "techie", reason: "Techie mode looks like VS Code. File tree on the left, tabs across the top, integrated terminal at the bottom. Browse my portfolio like a codebase." },
      { label: "Old-school green phosphor CRT", next: null, mode: "retro", reason: "Retro Terminal mode is a vintage CRT simulation with green text, scanlines, and command-line navigation. Type 'help' to get started." },
    ],
  },
}

const FIRST_VISIT_KEY = "portfolio-first-visit-seen"

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
  const [wizardStepKey, setWizardStepKey] = useState("start")
  const [wizardHistory, setWizardHistory] = useState<string[]>([])
  const [wizardResult, setWizardResult] = useState<{ mode: PortfolioMode; reason: string } | null>(null)
  const [showFirstVisit, setShowFirstVisit] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem(FIRST_VISIT_KEY)
    if (!seen) {
      const timer = setTimeout(() => setShowFirstVisit(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const dismissFirstVisit = useCallback(() => {
    setShowFirstVisit(false)
    localStorage.setItem(FIRST_VISIT_KEY, "true")
  }, [])

  const effectiveTheme = theme === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    : theme

  const toggleTheme = useCallback(() => {
    setTheme(effectiveTheme === "dark" ? "light" : "dark")
  }, [effectiveTheme, setTheme])

  const openWizard = useCallback(() => {
    setWizardStepKey("start")
    setWizardHistory([])
    setWizardResult(null)
    setShowWizard(true)
  }, [])

  const closeWizard = useCallback(() => {
    setShowWizard(false)
    setWizardResult(null)
    setWizardHistory([])
    setWizardStepKey("start")
  }, [])

  const handleWizardOption = useCallback((opt: { next: string | null; mode?: PortfolioMode; reason?: string }) => {
    if (opt.mode && opt.reason) {
      setWizardResult({ mode: opt.mode, reason: opt.reason })
    } else if (opt.next) {
      setWizardHistory(prev => [...prev, wizardStepKey])
      setWizardStepKey(opt.next)
    }
  }, [wizardStepKey])

  const handleWizardBack = useCallback(() => {
    if (wizardResult) {
      setWizardResult(null)
      return
    }
    const prev = [...wizardHistory]
    const lastStep = prev.pop()
    if (lastStep) {
      setWizardHistory(prev)
      setWizardStepKey(lastStep)
    }
  }, [wizardResult, wizardHistory])

  const handleWizardSelect = useCallback(() => {
    if (wizardResult) {
      setShowWizard(false)
      setMode(wizardResult.mode)
    }
  }, [wizardResult, setMode])

  const currentStep = wizardSteps[wizardStepKey]
  const canGoBack = wizardResult || wizardHistory.length > 0

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
          onClick={openWizard}
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

      {/* First-visit tooltip */}
      <AnimatePresence>
        {showFirstVisit && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-20 left-4 sm:bottom-10 sm:left-10 z-50 max-w-xs"
          >
            <div className="relative rounded-xl border border-border bg-card p-4 shadow-2xl">
              <button
                onClick={dismissFirstVisit}
                className="absolute top-2 right-2 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-start gap-3 pr-4">
                <div className="flex-shrink-0 p-2 rounded-lg bg-blue-500/10 border border-blue-400/20">
                  <LayoutGrid className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Tip: You can always come back here</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    After picking a mode, look for the <strong>Switch Mode</strong> button in the
                    bottom-left corner to return to this page and try a different view.
                  </p>
                </div>
              </div>
              <button
                onClick={dismissFirstVisit}
                className="mt-3 w-full text-center text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Got it
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wizard modal */}
      <AnimatePresence>
        {showWizard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={(e) => { if (e.target === e.currentTarget) closeWizard() }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
            >
              <button
                onClick={closeWizard}
                className="absolute top-4 right-4 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              {!wizardResult ? (
                <>
                  {canGoBack && (
                    <button
                      onClick={handleWizardBack}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
                    >
                      <ArrowLeft className="h-3 w-3" /> Back
                    </button>
                  )}
                  <h3 className="text-lg font-semibold mb-1">{currentStep.question}</h3>
                  <p className="text-sm text-muted-foreground mb-5">Pick the option that best describes you.</p>
                  <div className="space-y-3">
                    {currentStep.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleWizardOption(opt)}
                        className="w-full text-left px-4 py-3 rounded-xl border border-border/50 hover:border-blue-400/50 hover:bg-blue-500/5 text-sm transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={handleWizardBack}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
                  >
                    <ArrowLeft className="h-3 w-3" /> Back
                  </button>
                  <h3 className="text-lg font-semibold mb-2">
                    I'd recommend: {modes.find(m => m.key === wizardResult.mode)?.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {wizardResult.reason}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setWizardResult(null); setWizardStepKey("start"); setWizardHistory([]) }}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                    >
                      Start over
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
