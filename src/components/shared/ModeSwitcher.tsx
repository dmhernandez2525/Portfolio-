import { motion } from "framer-motion"
import { LayoutGrid } from "lucide-react"
import { useMode } from "@/context/mode-context"

export function ModeSwitcher() {
  const { mode, clearMode } = useMode()

  const isTechie = mode === 'techie'

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
      onClick={clearMode}
      title="Switch view mode"
      className={
        isTechie
          ? "fixed bottom-3 left-3 z-50 flex items-center gap-2 px-3 py-1.5 font-mono text-xs border border-[#3c3c3c] bg-[#1e1e1e] text-[#608b4e] hover:bg-[#2d2d2d] hover:text-[#b5cea8] transition-colors"
          : "fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors text-sm shadow-lg"
      }
    >
      <LayoutGrid className="h-4 w-4" />
      <span className="hidden sm:inline">Switch Mode</span>
    </motion.button>
  )
}
