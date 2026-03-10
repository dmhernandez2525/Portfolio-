import { useState, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { CalendarProfile } from '@/components/calendar/CalendarProfile'
import { MeetingTypeSelector } from '@/components/calendar/MeetingTypeSelector'
import { CalendarDatePicker } from '@/components/calendar/CalendarDatePicker'
import { BookingForm } from '@/components/calendar/BookingForm'
import { BookingSuccess } from '@/components/calendar/BookingSuccess'
import {
  meetingTypes,
  getVisitorTimezone,
  type MeetingType,
  type BookingFormData,
  type BookingConfirmation,
} from '@/data/calendar'
import { api } from '@/lib/api'

type BookingStep = 'select-meeting' | 'select-date' | 'confirm-booking' | 'success'

export function CalendarPage() {
  const timezone = useMemo(getVisitorTimezone, [])

  const [step, setStep] = useState<BookingStep>('select-meeting')
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingType | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedTimeLabel, setSelectedTimeLabel] = useState('')
  const [booking, setBooking] = useState<BookingConfirmation | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)

  function handleMeetingSelect(meeting: MeetingType) {
    setSelectedMeeting(meeting)
    setStep('select-date')
  }

  function handleTimeSelect(date: Date, timeRaw: string, timeLabel: string) {
    setSelectedDate(date)
    setSelectedTime(timeRaw)
    setSelectedTimeLabel(timeLabel)
    setStep('confirm-booking')
  }

  async function handleBookingSubmit(data: BookingFormData) {
    if (!selectedMeeting || !selectedDate) return

    setBookingError(null)

    try {
      const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`

      const result = await api.createBooking({
        meetingTypeId: selectedMeeting.id,
        date: dateStr,
        startTime: selectedTime,
        timezone,
        name: data.name,
        email: data.email,
        message: data.message,
      })

      const confirmation: BookingConfirmation = {
        id: result.bookingId,
        meetingType: selectedMeeting,
        date: dateStr,
        timeLabel: selectedTimeLabel,
        timezone,
        guestName: data.name,
        guestEmail: data.email,
      }

      setBooking(confirmation)
      setStep('success')
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Booking failed. Please try again.')
    }
  }

  function handleBookAnother() {
    setStep('select-meeting')
    setSelectedMeeting(null)
    setSelectedDate(null)
    setSelectedTime('')
    setSelectedTimeLabel('')
    setBooking(null)
    setBookingError(null)
  }

  function handleBackToMeetings() {
    setStep('select-meeting')
    setSelectedMeeting(null)
  }

  function handleBackToDate() {
    setStep('select-date')
    setBookingError(null)
  }

  return (
    <div className="min-h-screen bg-[#0a1214] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">
          {/* Profile sidebar */}
          <div className="lg:border-r lg:border-[#1a2e32] lg:pr-8">
            <CalendarProfile />
          </div>

          {/* Booking flow */}
          <div className="min-w-0">
            {bookingError && (
              <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-700/40 text-sm text-red-300">
                {bookingError}
              </div>
            )}

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
