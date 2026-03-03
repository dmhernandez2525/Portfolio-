export interface AvailabilitySlot {
  day: string
  startHour: number
  endHour: number
}

const DEFAULT_SCHEDULE: AvailabilitySlot[] = [
  { day: "Monday", startHour: 9, endHour: 17 },
  { day: "Tuesday", startHour: 9, endHour: 17 },
  { day: "Wednesday", startHour: 9, endHour: 17 },
  { day: "Thursday", startHour: 9, endHour: 17 },
  { day: "Friday", startHour: 9, endHour: 17 },
]

export function getAvailability(): AvailabilitySlot[] {
  return DEFAULT_SCHEDULE
}

export function isCurrentlyAvailable(schedule: AvailabilitySlot[] = DEFAULT_SCHEDULE): boolean {
  const now = new Date()
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" })
  const currentHour = now.getHours()

  return schedule.some(
    (slot) => slot.day === dayName && currentHour >= slot.startHour && currentHour < slot.endHour,
  )
}

export function getVisitorTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return "UTC"
  }
}

export function formatTimeInTimezone(hour: number, timezone: string): string {
  const date = new Date()
  date.setHours(hour, 0, 0, 0)
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  })
}
