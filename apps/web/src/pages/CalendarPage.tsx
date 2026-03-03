import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Construction } from 'lucide-react'
import { CalendarProfile } from '@/components/calendar/CalendarProfile'
import { MeetingTypeSelector } from '@/components/calendar/MeetingTypeSelector'
import { CalendarDatePicker } from '@/components/calendar/CalendarDatePicker'
import { BookingForm } from '@/components/calendar/BookingForm'
import { BookingSuccess } from '@/components/calendar/BookingSuccess'
import {
  meetingTypes,
  getVisitorTimezone,
  generateBookingId,
  toDateString,
  type MeetingType,
  type BookingFormData,
  type BookingConfirmation,
} from '@/data/calendar'

type BookingStep = 'select-meeting' | 'select-date' | 'confirm-booking' | 'success'

export function CalendarPage() {
  const timezone = useMemo(getVisitorTimezone, [])

  const [step, setStep] = useState<BookingStep>('select-meeting')
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingType | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTimeLabel, setSelectedTimeLabel] = useState('')
  const [booking, setBooking] = useState<BookingConfirmation | null>(null)

  function handleMeetingSelect(meeting: MeetingType) {
    setSelectedMeeting(meeting)
    setStep('select-date')
  }

  function handleTimeSelect(date: Date, _timeRaw: string, timeLabel: string) {
    setSelectedDate(date)
    setSelectedTimeLabel(timeLabel)
    setStep('confirm-booking')
  }

  function handleBookingSubmit(data: BookingFormData) {
    if (!selectedMeeting || !selectedDate) return

    const confirmation: BookingConfirmation = {
      id: generateBookingId(),
      meetingType: selectedMeeting,
      date: toDateString(selectedDate),
      timeLabel: selectedTimeLabel,
      timezone,
      guestName: data.name,
      guestEmail: data.email,
    }

    setBooking(confirmation)
    setStep('success')
  }

  function handleBookAnother() {
    setStep('select-meeting')
    setSelectedMeeting(null)
    setSelectedDate(null)
    setSelectedTimeLabel('')
    setBooking(null)
  }

  function handleBackToMeetings() {
    setStep('select-meeting')
    setSelectedMeeting(null)
  }

  function handleBackToDate() {
    setStep('select-date')
  }

  return (
    <div className="min-h-screen bg-[#0a1214] text-white">
      {/* Development banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-900/30 border-b border-amber-700/40 px-4 py-2.5 text-center"
      >
        <p className="text-sm text-amber-300 flex items-center justify-center gap-2">
          <Construction className="w-4 h-4" />
          Under Development — Booking is simulated and not yet connected to a real calendar.
        </p>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">
          {/* Profile sidebar */}
          <div className="lg:border-r lg:border-[#1a2e32] lg:pr-8">
            <CalendarProfile />
          </div>

          {/* Booking flow */}
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              {step === 'select-meeting' && (
                <MeetingTypeSelector
                  key="meeting-select"
                  meetingTypes={meetingTypes}
                  onSelect={handleMeetingSelect}
                />
              )}

              {step === 'select-date' && selectedMeeting && (
                <CalendarDatePicker
                  key="date-pick"
                  meeting={selectedMeeting}
                  timezone={timezone}
                  onTimeSelect={handleTimeSelect}
                  onBack={handleBackToMeetings}
                />
              )}

              {step === 'confirm-booking' && selectedMeeting && selectedDate && (
                <BookingForm
                  key="booking-form"
                  meeting={selectedMeeting}
                  date={selectedDate}
                  timeLabel={selectedTimeLabel}
                  timezone={timezone}
                  onSubmit={handleBookingSubmit}
                  onBack={handleBackToDate}
                />
              )}

              {step === 'success' && booking && (
                <BookingSuccess
                  key="booking-success"
                  booking={booking}
                  onBookAnother={handleBookAnother}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
