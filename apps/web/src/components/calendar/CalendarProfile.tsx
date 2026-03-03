import { motion } from 'framer-motion'
import { Github, Linkedin, Mail } from 'lucide-react'

const socials = [
  { icon: Github, href: 'https://github.com/dmhernandez2525', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com/in/dh25', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:daniel@interestingandbeyond.com', label: 'Email' },
]

export function CalendarProfile() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center text-center lg:items-start lg:text-left"
    >
      <img
        src="/photos/daniel-headshot.png"
        alt="Daniel Hernandez"
        className="w-24 h-24 rounded-full object-cover border-2 border-teal-700/50 shadow-lg mb-4"
      />

      <h2 className="text-xl font-bold text-white mb-1">Daniel Hernandez</h2>
      <p className="text-sm text-teal-400 mb-3">Senior Software Engineer</p>

      <p className="text-sm text-[#8a9a9e] leading-relaxed mb-6">
        Building full-stack applications with React, TypeScript, and Python.
        Let's chat about tech, projects, or opportunities.
      </p>

      <div className="flex gap-3">
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            title={s.label}
            className="p-2 rounded-lg border border-[#1a2e32] text-[#6b8a8e] hover:text-teal-400 hover:border-teal-700/50 transition-colors"
          >
            <s.icon className="w-4 h-4" />
          </a>
        ))}
      </div>
    </motion.div>
  )
}
