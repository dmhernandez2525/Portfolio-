import { Router, type Request, type Response } from "express"
import { validateBody, validateQuery } from "../middleware/validate.js"
import {
  BookingRequestSchema,
  AvailabilityQuerySchema,
  MEETING_TYPES,
} from "../types/booking.js"
import { getAvailability, createBooking } from "../services/calendar.js"
import { sendBookingNotification } from "../services/notification.js"

const router = Router()

// GET /api/booking/meeting-types
router.get("/meeting-types", (_req: Request, res: Response) => {
  res.json(MEETING_TYPES)
})

// GET /api/booking/availability?date=YYYY-MM-DD&meetingTypeId=quick-intro&timezone=America/Chicago
router.get(
  "/availability",
  validateQuery(AvailabilityQuerySchema),
  async (req: Request, res: Response) => {
    try {
      const { date, meetingTypeId, timezone } = req.query as {
        date: string
        meetingTypeId: string
        timezone: string
      }

      const slots = await getAvailability(date, meetingTypeId, timezone)
      res.json({ date, meetingTypeId, timezone, slots })
    } catch (err) {
      console.error("Availability error:", err)
      const message = err instanceof Error ? err.message : "Failed to fetch availability"
      res.status(500).json({ error: message })
    }
  },
)

// POST /api/booking/create
router.post(
  "/create",
  validateBody(BookingRequestSchema),
  async (req: Request, res: Response) => {
    try {
      const booking = req.body
      const { eventId, meetLink } = await createBooking(booking)

      // Send email notification in the background
      sendBookingNotification(booking, eventId, meetLink).catch((err) =>
        console.error("Notification error:", err),
      )

      res.status(201).json({
        success: true,
        bookingId: eventId,
        meetLink,
        message: "Meeting booked successfully. You will receive a calendar invite shortly.",
      })
    } catch (err) {
      console.error("Booking error:", err)
      const message = err instanceof Error ? err.message : "Failed to create booking"
      const status = message.includes("no longer available") ? 409 : 500
      res.status(status).json({ error: message })
    }
  },
)

export { router as bookingRouter }
