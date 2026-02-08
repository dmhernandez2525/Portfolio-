import { motion } from "framer-motion"
import { Download, Github, Linkedin, Mail, Printer } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { experienceData } from "@/data/experience"
import { skillsData, type SkillCategory } from "@/data/skills"
import { projectsData } from "@/data/projects"

const QR_LINKS = [
  { label: "GitHub", url: "https://github.com/dmhernandez2525" },
  { label: "LinkedIn", url: "https://linkedin.com/in/dh25" },
  { label: "Portfolio", url: "https://interestingandbeyond.com" },
] as const

function ResumeQRCodes() {
  return (
    <div className="hidden print:block mt-8 pt-6 border-t border-border">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Scan to Connect
      </h2>
      <div className="flex items-start gap-8">
        {QR_LINKS.map((link) => (
          <div key={link.label} className="flex flex-col items-center gap-2">
            <QRCodeSVG value={link.url} size={80} level="M" />
            <span className="text-xs text-muted-foreground">{link.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}

const skillCategories: SkillCategory[] = ["Frontend", "Backend", "Database", "Cloud", "Beyond Code"]

export function ResumePage() {
  const topProjects = projectsData.filter((p) => p.tier === "flagship").slice(0, 6)

  return (
    <div className="min-h-screen bg-background">
      {/* Utility Bar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border print:hidden">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-end gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </button>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            PDF
          </a>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 print:py-0 print:px-0">
        {/* Header */}
        <motion.header {...fadeIn} transition={{ delay: 0.1 }} className="mb-10 print:mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-1">Daniel Hernandez</h1>
          <p className="text-lg text-muted-foreground mb-3">Senior Software Engineer</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <a href="mailto:daniel@interestingandbeyond.com" className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Mail className="h-3.5 w-3.5" /> daniel@interestingandbeyond.com
            </a>
            <a href="https://github.com/dmhernandez2525" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Github className="h-3.5 w-3.5" /> GitHub
            </a>
            <a href="https://linkedin.com/in/dh25" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Linkedin className="h-3.5 w-3.5" /> LinkedIn
            </a>
          </div>
        </motion.header>

        {/* Summary */}
        <motion.section {...fadeIn} transition={{ delay: 0.15 }} className="mb-10 print:mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 border-b border-border pb-1">Summary</h2>
          <p className="text-foreground leading-relaxed">
            Full-stack engineer with 6+ years of experience building production-grade applications across React, Node.js, Python, and cloud platforms.
            From co-founding a software consultancy to developing secure DoD applications for Space Force and Navy, I bring a builder's mindset to every project.
            Passionate about shipping high-quality software, mentoring teams, and making complex systems accessible.
          </p>
        </motion.section>

        {/* Skills */}
        <motion.section {...fadeIn} transition={{ delay: 0.2 }} className="mb-10 print:mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 border-b border-border pb-1">Skills</h2>
          <div className="space-y-2">
            {skillCategories.map((category) => {
              const skills = skillsData.filter((s) => s.category === category)
              return (
                <div key={category} className="flex flex-wrap items-baseline gap-x-1">
                  <span className="text-sm font-medium text-foreground mr-1">{category}:</span>
                  <span className="text-sm text-muted-foreground">
                    {skills.map((s) => s.name).join(", ")}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.section>

        {/* Experience */}
        <motion.section {...fadeIn} transition={{ delay: 0.25 }} className="mb-10 print:mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 border-b border-border pb-1">Experience</h2>
          <div className="space-y-6">
            {experienceData.map((exp) => (
              <div key={exp.id}>
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{exp.title}</h3>
                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 sm:mt-0 whitespace-nowrap">{exp.duration}</p>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{exp.description}</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {exp.achievements.map((a, i) => (
                    <li key={i} className="text-sm text-foreground/80">{a}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Projects */}
        <motion.section {...fadeIn} transition={{ delay: 0.3 }} className="mb-10 print:mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 border-b border-border pb-1">Selected Projects</h2>
          <div className="space-y-3">
            {topProjects.map((p) => (
              <div key={p.id} className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                <h3 className="text-sm font-medium text-foreground whitespace-nowrap">{p.title}</h3>
                <span className="hidden sm:inline text-muted-foreground/30 mx-1">—</span>
                <p className="text-sm text-muted-foreground">{p.tagline}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* QR codes - visible only in print */}
        <ResumeQRCodes />
      </div>
    </div>
  )
}
