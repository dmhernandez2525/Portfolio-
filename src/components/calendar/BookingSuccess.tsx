import { motion } from 'framer-motion'
import { CheckCircle, Calendar, Clock, Globe, User, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BookingConfirmation } from '@/data/calendar'
import { formatDate } from '@/data/calendar'

interface BookingSuccessProps {
  booking: BookingConfirmation
  onBookAnother: () => void
}

export function BookingSuccess({ booking, onBookAnother }: BookingSuccessProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center text-center"
    >
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
        className="w-16 h-16 rounded-full bg-teal-900/30 flex items-center justify-center mb-4"
      >
        <CheckCircle className="w-8 h-8 text-teal-400" />
      </motion.div>

      <h3 className="text-xl font-bold text-white mb-1">Meeting Booked!</h3>
      <p className="text-sm text-[#6b8a8e] mb-6">
        A confirmation would be sent to {booking.guestEmail}
      </p>

      {/* Booking details card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-sm p-5 rounded-xl bg-[#111a1e] border border-[#1a2e32] text-left mb-6"
      >
        <div className="text-xs text-[#6b8a8e] mb-3 font-mono">{booking.id}</div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span className="text-white">{formatDate(new Date(booking.date))}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span className="text-white">
              {booking.timeLabel} ({booking.meetingType.duration} min)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Globe className="w-3.5 h-3.5 text-[#6b8a8e] flex-shrink-0" />
            <span className="text-[#6b8a8e]">{booking.timezone}</span>
          </div>

          <div className="border-t border-[#1a2e32] pt-3 mt-3">
            <div className="flex items-center gap-3 mb-2">
              <User className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span className="text-white">{booking.guestName}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span className="text-white">{booking.guestEmail}</span>
            </div>
          </div>

          <div className="text-xs text-[#6b8a8e] pt-1">
            {booking.meetingType.title}
          </div>
        </div>
      </motion.div>

      <Button
        onClick={onBookAnother}
        variant="outline"
        className="border-[#1a2e32] text-teal-400 hover:bg-teal-900/30 hover:border-teal-700/50"
      >
        Book Another Meeting
      </Button>
    </motion.div>
  )
}
