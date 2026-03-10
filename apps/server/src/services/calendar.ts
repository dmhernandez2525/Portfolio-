import { randomUUID } from "node:crypto"
import { google, type calendar_v3 } from "googleapis"
import { MEETING_TYPES, type TimeSlot, type BookingRequest } from "../types/booking.js"

const OWNER_TIMEZONE = "America/Chicago"
const WORK_START_HOUR = 9
const WORK_END_HOUR = 17
const SLOT_INTERVAL_MINUTES = 30
const MAX_MONTHS_AHEAD = 2

function getCalendarClient(): calendar_v3.Calendar {
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!credentialsJson) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set")
  }

  const credentials = JSON.parse(credentialsJson)
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  })

  return google.calendar({ version: "v3", auth })
}

function getCalendarId(): string {
  const calendarId = process.env.GOOGLE_CALENDAR_ID
  if (!calendarId) {
    throw new Error("GOOGLE_CALENDAR_ID environment variable is not set")
  }
  return calendarId
}

function padTwo(n: number): string {
  return n.toString().padStart(2, "0")
}

function formatTimeInTimezone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  }).format(date)
}

function createDateInTimezone(localDateTimeStr: string, timezone: string): Date {
  const tempDate = new Date(localDateTimeStr + "Z")
  const utcStr = tempDate.toLocaleString("en-US", { timeZone: "UTC" })
  const tzStr = tempDate.toLocaleString("en-US", { timeZone: timezone })
  const utcMs = new Date(utcStr).getTime()
  const tzMs = new Date(tzStr).getTime()
  const offsetMs = utcMs - tzMs
  return new Date(tempDate.getTime() + offsetMs)
}

export async function getAvailability(
  dateStr: string,
  meetingTypeId: string,
  visitorTimezone: string,
): Promise<TimeSlot[]> {
  const meetingType = MEETING_TYPES.find((m) => m.id === meetingTypeId)
  if (!meetingType) throw new Error(`Unknown meeting type: ${meetingTypeId}`)

  const calendar = getCalendarClient()
  const calendarId = getCalendarId()

  // Build time range for the day in owner timezone
  const dayStart = createDateInTimezone(`${dateStr}T00:00:00`, OWNER_TIMEZONE)
  const dayEnd = createDateInTimezone(`${dateStr}T23:59:59`, OWNER_TIMEZONE)

  // Fetch existing events for this day
  const eventsResponse = await calendar.events.list({
    calendarId,
    timeMin: dayStart.toISOString(),
    timeMax: dayEnd.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  })

  const busyPeriods = (eventsResponse.data.items ?? [])
    .filter((e) => e.start?.dateTime && e.end?.dateTime)
    .map((e) => ({
      start: new Date(e.start!.dateTime!).getTime(),
      end: new Date(e.end!.dateTime!).getTime(),
    }))

  // Check if the requested date is valid
  const requestedDate = new Date(dateStr + "T12:00:00Z")
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const maxDate = new Date(today)
  maxDate.setMonth(maxDate.getMonth() + MAX_MONTHS_AHEAD)

  if (requestedDate < today || requestedDate > maxDate) {
    return []
  }

  // Check if it's a weekday
  const dayOfWeek = requestedDate.getUTCDay()
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return []
  }

  // Generate slots
  const latestStartMinutes = WORK_END_HOUR * 60 - meetingType.duration
  const slots: TimeSlot[] = []

  for (let minutes = WORK_START_HOUR * 60; minutes <= latestStartMinutes; minutes += SLOT_INTERVAL_MINUTES) {
    const hour = Math.floor(minutes / 60)
    const minute = minutes % 60

    const slotStart = createDateInTimezone(
      `${dateStr}T${padTwo(hour)}:${padTwo(minute)}:00`,
      OWNER_TIMEZONE,
    )
    const slotEnd = new Date(slotStart.getTime() + meetingType.duration * 60 * 1000)

    // Check if slot is in the past
    if (slotStart.getTime() <= now.getTime()) {
      continue
    }

    // Check if slot conflicts with any busy period
    const isConflict = busyPeriods.some(
      (busy) => slotStart.getTime() < busy.end && slotEnd.getTime() > busy.start,
    )

    slots.push({
      startTime: `${padTwo(hour)}:${padTwo(minute)}`,
      label: formatTimeInTimezone(slotStart, visitorTimezone),
      available: !isConflict,
    })
  }

  return slots
}

export async function createBooking(request: BookingRequest): Promise<{
  eventId: string
  meetLink: string | null
}> {
  const meetingType = MEETING_TYPES.find((m) => m.id === request.meetingTypeId)
  if (!meetingType) throw new Error(`Unknown meeting type: ${request.meetingTypeId}`)

  const calendar = getCalendarClient()
  const calendarId = getCalendarId()

  // Build start/end times
  const startDateTime = createDateInTimezone(
    `${request.date}T${request.startTime}:00`,
    OWNER_TIMEZONE,
  )
  const endDateTime = new Date(startDateTime.getTime() + meetingType.duration * 60 * 1000)

  // Verify the slot is still available
  const slots = await getAvailability(request.date, request.meetingTypeId, request.timezone)
  const targetSlot = slots.find((s) => s.startTime === request.startTime)
  if (!targetSlot || !targetSlot.available) {
    throw new Error("This time slot is no longer available. Please select another time.")
  }

  // Create the calendar event
  const event = await calendar.events.insert({
    calendarId,
    conferenceDataVersion: 1,
    requestBody: {
      summary: `${meetingType.title} with ${request.name}`,
      description: [
        `Meeting Type: ${meetingType.title} (${meetingType.duration} min)`,
        `Guest: ${request.name}`,
        `Email: ${request.email}`,
        request.message ? `\nMessage:\n${request.message}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: OWNER_TIMEZONE,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: OWNER_TIMEZONE,
      },
      attendees: [{ email: request.email, displayName: request.name }],
      conferenceData: {
        createRequest: {
          requestId: randomUUID(),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 60 },
          { method: "popup", minutes: 15 },
        ],
      },
    },
  })

  return {
    eventId: event.data.id ?? "",
    meetLink: event.data.hangoutLink ?? null,
  }
}
