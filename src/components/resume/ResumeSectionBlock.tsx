import { ChevronDown, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { ReactNode } from "react"
import type { ResumeSectionKey } from "@/types/resume"

interface ResumeSectionBlockProps {
  sectionKey: ResumeSectionKey
  title: string
  isVisible: boolean
  isCollapsed: boolean
  onToggleCollapse: (section: ResumeSectionKey) => void
  children: ReactNode
}

export function ResumeSectionBlock({
  sectionKey,
  title,
  isVisible,
  isCollapsed,
  onToggleCollapse,
  children,
}: ResumeSectionBlockProps) {
  if (!isVisible) {
    return null
  }

  return (
    <section className="rounded-xl border border-border bg-card/40 p-4 resume-section" data-section={sectionKey}>
      <button
        type="button"
        className="mb-3 flex w-full items-center justify-between text-left"
        onClick={() => onToggleCollapse(sectionKey)}
        aria-label={`Toggle ${title} section`}
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
        {isCollapsed ? <ChevronRight className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      <AnimatePresence initial={false}>
        {!isCollapsed ? (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
