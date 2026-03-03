// ========================================
// CALENDAR BOOKING - DATA & LOGIC
// ========================================

// ----------------------------------------
// TYPES
// ----------------------------------------

export interface MeetingType {
  id: string
  title: string
  duration: number // minutes
  description: string
  color: string // tailwind color name
}

export interface TimeSlot {
  hour: number
  minute: number
  label: string // formatted for display in visitor timezone
  available: boolean
}

export interface BookingFormData {
  name: string
  email: string
  message?: string
}

export interface BookingConfirmation {
  id: string
  meetingType: MeetingType
  date: string // ISO date "2026-02-10"
  timeLabel: string // formatted time string
  timezone: string
  guestName: string
  guestEmail: string
}

// ----------------------------------------
// MEETING TYPES
// ----------------------------------------

export const meetingTypes: MeetingType[] = [
  {
    id: 'quick-intro',
    title: 'Quick Intro',
    duration: 15,
    description: 'A brief introduction call. Great for initial connections and quick questions.',
    color: 'teal',
  },
  {
    id: 'coffee-chat',
    title: 'Coffee Chat',
    duration: 30,
    description: 'Casual conversation about tech, projects, or career opportunities.',
    color: 'cyan',
  },
  {
    id: 'technical-discussion',
    title: 'Technical Discussion',
    duration: 60,
    description: 'In-depth technical conversation. Architecture reviews, code walkthroughs, or consulting.',
    color: 'blue',
  },
]

// ----------------------------------------
// CONSTANTS
// ----------------------------------------

const OWNER_TIMEZONE = 'America/Chicago'
const WORK_START_HOUR = 9 // 9 AM CT
const WORK_END_HOUR = 17 // 5 PM CT
const SLOT_INTERVAL = 30 // minutes
const MAX_MONTHS_AHEAD = 2

// ----------------------------------------
// HELPERS
// ----------------------------------------

function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function isSlotBooked(dateStr: string, slotIndex: number): boolean {
  const hash = simpleHash(`${dateStr}-slot-${slotIndex}`)
  return hash % 100 < 25 // ~25% of slots appear booked
}

function padTwo(n: number): string {
  return n.toString().padStart(2, '0')
}

/**
 * Format a Date object's time in a specific timezone.
 */
function formatTimeInTimezone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  }).format(date)
}

// ----------------------------------------
// AVAILABILITY GENERATION
// ----------------------------------------

/**
 * Generate available time slots for a given date.
 * Slots are generated in the owner's timezone (CT) then displayed
 * in the visitor's timezone.
 */
export function generateAvailableSlots(
  date: Date,
  meetingDuration: number,
  visitorTimezone: string,
): TimeSlot[] {
  const dateStr = toDateString(date)
  const slots: TimeSlot[] = []

  // Latest start time: must finish by WORK_END_HOUR
  const latestStartMinutes = WORK_END_HOUR * 60 - meetingDuration

  let slotIndex = 0
  for (let minutes = WORK_START_HOUR * 60; minutes <= latestStartMinutes; minutes += SLOT_INTERVAL) {
    const hour = Math.floor(minutes / 60)
    const minute = minutes % 60

    // Create a Date in the owner's timezone for this slot
    // We build an ISO string for the owner's local time, then parse it
    const slotDateStr = `${dateStr}T${padTwo(hour)}:${padTwo(minute)}:00`
    const slotDate = createDateInTimezone(slotDateStr, OWNER_TIMEZONE)

    const available = !isSlotBooked(dateStr, slotIndex)
    const label = formatTimeInTimezone(slotDate, visitorTimezone)

    slots.push({
      hour,
      minute,
      label,
      available,
    })

    slotIndex++
  }

  return slots
}

/**
 * Create a Date object that represents the given local time in a specific timezone.
 */
function createDateInTimezone(localDateTimeStr: string, timezone: string): Date {
  // Get the UTC offset for this timezone at this approximate time
  // by creating a temporary date and formatting it
  const tempDate = new Date(localDateTimeStr + 'Z') // treat as UTC temporarily
  const utcStr = tempDate.toLocaleString('en-US', { timeZone: 'UTC' })
  const tzStr = tempDate.toLocaleString('en-US', { timeZone: timezone })

  // Parse both strings to get the offset in ms
  const utcMs = new Date(utcStr).getTime()
  const tzMs = new Date(tzStr).getTime()
  const offsetMs = utcMs - tzMs

  return new Date(tempDate.getTime() + offsetMs)
}

// ----------------------------------------
// CALENDAR HELPERS
// ----------------------------------------

export function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = padTwo(date.getMonth() + 1)
  const d = padTwo(date.getDate())
  return `${y}-${m}-${d}`
}

export function isWeekday(date: Date): boolean {
  const day = date.getDay()
  return day !== 0 && day !== 6
}

export function isToday(date: Date): boolean {
  const now = new Date()
  return toDateString(date) === toDateString(now)
}

export function isPast(date: Date): boolean {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const compare = new Date(date)
  compare.setHours(0, 0, 0, 0)
  return compare < now
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateString(a) === toDateString(b)
}

/**
 * Get the calendar grid for a given month.
 * Returns an array of 42 cells (6 rows x 7 cols).
 * null = padding cell from adjacent month.
 */
export function getMonthGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const grid: (Date | null)[] = []

  // Leading padding
  for (let i = 0; i < firstDay; i++) {
    grid.push(null)
  }

  // Actual days
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push(new Date(year, month, d))
  }

  // Trailing padding to fill 6 rows (42 cells)
  while (grid.length < 42) {
    grid.push(null)
  }

  return grid
}

/**
 * Check if a month/year is within the allowed booking range.
 */
export function isMonthInRange(year: number, month: number): boolean {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const monthsDiff = (year - currentYear) * 12 + (month - currentMonth)
  return monthsDiff >= 0 && monthsDiff <= MAX_MONTHS_AHEAD
}

/**
 * Get the visitor's timezone.
 */
export function getVisitorTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Format a date for display.
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

/**
 * Generate a pseudo-random booking ID.
 */
export function generateBookingId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let id = 'CAL-'
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

/**
 * Month names for the calendar header.
 */
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
