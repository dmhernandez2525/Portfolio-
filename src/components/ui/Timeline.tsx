import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronRight, Briefcase, Home, Code, Rocket, Shield, Users, Sprout, Key, Smartphone, Target, GraduationCap } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TimelineItem } from "@/data/timeline"

const IconMap: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  home: Home,
  code: Code,
  rocket: Rocket,
  shield: Shield,
  users: Users,
  sprout: Sprout,
  key: Key,
  smartphone: Smartphone,
  target: Target,
  "graduation-cap": GraduationCap
}

function TimelineCard({ item, index, isExpanded, onToggle }: { item: TimelineItem; index: number; isExpanded: boolean; onToggle: () => void }) {
  const Icon = IconMap[item.icon || "briefcase"]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="relative pl-8 pb-8 border-l-2 border-border last:pb-0"
    >
      <div className="absolute left-[-9px] top-0 h-4 w-4 rounded-full bg-background border-2 border-primary" />
      
      <div 
        className={cn(
          "cursor-pointer group rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md hover:border-primary/50",
          isExpanded ? "ring-2 ring-primary/20 border-primary" : ""
        )}
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">{item.era}</span>
              <h4 className="text-lg font-bold">{item.title}</h4>
            </div>
          </div>
          {isExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
        </div>
        
        <p className="mt-2 text-muted-foreground">{item.description}</p>
        
        <AnimatePresence>
          {isExpanded && item.details && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4"
            >
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-2 border-l-2 border-border ml-1">
                {item.details.map((detail, i) => (
                  <li key={i}>{detail}</li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

interface TimelineProps {
  items: TimelineItem[]
}

export function Timeline({ items }: TimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="space-y-0">
      {items.map((item, index) => (
        <TimelineCard
          key={item.id}
          index={index}
          item={item}
          isExpanded={expandedId === item.id}
          onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
        />
      ))}
    </div>
  )
}
