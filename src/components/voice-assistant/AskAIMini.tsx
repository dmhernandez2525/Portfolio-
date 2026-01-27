/**
 * AskAIMini - Compact CTA for embedding in sections
 *
 * Use this in About, Projects, Skills, or other sections
 * to encourage users to ask questions about specific content.
 */

import { motion } from "framer-motion"
import { Bot, MessageCircle } from "lucide-react"

interface AskAIMiniProps {
  variant?: "default" | "subtle" | "accent"
  text?: string
  className?: string
}

export function AskAIMini({
  variant = "default",
  text = "Have questions about this?",
  className = ""
}: AskAIMiniProps) {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('open-ai-chat'))
  }

  const variants = {
    default: "bg-primary/10 hover:bg-primary/20 border-primary/20 hover:border-primary/40",
    subtle: "bg-muted/50 hover:bg-muted border-border hover:border-primary/30",
    accent: "bg-gradient-to-r from-primary/20 to-purple-500/20 hover:from-primary/30 hover:to-purple-500/30 border-primary/30"
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={handleClick}
      className={`group inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${variants[variant]} ${className}`}
    >
      <Bot className="w-4 h-4 text-primary" />
      <span className="text-sm">
        {text} <span className="text-primary font-medium">Ask AI</span>
      </span>
      <MessageCircle className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  )
}
