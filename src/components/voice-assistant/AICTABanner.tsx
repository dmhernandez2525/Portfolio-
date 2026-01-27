/**
 * AICTABanner - Prominent AI assistant call-to-action banner
 *
 * Place this in the page content flow (e.g., between Hero and About)
 * to encourage users to interact with the AI assistant.
 */

import { motion } from "framer-motion"
import { Bot, MessageCircle } from "lucide-react"

export function AICTABanner() {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('open-ai-chat'))
  }

  return (
    <div className="py-8">
      <div className="container">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onClick={handleClick}
          className="w-full group"
        >
          <div className="relative flex items-center justify-center gap-4 py-4 px-6 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 hover:from-primary/30 hover:via-primary/20 hover:to-primary/30 border border-primary/30 hover:border-primary/50 transition-all duration-300 max-w-lg mx-auto shadow-lg shadow-primary/10 hover:shadow-primary/20">
            {/* Animated glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 animate-pulse" />

            <div className="relative flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <span className="block text-base font-medium text-foreground">
                  Got questions? <span className="text-primary">Ask my AI</span>
                </span>
                <span className="text-sm text-muted-foreground">
                  Skills, projects, or take a guided tour
                </span>
              </div>
              <MessageCircle className="w-5 h-5 text-primary ml-2 group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  )
}
