import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, Calendar, Clock, Globe, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { MeetingType, BookingFormData } from '@/data/calendar'
import { formatDateShort } from '@/data/calendar'

const bookingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  message: z.string().optional(),
})

interface BookingFormProps {
  meeting: MeetingType
  date: Date
  timeLabel: string
  timezone: string
  onSubmit: (data: BookingFormData) => void
  onBack: () => void
}

export function BookingForm({ meeting, date, timeLabel, timezone, onSubmit, onBack }: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  })

  async function handleFormSubmit(data: BookingFormData) {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    onSubmit(data)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back button */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg text-[#6b8a8e] hover:text-teal-400 hover:bg-[#111a1e] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h3 className="text-lg font-semibold text-white">Confirm Booking</h3>
      </div>

      {/* Summary */}
      <div className="p-4 rounded-xl bg-[#111a1e] border border-[#1a2e32] mb-6">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-2 text-white">
            <Calendar className="w-4 h-4 text-teal-400" />
            <span>{formatDateShort(date)}</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <Clock className="w-4 h-4 text-teal-400" />
            <span>{timeLabel} ({meeting.duration} min)</span>
          </div>
          <div className="flex items-center gap-2 text-[#6b8a8e]">
            <Globe className="w-3.5 h-3.5" />
            <span className="text-xs">{timezone}</span>
          </div>
        </div>
        <p className="text-xs text-[#6b8a8e] mt-2">{meeting.title}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="booking-name" className="text-[#8a9a9e]">Name</Label>
            <Input
              id="booking-name"
              placeholder="Your name"
              {...register('name')}
              className={`bg-[#111a1e] border-[#1a2e32] text-white placeholder:text-[#3a4a4e] focus:border-teal-700 ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="booking-email" className="text-[#8a9a9e]">Email</Label>
            <Input
              id="booking-email"
              type="email"
              placeholder="your@email.com"
              {...register('email')}
              className={`bg-[#111a1e] border-[#1a2e32] text-white placeholder:text-[#3a4a4e] focus:border-teal-700 ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="booking-message" className="text-[#8a9a9e]">
            Message <span className="text-[#3a4a4e]">(optional)</span>
          </Label>
          <Textarea
            id="booking-message"
            placeholder="Anything you'd like to discuss..."
            {...register('message')}
            className="bg-[#111a1e] border-[#1a2e32] text-white placeholder:text-[#3a4a4e] focus:border-teal-700 min-h-[80px]"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-teal-600 hover:bg-teal-500 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Booking...
            </>
          ) : (
            <>
              Confirm Booking <Send className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </motion.div>
  )
}
