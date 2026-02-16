const RATE_LIMIT_KEY = "portfolio:contact-submissions"
const MAX_SUBMISSIONS_PER_HOUR = 3

interface SubmissionRecord {
  timestamps: number[]
}

function getSubmissions(): SubmissionRecord {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY)
    return raw ? JSON.parse(raw) : { timestamps: [] }
  } catch {
    return { timestamps: [] }
  }
}

function saveSubmissions(record: SubmissionRecord): void {
  try {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(record))
  } catch {
    // Storage unavailable
  }
}

export function isRateLimited(): boolean {
  const record = getSubmissions()
  const oneHourAgo = Date.now() - 3600000
  const recentSubmissions = record.timestamps.filter((ts) => ts > oneHourAgo)
  return recentSubmissions.length >= MAX_SUBMISSIONS_PER_HOUR
}

export function recordSubmission(): void {
  const record = getSubmissions()
  const oneHourAgo = Date.now() - 3600000
  record.timestamps = [...record.timestamps.filter((ts) => ts > oneHourAgo), Date.now()]
  saveSubmissions(record)
}

export function isHoneypotFilled(value: string): boolean {
  return value.trim().length > 0
}
