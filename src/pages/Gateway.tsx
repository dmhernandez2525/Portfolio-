import { motion } from "framer-motion"
import { CreditCard, FileText, Sparkles, Terminal, Monitor, BarChart3, CalendarDays } from "lucide-react"
import { useMode, type PortfolioMode } from "@/context/mode-context"

const modes: { key: PortfolioMode; title: string; description: string; icon: typeof CreditCard; accent: string; bg: string; preview: string; comingSoon?: boolean }[] = [
  {
    key: "business-card",
    title: "Business Card",
    description: "Just the essentials — name, links, and a quick intro.",
    icon: CreditCard,
    accent: "from-slate-400 to-zinc-500",
    bg: "hover:border-slate-400/50",
    preview: "Minimal & clean",
  },
  {
    key: "resume",
    title: "Resume",
    description: "Professional overview — skills, experience, and projects.",
    icon: FileText,
    accent: "from-blue-400 to-indigo-500",
    bg: "hover:border-blue-400/50",
    preview: "Professional & detailed",
  },
  {
    key: "creative",
    title: "Creative",
    description: "The full experience — animations, 3D globe, games, and easter eggs.",
    icon: Sparkles,
    accent: "from-pink-400 to-purple-500",
    bg: "hover:border-pink-400/50",
    preview: "Interactive & immersive",
  },
  {
    key: "techie",
    title: "Techie",
    description: "A retro terminal interface — browse my portfolio like a filesystem.",
    icon: Terminal,
    accent: "from-green-400 to-emerald-500",
    bg: "hover:border-green-400/50",
    preview: "Terminal & hacker vibes",
  },
  {
    key: "retro",
    title: "Retro Terminal",
    description: "Vintage computing — green phosphor CRT with command-line navigation.",
    icon: Monitor,
    accent: "from-lime-400 to-green-600",
    bg: "hover:border-lime-400/50",
    preview: "1980s hacker vibes",
  },
  {
    key: "dashboard",
    title: "Dashboard",
    description: "Career analytics — skills radar, project metrics, and data visualizations.",
    icon: BarChart3,
    accent: "from-orange-400 to-red-500",
    bg: "hover:border-orange-400/50",
    preview: "Data-driven & analytical",
  },
  {
    key: "calendar",
    title: "Book a Meeting",
    description: "Schedule time with me — coming soon! This feature is currently under development.",
    icon: CalendarDays,
    accent: "from-teal-400 to-cyan-500",
    bg: "hover:border-teal-400/50",
    preview: "Coming Soon",
    comingSoon: true,
  },
]

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

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
          Daniel Hernandez
        </h1>
        <p className="text-lg text-muted-foreground">
          How would you like to explore?
        </p>
      </motion.div>

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
        You can switch modes anytime
      </motion.p>
    </div>
  )
}
