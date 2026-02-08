import { motion } from 'framer-motion'
import { Zap, Coffee, Code } from 'lucide-react'
import type { MeetingType } from '@/data/calendar'

const ICONS: Record<string, typeof Zap> = {
  'quick-intro': Zap,
  'coffee-chat': Coffee,
  'technical-discussion': Code,
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

interface MeetingTypeSelectorProps {
  meetingTypes: MeetingType[]
  onSelect: (meeting: MeetingType) => void
}

export function MeetingTypeSelector({ meetingTypes, onSelect }: MeetingTypeSelectorProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-1">Select a Meeting Type</h3>
      <p className="text-sm text-[#6b8a8e] mb-6">Choose the type of meeting you'd like to schedule.</p>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-3"
      >
        {meetingTypes.map((meeting) => {
          const Icon = ICONS[meeting.id] ?? Zap
          return (
            <motion.button
              key={meeting.id}
              variants={cardVariants}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelect(meeting)}
              className="flex items-start gap-4 p-4 rounded-xl border border-[#1a2e32] bg-[#111a1e] hover:border-teal-700/60 transition-colors text-left cursor-pointer"
            >
              <div className="p-2.5 rounded-lg bg-teal-900/30 text-teal-400 flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white">{meeting.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-teal-900/40 text-teal-400">
                    {meeting.duration} min
                  </span>
                </div>
                <p className="text-sm text-[#6b8a8e]">{meeting.description}</p>
              </div>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}
