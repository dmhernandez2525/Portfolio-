import { motion } from "framer-motion"
import { Github, Linkedin, Mail, Download } from "lucide-react"

const socials = [
  { icon: Github, href: "https://github.com/dmhernandez2525", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com/in/dh25", label: "LinkedIn" },
  { icon: Mail, href: "mailto:daniel@interestingandbeyond.com", label: "Email" },
]

export function BusinessCardPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full text-center"
      >
        {/* Photo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <img
            src="/photos/daniel-headshot.png"
            alt="Daniel Hernandez"
            className="w-32 h-32 rounded-full mx-auto object-cover border-2 border-border shadow-lg"
          />
        </motion.div>

        {/* Name & Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Daniel Hernandez
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Senior Software Engineer
          </p>
        </motion.div>

        {/* Bio */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground leading-relaxed mb-8 px-4"
        >
          Full-stack engineer with 10+ years building production applications.
          From DoD platforms to co-founding a software consultancy — I ship code that matters.
          When I'm not coding, I'm welding, 3D printing, or building VR games.
        </motion.p>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="p-3 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
            >
              <s.icon className="h-5 w-5" />
            </a>
          ))}
        </motion.div>

        {/* Resume Download */}
        <motion.a
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors"
        >
          <Download className="h-4 w-4" />
          Download Resume
        </motion.a>
      </motion.div>
    </div>
  )
}
