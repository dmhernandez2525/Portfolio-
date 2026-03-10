import express, { type Request, type Response, type NextFunction } from "express"
import cors from "cors"
import helmet from "helmet"
import { bookingRouter } from "./routes/booking.js"
import { healthRouter } from "./routes/health.js"

const app = express()
const PORT = parseInt(process.env.PORT ?? "3001", 10)

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://brainydeveloper.com",
  "https://www.brainydeveloper.com",
  "https://portfolio-site.onrender.com",
]

if (process.env.NODE_ENV !== "production") {
  ALLOWED_ORIGINS.push("http://localhost:5173", "http://localhost:5174", "http://localhost:3000")
}

app.use(helmet())
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`))
      }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  }),
)
app.use(express.json({ limit: "10kb" }))

// Simple in-memory rate limiter for booking creation
const bookingAttempts = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX = 5 // max bookings per window per IP

function rateLimit(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip ?? req.socket.remoteAddress ?? "unknown"
  const now = Date.now()
  const entry = bookingAttempts.get(ip)

  if (!entry || now > entry.resetAt) {
    bookingAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    next()
    return
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    res.status(429).json({ error: "Too many booking requests. Please try again later." })
    return
  }

  entry.count++
  next()
}

// Clean up stale rate limit entries every 30 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of bookingAttempts) {
    if (now > entry.resetAt) bookingAttempts.delete(key)
  }
}, 30 * 60 * 1000)

// Routes
app.use("/api/health", healthRouter)
app.use("/api/booking/create", rateLimit)
app.use("/api/booking", bookingRouter)

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err.message)
  res.status(500).json({ error: "Internal server error" })
})

app.listen(PORT, () => {
  console.log(`Portfolio API server running on port ${PORT}`)
})
