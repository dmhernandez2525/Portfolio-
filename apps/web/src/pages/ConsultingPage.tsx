import { motion } from "framer-motion"
import {
  Github,
  Linkedin,
  Mail,
  Search,
  Shield,
  Clock,
  Lightbulb,
  Wrench,
  Zap,
  Bot,
  ArrowRight,
  Download,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useMode } from "@/context/mode-context"

const socials = [
  { icon: Github, href: "https://github.com/dmhernandez2525", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com/in/dh25", label: "LinkedIn" },
  { icon: Mail, href: "mailto:danher2525@gmail.com", label: "Email" },
]

const auditHighlights = [
  { icon: Clock, text: "20-40 minutes, your choice" },
  { icon: Shield, text: "NDA available for full confidentiality" },
  { icon: Lightbulb, text: "Actionable insights, no sales pitch" },
]

const services = [
  {
    icon: Search,
    title: "Technology Audit",
    description: "Free review of your tools, processes, and security posture.",
    highlight: true,
  },
  {
    icon: Wrench,
    title: "Custom Development",
    description: "Full-stack web apps, APIs, and integrations built to your needs.",
    highlight: false,
  },
  {
    icon: Zap,
    title: "Process Automation",
    description: "Eliminate manual work with smart automation pipelines.",
    highlight: false,
  },
  {
    icon: Bot,
    title: "AI Integration",
    description: "Practical AI applications that save real time, not just buzzwords.",
    highlight: false,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export function ConsultingPage() {
  const { clearMode } = useMode()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0a1214] text-gray-100">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container max-w-5xl flex items-center justify-between py-4 px-4">
          <button
            onClick={clearMode}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Switch Mode
          </button>
          <a
            href="/nda.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <Download className="h-4 w-4" />
            Download NDA
          </a>
        </div>
      </header>

      <div className="container max-w-5xl px-4 py-16">
        {/* Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <img
            src="/photos/daniel-headshot.png"
            alt="Daniel Hernandez"
            className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-emerald-500/30 mb-6"
          />
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Daniel Hernandez</h1>
          <p className="text-lg text-emerald-400 mb-4">Technology Consultant</p>
          <p className="text-gray-400 max-w-lg mx-auto">
            Full-stack engineer with 10+ years of experience. I help businesses understand, optimize,
            and modernize their technology.
          </p>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="p-2.5 rounded-full border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-colors"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </motion.div>

        {/* Featured: Tech Audit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-20"
        >
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 md:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
              Featured Offering
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-4">Free Technology Audit</h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-8">
              Book a free, confidential session where we review your business technology together.
              No charge, no obligation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
              {auditHighlights.map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-sm text-gray-300">
                  <item.icon className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                clearMode()
                navigate("/tech-audit")
              }}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
            >
              Book Your Free Audit
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-center mb-10">Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((service) => (
              <motion.div
                key={service.title}
                variants={itemVariants}
                className={`rounded-xl border p-6 ${
                  service.highlight
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <service.icon
                  className={`h-6 w-6 mb-3 ${
                    service.highlight ? "text-emerald-500" : "text-gray-400"
                  }`}
                />
                <h3 className="font-semibold mb-1">{service.title}</h3>
                <p className="text-sm text-gray-400">{service.description}</p>
                {service.highlight && (
                  <span className="inline-block mt-3 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                    Always Free
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Philosophy */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center border-t border-white/10 pt-12"
        >
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            I believe technology should be democratized. Understanding your own tech stack is a
            right, not a privilege.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
