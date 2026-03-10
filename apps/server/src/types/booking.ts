import { z } from "zod"

export const BookingRequestSchema = z.object({
  meetingTypeId: z.enum(["quick-intro", "coffee-chat", "technical-discussion"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM (24h)"),
  timezone: z.string().min(1, "Timezone is required"),
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Valid email is required"),
  message: z.string().max(2000).optional(),
})

export type BookingRequest = z.infer<typeof BookingRequestSchema>

export const AvailabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  meetingTypeId: z.enum(["quick-intro", "coffee-chat", "technical-discussion"]),
  timezone: z.string().min(1, "Timezone required"),
})

export type AvailabilityQuery = z.infer<typeof AvailabilityQuerySchema>

export interface TimeSlot {
  startTime: string
  label: string
  available: boolean
}

export interface MeetingTypeConfig {
  id: string
  title: string
  duration: number
  description: string
}

export const MEETING_TYPES: MeetingTypeConfig[] = [
  {
    id: "quick-intro",
    title: "Quick Intro",
    duration: 15,
    description: "A brief introduction call.",
  },
  {
    id: "coffee-chat",
    title: "Coffee Chat",
    duration: 30,
    description: "Casual conversation about tech, projects, or opportunities.",
  },
  {
    id: "technical-discussion",
    title: "Technical Discussion",
    duration: 60,
    description: "In-depth technical conversation, architecture review, or consulting.",
  },
]
