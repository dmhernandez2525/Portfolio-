import { MEETING_TYPES, type BookingRequest } from "../types/booking.js"

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit"

export async function sendBookingNotification(
  request: BookingRequest,
  eventId: string,
  meetLink: string | null,
): Promise<void> {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY
  if (!accessKey) {
    console.warn("WEB3FORMS_ACCESS_KEY not set, skipping email notification")
    return
  }

  const meetingType = MEETING_TYPES.find((m) => m.id === request.meetingTypeId)
  const meetingTitle = meetingType?.title ?? request.meetingTypeId
  const duration = meetingType?.duration ?? 30

  const body = {
    access_key: accessKey,
    subject: `New Booking: ${meetingTitle} with ${request.name}`,
    from_name: request.name,
    replyto: request.email,
    message: [
      `New meeting booked via your portfolio site.`,
      ``,
      `Meeting: ${meetingTitle} (${duration} min)`,
      `Date: ${request.date}`,
      `Time: ${request.startTime} CT`,
      `Guest timezone: ${request.timezone}`,
      ``,
      `Name: ${request.name}`,
      `Email: ${request.email}`,
      request.message ? `Message: ${request.message}` : "",
      ``,
      meetLink ? `Google Meet: ${meetLink}` : "",
      `Calendar Event ID: ${eventId}`,
    ]
      .filter(Boolean)
      .join("\n"),
  }

  const response = await fetch(WEB3FORMS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    console.error("Web3Forms notification failed:", await response.text())
  }
}
