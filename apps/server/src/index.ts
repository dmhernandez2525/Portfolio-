import express from "express"
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

// Routes
app.use("/api/health", healthRouter)
app.use("/api/booking", bookingRouter)

app.listen(PORT, () => {
  console.log(`Portfolio API server running on port ${PORT}`)
})
