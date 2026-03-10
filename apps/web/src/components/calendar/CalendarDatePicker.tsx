import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Globe, ArrowLeft, Clock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  getMonthGrid,
  isWeekday,
  isPast,
  isSameDay,
  isMonthInRange,
  formatDate,
  toDateString,
  MONTH_NAMES,
  DAY_HEADERS,
  type MeetingType,
} from '@/data/calendar'
import { api, type ApiTimeSlot } from '@/lib/api'

interface CalendarDatePickerProps {
  meeting: MeetingType
  timezone: string
  onTimeSelect: (date: Date, time: string, timeLabel: string) => void
  onBack: () => void
}

export function CalendarDatePicker({ meeting, timezone, onTimeSelect, onBack }: CalendarDatePickerProps) {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [slots, setSlots] = useState<ApiTimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const grid = useMemo(() => getMonthGrid(viewYear, viewMonth), [viewYear, viewMonth])

  const availableSlots = useMemo(() => slots.filter(s => s.available), [slots])

  // Fetch availability when a date is selected
  useEffect(() => {
    if (!selectedDate) {
      setSlots([])
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    api
      .getAvailability(toDateString(selectedDate), meeting.id, timezone)
      .then((res) => {
        if (!cancelled) setSlots(res.slots)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load availability")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [selectedDate, meeting.id, timezone])

  const canGoBack = isMonthInRange(
    viewMonth === 0 ? viewYear - 1 : viewYear,
    viewMonth === 0 ? 11 : viewMonth - 1,
  )
  const canGoForward = isMonthInRange(
    viewMonth === 11 ? viewYear + 1 : viewYear,
    viewMonth === 11 ? 0 : viewMonth + 1,
  )

  function navigateMonth(direction: -1 | 1) {
    const newMonth = viewMonth + direction
    if (newMonth < 0) {
      setViewMonth(11)
      setViewYear(y => y - 1)
    } else if (newMonth > 11) {
      setViewMonth(0)
      setViewYear(y => y + 1)
    } else {
      setViewMonth(newMonth)
    }
    setSelectedDate(null)
  }

  function handleDateClick(date: Date) {
    if (isPast(date) || !isWeekday(date)) return
    setSelectedDate(date)
  }

  function handleTimeClick(slot: ApiTimeSlot) {
    if (!selectedDate || !slot.available) return
    onTimeSelect(selectedDate, slot.startTime, slot.label)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back button + meeting info */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg text-[#6b8a8e] hover:text-teal-400 hover:bg-[#111a1e] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h3 className="text-lg font-semibold text-white">{meeting.title}</h3>
          <p className="text-xs text-[#6b8a8e]">
            <Clock className="w-3 h-3 inline mr-1" />
            {meeting.duration} min
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar grid */}
        <div className="flex-1 min-w-0">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth(-1)}
              disabled={!canGoBack}
              className="p-1.5 rounded-lg text-[#6b8a8e] hover:text-teal-400 hover:bg-[#111a1e] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-white">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              onClick={() => navigateMonth(1)}
              disabled={!canGoForward}
              className="p-1.5 rounded-lg text-[#6b8a8e] hover:text-teal-400 hover:bg-[#111a1e] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_HEADERS.map((d) => (
              <div key={d} className="text-center text-xs text-[#6b8a8e] py-1 font-medium">
                {d}
              </div>
            ))}
          </div>

          {/* Date cells */}
          <div className="grid grid-cols-7 gap-1">
            {grid.map((date, i) => {
              if (!date) {
                return <div key={`empty-${i}`} className="aspect-square" />
              }

              const past = isPast(date)
              const weekend = !isWeekday(date)
              const disabled = past || weekend
              const selected = selectedDate && isSameDay(date, selectedDate)

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  disabled={disabled}
                  className={`
                    aspect-square flex items-center justify-center rounded-lg text-sm transition-colors
                    ${disabled
                      ? 'text-[#2a3a3e] cursor-not-allowed'
                      : selected
                        ? 'bg-teal-600 text-white font-medium'
                        : 'text-white hover:bg-teal-900/40 cursor-pointer'
                    }
                  `}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        </div>

        {/* Time slots */}
        <div className="lg:w-48 flex-shrink-0">
          <AnimatePresence mode="wait">
            {selectedDate ? (
              <motion.div
                key={selectedDate.toISOString()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-sm font-medium text-white mb-1">
                  {formatDate(selectedDate)}
                </p>
                <div className="flex items-center gap-1 text-xs text-[#6b8a8e] mb-3">
                  <Globe className="w-3 h-3" />
                  <span>{timezone}</span>
                </div>

                {loading ? (
                  <div className="flex items-center gap-2 text-sm text-[#6b8a8e]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading times...
                  </div>
                ) : error ? (
                  <p className="text-sm text-red-400">{error}</p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-sm text-[#6b8a8e]">No available slots for this date.</p>
                ) : (
                  <div className="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto pr-1">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.startTime}
                        variant="outline"
                        size="sm"
                        onClick={() => handleTimeClick(slot)}
                        className="w-full text-xs border-[#1a2e32] text-teal-400 hover:bg-teal-900/30 hover:border-teal-700/50 hover:text-teal-300"
                      >
                        {slot.label}
                      </Button>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-[#6b8a8e] lg:mt-8"
              >
                Select a date to see available times.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
